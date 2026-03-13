const ScanModel = require('../models/Scan');
const VulnerabilityModel = require('../models/Vulnerability');
const scannerService = require('../services/scanner');
const fs = require('fs').promises;

// Store active scan progress and control
const scanProgress = new Map();
const scanControl = new Map(); // Store abort controllers

class ScanController {
  constructor(fastify) {
    this.fastify = fastify;
    this.scanModel = new ScanModel(fastify.pg);
    this.vulnerabilityModel = new VulnerabilityModel(fastify.pg);
  }

  async getProgress(request, reply) {
    const scanId = request.params.id;
    const progress = scanProgress.get(parseInt(scanId)) || { progress: 0, message: 'Initializing...' };
    return progress;
  }

  async getAll(request, reply) {
    try {
      const scans = await this.scanModel.findByUserId(request.user.id);
      return scans;
    } catch (error) {
      console.error('Get scans error:', error);
      return reply.code(500).send({ error: 'Failed to fetch scans' });
    }
  }

  async getById(request, reply) {
    try {
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
              const severity = alert.risk?.toLowerCase() || 'info';
              await this.vulnerabilityModel.create(
                scan.id,
                alert.alert.substring(0, 255),
                severity,
                alert.description?.substring(0, 1000)
              );
              vulnCount++;
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
                  const title = vuln.info?.name || vuln['template-id'] || 'Unknown';
                  const severity = vuln.info?.severity || 'info';
                  
                  await this.vulnerabilityModel.create(
                    scan.id,
                    title.substring(0, 255),
                    severity
                  );
                  vulnCount++;
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
          
          // Clean up progress after 5 minutes
          setTimeout(() => scanProgress.delete(scan.id), 300000);
        } catch (error) {
          console.error('Scan error:', error);
          scanProgress.set(scan.id, { progress: 0, message: `Error: ${error.message}` });
          await this.scanModel.updateStatus(scan.id, 'Failed');
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
