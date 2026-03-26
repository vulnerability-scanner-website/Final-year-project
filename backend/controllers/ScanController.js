const ScanModel = require('../models/Scan');
const VulnerabilityModel = require('../models/Vulnerability');
const NotificationModel = require('../models/Notification');
const scannerService = require('../services/scanner');
const AIClassifier = require('../services/aiClassifier');
const fs = require('fs').promises;
const scanStorage = require('../config/scan-storage');

// Store active scan progress and control
const scanProgress = new Map();
const scanControl = new Map(); // Store abort controllers
const scanResults = new Map(); // Store scan results in memory

class ScanController {
  constructor(fastify) {
    this.fastify = fastify;
    this.scanModel = new ScanModel(fastify.pg);
    this.vulnerabilityModel = new VulnerabilityModel(fastify.pg);
    this.notificationModel = new NotificationModel(fastify.pg);
    this.aiClassifier = new AIClassifier(process.env.COLAB_URL);
  }

  async getProgress(request, reply) {
    const scanId = request.params.id;
    const progress = scanProgress.get(parseInt(scanId)) || { progress: 0, message: 'Initializing...' };
    return progress;
  }

  async getAll(request, reply) {
    try {
      if (scanStorage.TEMPORARY_SCAN_MODE) {
        // Return in-memory scans only
        const scans = [];
        for (const [scanId, result] of scanResults.entries()) {
          scans.push({
            id: scanId,
            target: result.target,
            status: result.status,
            created_at: result.created_at,
            issues: result.vulnerabilities?.length || 0
          });
        }
        return scans;
      }
      
      const scans = await this.scanModel.findByUserId(request.user.id);
      return scans;
    } catch (error) {
      console.error('Get scans error:', error);
      return reply.code(500).send({ error: 'Failed to fetch scans' });
    }
  }

  async getById(request, reply) {
    try {
      const scanId = parseInt(request.params.id);
      
      if (scanStorage.TEMPORARY_SCAN_MODE) {
        // Return from memory
        const scan = scanResults.get(scanId);
        if (!scan) {
          return reply.code(404).send({ error: 'Scan not found or expired' });
        }
        return scan;
      }
      
      const scan = await this.scanModel.findById(request.params.id, request.user.id);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      return scan;
    } catch (error) {
      console.error('Get scan error:', error);
      return reply.code(500).send({ error: 'Failed to fetch scan' });
    }
  }

  async create(request, reply) {
    const { target, scanType } = request.body;
    
    if (!target) {
      return reply.code(400).send({ error: 'Target URL is required' });
    }

    try {
      const scan = await this.scanModel.create(request.user.id, target);

      // Notify admins: scan started
      await this.notificationModel.notifyAdmins(
        `User #${request.user.id} (${request.user.email}) started a new scan on target: ${target}`,
        'scan',
        '🔍 New Scan Started'
      );
      // Notify the user
      await this.notificationModel.create(
        request.user.id,
        `Your scan on ${target} has started. We will notify you when it completes.`,
        'scan',
        '🔍 Scan Started'
      );

      // Initialize progress
      scanProgress.set(scan.id, { progress: 0, message: 'Starting scan...' });

      // Start scan asynchronously
      setImmediate(async () => {
        try {
          let scanResults;
          
          const updateProgress = (progress, message) => {
            scanProgress.set(scan.id, { progress, message });
            console.log(`Scan ${scan.id}: ${progress}% - ${message}`);
          };
          
          if (scanType === 'zap') {
            updateProgress(5, 'Initializing ZAP scanner...');
            scanResults = { zap: await scannerService.runZap(target, scan.id, updateProgress) };
          } else if (scanType === 'full' || !scanType) {
            updateProgress(5, 'Running full scan...');
            scanResults = await scannerService.runFullScan(target, scan.id);
            updateProgress(90, 'Processing results...');
          } else if (scanType === 'nuclei') {
            updateProgress(5, 'Running Nuclei scan...');
            scanResults = { nuclei: await scannerService.runNuclei(target, scan.id) };
            updateProgress(90, 'Processing results...');
          } else if (scanType === 'nikto') {
            updateProgress(5, 'Running Nikto scan...');
            scanResults = { nikto: await scannerService.runNikto(target, scan.id) };
            updateProgress(90, 'Processing results...');
          }

          let vulnCount = 0;

          // Parse ZAP results
          if (scanResults.zap?.alerts && scanResults.zap.success) {
            for (const alert of scanResults.zap.alerts) {
              const title = alert.alert.substring(0, 255);
              const severity = alert.risk?.toLowerCase() || 'info';
              
              const vuln = await this.vulnerabilityModel.create(
                scan.id,
                title,
                severity,
                alert.description?.substring(0, 1000),
                alert.url?.substring(0, 500),
                alert.param?.substring(0, 255),
                alert.evidence?.substring(0, 1000),
                alert.solution?.substring(0, 1000),
                alert.cweid?.toString(),
                parseFloat(alert.riskdesc?.match(/\d+\.\d+/)?.[0]) || null,
                'ZAP'
              );
              vulnCount++;
              
              // Classify with AI (non-blocking)
              if (this.aiClassifier) {
                this.aiClassifier.classifyVulnerability(
                  `${title}: ${alert.description || ''}`
                ).then(aiResult => {
                  if (aiResult) {
                    this.vulnerabilityModel.updateWithAI(vuln.id, aiResult).catch(err => 
                      console.error('Failed to update AI classification:', err.message)
                    );
                  }
                }).catch(err => console.error('AI classification error:', err.message));
              }
            }
          }

          // Parse Nuclei results
          if (scanResults.nuclei?.outputFile && scanResults.nuclei.success) {
            try {
              const output = await fs.readFile(scanResults.nuclei.outputFile, 'utf-8');
              const lines = output.trim().split('\n').filter(l => l.trim());
              
              for (const line of lines) {
                try {
                  const vuln = JSON.parse(line);
                  const title = (vuln.info?.name || vuln['template-id'] || 'Unknown').substring(0, 255);
                  const severity = vuln.info?.severity || 'info';
                  
                  const vulnRecord = await this.vulnerabilityModel.create(
                    scan.id,
                    title,
                    severity,
                    vuln.info?.description?.substring(0, 1000),
                    vuln.matched_at?.substring(0, 500),
                    null,
                    vuln.extracted_results?.join(', ')?.substring(0, 1000),
                    vuln.info?.remediation?.substring(0, 1000),
                    vuln.info?.cwe_id?.toString(),
                    parseFloat(vuln.info?.cvss_score) || null,
                    'Nuclei'
                  );
                  vulnCount++;
                  
                  // Classify with AI (non-blocking)
                  if (this.aiClassifier) {
                    this.aiClassifier.classifyVulnerability(
                      `${title}: ${vuln.info?.description || ''}`
                    ).then(aiResult => {
                      if (aiResult) {
                        this.vulnerabilityModel.updateWithAI(vulnRecord.id, aiResult).catch(err => 
                          console.error('Failed to update AI classification:', err.message)
                        );
                      }
                    }).catch(err => console.error('AI classification error:', err.message));
                  }
                } catch (parseError) {
                  console.error('Failed to parse vulnerability:', parseError.message);
                }
              }
            } catch (fileError) {
              console.error('Failed to read scan results:', fileError.message);
            }
          }

          updateProgress(100, 'Scan completed');
          await this.scanModel.updateStatus(scan.id, 'Completed', vulnCount);

          // Notify admins: scan completed
          await this.notificationModel.notifyAdmins(
            `Scan #${scan.id} on ${target} completed. Found ${vulnCount} vulnerabilities.`,
            'success',
            '✅ Scan Completed'
          );
          // Notify the user
          await this.notificationModel.create(
            scan.user_id,
            `Your scan on ${target} completed. Found ${vulnCount} vulnerabilities.`,
            'success',
            '✅ Scan Completed'
          );

        } catch (error) {
          console.error('Scan error:', error);
          scanProgress.set(scan.id, { progress: 0, message: `Error: ${error.message}` });
          await this.scanModel.updateStatus(scan.id, 'Failed');

          // Notify admins: scan failed
          await this.notificationModel.notifyAdmins(
            `Scan #${scan.id} on ${target} failed. Error: ${error.message}`,
            'error',
            '❌ Scan Failed'
          );
          await this.notificationModel.create(
            scan.user_id,
            `Your scan on ${target} failed. Please try again.`,
            'error',
            '❌ Scan Failed'
          );
        }
      });

      return scan;
    } catch (error) {
      console.error('Create scan error:', error);
      return reply.code(500).send({ error: 'Failed to create scan' });
    }
  }

  async delete(request, reply) {
    try {
      const result = await this.scanModel.delete(request.params.id, request.user.id);

      if (!result) {
        return reply.code(404).send({ error: 'Scan not found' });
      }

      scanProgress.delete(parseInt(request.params.id));
      scanControl.delete(parseInt(request.params.id));

      // Notify admins: scan deleted
      await this.notificationModel.notifyAdmins(
        `User #${request.user.id} (${request.user.email}) deleted scan #${request.params.id}.`,
        'warning',
        '🗑️ Scan Deleted'
      );

      return { success: true, message: 'Scan deleted' };
    } catch (error) {
      console.error('Delete scan error:', error);
      return reply.code(500).send({ error: 'Failed to delete scan' });
    }
  }

  async pause(request, reply) {
    try {
      const scanId = parseInt(request.params.id);
      const scan = await this.scanModel.findById(scanId, request.user.id);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      if (scan.status !== 'Running') {
        return reply.code(400).send({ error: 'Only running scans can be paused' });
      }
      
      await this.scanModel.updateStatus(scanId, 'Paused');
      const progress = scanProgress.get(scanId);
      if (progress) {
        scanProgress.set(scanId, { ...progress, message: 'Scan paused' });
      }
      
      return { success: true, message: 'Scan paused' };
    } catch (error) {
      console.error('Pause scan error:', error);
      return reply.code(500).send({ error: 'Failed to pause scan' });
    }
  }

  async resume(request, reply) {
    try {
      const scanId = parseInt(request.params.id);
      const scan = await this.scanModel.findById(scanId, request.user.id);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      if (scan.status !== 'Paused') {
        return reply.code(400).send({ error: 'Only paused scans can be resumed' });
      }
      
      await this.scanModel.updateStatus(scanId, 'Running');
      const progress = scanProgress.get(scanId);
      if (progress) {
        scanProgress.set(scanId, { ...progress, message: 'Scan resumed' });
      }
      
      return { success: true, message: 'Scan resumed' };
    } catch (error) {
      console.error('Resume scan error:', error);
      return reply.code(500).send({ error: 'Failed to resume scan' });
    }
  }

  async stop(request, reply) {
    try {
      const scanId = parseInt(request.params.id);
      const scan = await this.scanModel.findById(scanId, request.user.id);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      if (scan.status !== 'Running' && scan.status !== 'Paused') {
        return reply.code(400).send({ error: 'Only running or paused scans can be stopped' });
      }
      
      await this.scanModel.updateStatus(scanId, 'Stopped');
      scanProgress.set(scanId, { progress: 0, message: 'Scan stopped' });
      scanControl.delete(scanId);
      
      return { success: true, message: 'Scan stopped' };
    } catch (error) {
      console.error('Stop scan error:', error);
      return reply.code(500).send({ error: 'Failed to stop scan' });
    }
  }

  async rerun(request, reply) {
    try {
      const scanId = parseInt(request.params.id);
      const scan = await this.scanModel.findById(scanId, request.user.id);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      // Create new scan with same target
      const newScan = await this.scanModel.create(request.user.id, scan.target);
      
      // Initialize progress
      scanProgress.set(newScan.id, { progress: 0, message: 'Starting scan...' });

      // Start scan asynchronously (reuse create logic)
      setImmediate(async () => {
        try {
          const updateProgress = (progress, message) => {
            scanProgress.set(newScan.id, { progress, message });
          };
          
          updateProgress(5, 'Running full scan...');
          const scanResults = await scannerService.runFullScan(scan.target, newScan.id);
          updateProgress(90, 'Processing results...');

          let vulnCount = 0;

          if (scanResults.zap?.alerts && scanResults.zap.success) {
            for (const alert of scanResults.zap.alerts) {
              const severity = alert.risk?.toLowerCase() || 'info';
              await this.vulnerabilityModel.create(
                newScan.id,
                alert.alert.substring(0, 255),
                severity,
                alert.description?.substring(0, 1000)
              );
              vulnCount++;
            }
          }

          updateProgress(100, 'Scan completed');
          await this.scanModel.updateStatus(newScan.id, 'Completed', vulnCount);
          setTimeout(() => scanProgress.delete(newScan.id), 300000);
        } catch (error) {
          console.error('Rerun scan error:', error);
          scanProgress.set(newScan.id, { progress: 0, message: `Error: ${error.message}` });
          await this.scanModel.updateStatus(newScan.id, 'Failed');
        }
      });
      
      return newScan;
    } catch (error) {
      console.error('Rerun scan error:', error);
      return reply.code(500).send({ error: 'Failed to rerun scan' });
    }
  }
}

module.exports = ScanController;
