const ScanModel = require('../models/Scan');
const VulnerabilityModel = require('../models/Vulnerability');
const scannerService = require('../services/scanner');
const fs = require('fs').promises;

class ScanController {
  constructor(fastify) {
    this.fastify = fastify;
    this.scanModel = new ScanModel(fastify.pg);
    this.vulnerabilityModel = new VulnerabilityModel(fastify.pg);
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

      // Start scan asynchronously
      setImmediate(async () => {
        try {
          let scanResults;
          
          if (scanType === 'zap') {
            scanResults = { zap: await scannerService.runZap(target, scan.id) };
          } else if (scanType === 'full' || !scanType) {
            scanResults = await scannerService.runFullScan(target, scan.id);
          } else if (scanType === 'nuclei') {
            scanResults = { nuclei: await scannerService.runNuclei(target, scan.id) };
          } else if (scanType === 'nikto') {
            scanResults = { nikto: await scannerService.runNikto(target, scan.id) };
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

          await this.scanModel.updateStatus(scan.id, 'Completed', vulnCount);
        } catch (error) {
          console.error('Scan error:', error);
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
      
      return { success: true, message: 'Scan deleted' };
    } catch (error) {
      console.error('Delete scan error:', error);
      return reply.code(500).send({ error: 'Failed to delete scan' });
    }
  }
}

module.exports = ScanController;
