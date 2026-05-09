const ScanModel = require('../models/Scan');
const VulnerabilityModel = require('../models/Vulnerability');
const NotificationModel = require('../models/Notification');
const scannerService = require('../services/scanner');
const CustomScanner = require('../services/customScanner');
const AIClassifier = require('../services/aiClassifier');
const SubscriptionChecker = require('../services/subscriptionChecker');
const fs = require('fs').promises;
const scanStorage = require('../config/scan-storage');
const { validator } = require('../middlewares/validation');
const rateLimiter = require('../middlewares/rateLimiter');

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
    this.customScanner = new CustomScanner();
    this.aiClassifier = new AIClassifier(process.env.COLAB_URL);
    this.subscriptionChecker = new SubscriptionChecker(fastify.pg);
  }

  async getProgress(request, reply) {
    const scanId = request.params.id;
    const progress = scanProgress.get(parseInt(scanId)) || { progress: 0, message: 'Initializing...' };
    return progress;
  }

  async getAll(request, reply) {
    try {
      if (scanStorage.TEMPORARY_SCAN_MODE) {
        const scans = [];
        for (const [scanId, result] of scanResults.entries()) {
          scans.push({ id: scanId, target: result.target, status: result.status, created_at: result.created_at, issues: result.vulnerabilities?.length || 0 });
        }
        return scans;
      }
      // Admin sees all scans, team members see owner's scans, others see only their own
      let userId;
      if (request.user.role === 'admin') {
        userId = 'admin';
      } else if (request.user.role === 'team_member') {
        userId = request.user.owner_id;
      } else {
        userId = request.user.id;
      }
      const scans = await this.scanModel.findByUserId(userId);
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
        const scan = scanResults.get(scanId);
        if (!scan) return reply.code(404).send({ error: 'Scan not found or expired' });
        return scan;
      }
      
      // Admin can view any scan, team members use owner_id
      let userId;
      if (request.user.role === 'admin') {
        userId = 'admin';
      } else if (request.user.role === 'team_member') {
        userId = request.user.owner_id;
      } else {
        userId = request.user.id;
      }
      const scan = await this.scanModel.findById(scanId, userId);
      
      if (!scan) return reply.code(404).send({ error: 'Scan not found' });
      
      return scan;
    } catch (error) {
      console.error('Get scan error:', error);
      return reply.code(500).send({ error: 'Failed to fetch scan' });
    }
  }

  async create(request, reply) {
    const { target, scanType } = request.body;
    
    // Sanitize target URL
    const sanitizedTarget = validator.sanitizeString(target, 500);

    if (!sanitizedTarget) {
      return reply.code(400).send({ error: 'Target URL is required' });
    }

    try {
      // Determine the actual user_id for scan creation
      // Team members use owner_id, regular users use their own id
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      
      // Get user subscription
      const subscription = await this.subscriptionChecker.getUserSubscription(request.user.id, request.user.role);
      
      if (!subscription) {
        return reply.code(403).send({ error: 'No subscription plan found' });
      }

      // Check access expiry (skip for admins)
      if (request.user.role !== 'admin') {
        const accessCheck = await this.subscriptionChecker.checkAccessExpiry(scanUserId, subscription);
        if (!accessCheck.valid) {
          return reply.code(403).send({
            error: 'Access expired',
            message: accessCheck.message,
            upgrade_required: true
          });
        }
      }

      // Check scan limit (skip for admins)
      if (request.user.role !== 'admin') {
        const limitCheck = await this.subscriptionChecker.checkScanLimit(scanUserId, subscription);
        if (!limitCheck.allowed) {
          return reply.code(403).send({
            error: 'Scan limit exceeded',
            message: limitCheck.message,
            used: limitCheck.used,
            limit: limitCheck.limit,
            upgrade_required: true
          });
        }
      }

      // Get allowed scanners for this subscription
      const allowedScanners = this.subscriptionChecker.getScanners(subscription);
      const hasAI = this.subscriptionChecker.hasAIAccess(subscription);

      const scan = await this.scanModel.create(scanUserId, sanitizedTarget);

      await this.notificationModel.notifyAdmins(
        `User #${scanUserId} (${request.user.email}) started a new scan on target: ${validator.sanitizeHtml(sanitizedTarget)} [Plan: ${subscription.plan_name}]`,
        'scan',
        '🔍 New Scan Started'
      );
      await this.notificationModel.create(
        scanUserId,
        `Your scan on ${validator.sanitizeHtml(sanitizedTarget)} has started. We will notify you when it completes.`,
        'scan',
        '🔍 Scan Started'
      );

      // Initialize progress
      scanProgress.set(scan.id, { progress: 0, message: 'Starting scan...' });

      // Start scan asynchronously
      setImmediate(async () => {
        try {
          let scanResults = {};
          let currentProgress = 0;
          let vulnCount = 0;
          
          const updateProgress = (progress, message) => {
            scanProgress.set(scan.id, { progress, message });
            console.log(`Scan ${scan.id}: ${progress}% - ${message}`);
          };
          
          // Run scanners based on subscription
          const scannerCount = allowedScanners.length;
          const progressPerScanner = 80 / scannerCount;

          // Custom scanner (always included)
          if (allowedScanners.includes('custom')) {
            updateProgress(currentProgress + 5, 'Running custom vulnerability scan...');
            const customResults = await this.customScanner.scan(sanitizedTarget);
            scanResults.custom = customResults;
            
            // Store custom scanner vulnerabilities
            if (customResults.vulnerabilities && customResults.vulnerabilities.length > 0) {
              for (const vuln of customResults.vulnerabilities) {
                await this.vulnerabilityModel.create(
                  scan.id,
                  vuln.title.substring(0, 255),
                  vuln.severity.toLowerCase(),
                  vuln.description?.substring(0, 1000),
                  sanitizedTarget.substring(0, 500),
                  null,
                  vuln.evidence?.substring(0, 1000),
                  vuln.recommendation?.substring(0, 1000),
                  null,
                  null,
                  'Custom Scanner'
                );
                vulnCount++;
              }
            }
            currentProgress += progressPerScanner;
          }

          // Subfinder
          if (allowedScanners.includes('subfinder')) {
            updateProgress(currentProgress, 'Running Subfinder...');
            scanResults.subfinder = await scannerService.runSubfinder(sanitizedTarget, scan.id);
            
            // Parse Subfinder results
            if (scanResults.subfinder?.outputFile && scanResults.subfinder.success) {
              try {
                const output = await fs.readFile(scanResults.subfinder.outputFile, 'utf-8');
                const subdomains = output.trim().split('\n').filter(line => line.trim());
                
                if (subdomains.length > 0) {
                  await this.vulnerabilityModel.create(
                    scan.id,
                    `Subdomains Discovered: ${subdomains.length} found`,
                    'info',
                    `Subfinder discovered ${subdomains.length} subdomains for ${scanResults.subfinder.domain}. This information can be used to map the attack surface.`,
                    sanitizedTarget.substring(0, 500),
                    null,
                    subdomains.slice(0, 10).join(', ') + (subdomains.length > 10 ? '...' : ''),
                    'Review discovered subdomains for potential security issues.',
                    null,
                    null,
                    'Subfinder'
                  );
                  vulnCount++;
                }
              } catch (fileError) {
                console.error('Failed to read Subfinder results:', fileError.message);
              }
            }
            currentProgress += progressPerScanner;
          }

          // Nikto
          if (allowedScanners.includes('nikto')) {
            updateProgress(currentProgress, 'Running Nikto scan...');
            scanResults.nikto = await scannerService.runNikto(target, scan.id);
            currentProgress += progressPerScanner;
          }

          // ZAP
          if (allowedScanners.includes('zap')) {
            updateProgress(currentProgress, 'Running ZAP scan...');
            scanResults.zap = await scannerService.runZap(target, scan.id, updateProgress);
            currentProgress += progressPerScanner;
          }

          updateProgress(85, 'Processing results...');

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
              
              // Classify with AI only for Enterprise plan
              if (hasAI && this.aiClassifier) {
                console.log(`🤖 Attempting AI classification for vulnerability: ${title}`);
                console.log(`✅ AI Classifier exists, calling classifyVulnerability...`);
                this.aiClassifier.classifyVulnerability(
                  `${title}: ${alert.description || ''}`
                ).then(aiResult => {
                  console.log(`📥 AI Result received:`, aiResult);
                  if (aiResult) {
                    console.log(`✓ AI: ${title} → ${aiResult.type} (${Math.round(aiResult.confidence * 100)}%)`);
                    return this.vulnerabilityModel.updateWithAI(vuln.id, aiResult);
                  } else {
                    console.log(`⚠️  AI returned null result for: ${title}`);
                  }
                }).then(updated => {
                  if (updated) {
                    console.log(`✅ DB Updated: Vulnerability ${vuln.id} with AI data`);
                  }
                }).catch(err => {
                  console.error('❌ AI classification/update error:', err.message);
                  console.error('Full error:', err);
                });
              } else {
                console.log(`❌ AI Classifier not available`);
              }
            }
          }

          // Parse Nikto results
          if (scanResults.nikto?.outputFile && scanResults.nikto.success) {
            try {
              const output = await fs.readFile(scanResults.nikto.outputFile, 'utf-8');
              const niktoData = JSON.parse(output);
              
              if (niktoData.vulnerabilities && Array.isArray(niktoData.vulnerabilities)) {
                for (const vuln of niktoData.vulnerabilities) {
                  const severity = vuln.OSVDB && vuln.OSVDB !== '0' ? 'medium' : 'low';
                  await this.vulnerabilityModel.create(
                    scan.id,
                    (vuln.msg || 'Nikto Finding').substring(0, 255),
                    severity,
                    vuln.msg?.substring(0, 1000),
                    vuln.url?.substring(0, 500) || sanitizedTarget.substring(0, 500),
                    null,
                    vuln.method ? `Method: ${vuln.method}` : null,
                    'Review and remediate the identified issue.',
                    vuln.OSVDB && vuln.OSVDB !== '0' ? `OSVDB-${vuln.OSVDB}` : null,
                    null,
                    'Nikto'
                  );
                  vulnCount++;
                }
              }
            } catch (fileError) {
              console.error('Failed to read Nikto results:', fileError.message);
            }
          }

          updateProgress(100, 'Scan completed');
          await this.scanModel.updateStatus(scan.id, 'Completed', vulnCount);

          // Notify admins: scan completed
          await this.notificationModel.notifyAdmins(
            `Scan #${scan.id} on ${target} completed. Found ${vulnCount} vulnerabilities. [Plan: ${subscription.plan_name}]`,
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
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      const result = await this.scanModel.delete(request.params.id, scanUserId);

      if (!result) {
        return reply.code(404).send({ error: 'Scan not found' });
      }

      scanProgress.delete(parseInt(request.params.id));
      scanControl.delete(parseInt(request.params.id));

      // Notify admins: scan deleted
      await this.notificationModel.notifyAdmins(
        `User #${scanUserId} (${request.user.email}) deleted scan #${request.params.id}.`,
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
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      const scan = await this.scanModel.findById(scanId, scanUserId);
      
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
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      const scan = await this.scanModel.findById(scanId, scanUserId);
      
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
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      const scan = await this.scanModel.findById(scanId, scanUserId);
      
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
      const scanUserId = request.user.role === 'team_member' ? request.user.owner_id : request.user.id;
      const scan = await this.scanModel.findById(scanId, scanUserId);
      
      if (!scan) {
        return reply.code(404).send({ error: 'Scan not found' });
      }
      
      // Create new scan with same target
      const newScan = await this.scanModel.create(scanUserId, scan.target);
      
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
