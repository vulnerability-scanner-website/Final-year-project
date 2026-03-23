const scannerService = require('../services/scanner');
const AIClassifier = require('../services/aiClassifier');
const fs = require('fs').promises;

// In-memory storage only
const scanProgress = new Map();
const scanResults = new Map();
let scanIdCounter = 1;

class MemoryScanController {
  constructor(fastify) {
    this.fastify = fastify;
    // Initialize AI Classifier with Colab URL
    const colabUrl = process.env.COLAB_URL;
    console.log(`🤖 AI Classifier initialized with Colab URL: ${colabUrl}`);
    this.aiClassifier = new AIClassifier(colabUrl);
  }

  async getProgress(request, reply) {
    const scanId = parseInt(request.params.id);
    const progress = scanProgress.get(scanId) || { progress: 0, message: 'Initializing...' };
    return progress;
  }

  async getAll(request, reply) {
    const scans = [];
    
    // Get from memory first
    for (const [scanId, result] of scanResults.entries()) {
      scans.push({
        id: scanId,
        target: result.target,
        status: result.status,
        created_at: result.created_at,
        issues: result.vulnerabilities?.length || 0
      });
    }
    
    // Also fetch from database
    try {
      const client = await this.fastify.pg.connect();
      try {
        const result = await client.query(
          'SELECT id, target, status, created_at, vulnerabilities_data FROM scans ORDER BY created_at DESC LIMIT 100'
        );
        for (const row of result.rows) {
          // Only add if not already in memory
          if (!scanResults.has(row.id)) {
            const vulns = JSON.parse(row.vulnerabilities_data || '[]');
            scans.push({
              id: row.id,
              target: row.target,
              status: row.status,
              created_at: row.created_at,
              issues: vulns.length
            });
          }
        }
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.warn(`Failed to fetch scans from database: ${dbError.message}`);
    }
    
    return scans;
  }

  async getById(request, reply) {
    const scanId = parseInt(request.params.id);
    let scan = scanResults.get(scanId);
    
    // If not in memory, try to fetch from database
    if (!scan) {
      try {
        const client = await this.fastify.pg.connect();
        try {
          const result = await client.query(
            'SELECT id, target, status, created_at, finished_at, vulnerabilities_data FROM scans WHERE id = $1',
            [scanId]
          );
          if (result.rows.length > 0) {
            const row = result.rows[0];
            scan = {
              id: row.id,
              target: row.target,
              status: row.status,
              created_at: row.created_at,
              finished_at: row.finished_at,
              vulnerabilities: JSON.parse(row.vulnerabilities_data || '[]')
            };
            // Cache in memory
            scanResults.set(scanId, scan);
          }
        } finally {
          client.release();
        }
      } catch (dbError) {
        console.warn(`Failed to fetch from database: ${dbError.message}`);
      }
    }
    
    if (!scan) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    
    return scan;
  }

  async getVulnerabilitiesByScanId(request, reply) {
    const scanId = parseInt(request.params.scanId);
    const scan = scanResults.get(scanId);
    
    if (!scan) {
      return reply.code(404).send({ error: 'Scan not found or expired' });
    }
    
    return scan.vulnerabilities || [];
  }

  async create(request, reply) {
    const { target, scanType } = request.body;
    
    if (!target) {
      return reply.code(400).send({ error: 'Target URL is required' });
    }

    const scanId = scanIdCounter++;
    const createdAt = new Date().toISOString();
    
    // Initialize in memory
    scanResults.set(scanId, {
      id: scanId,
      target,
      status: 'Running',
      created_at: createdAt,
      vulnerabilities: []
    });
    
    scanProgress.set(scanId, { progress: 0, message: 'Starting scan...' });

    // Start scan asynchronously
    setImmediate(async () => {
      try {
        const updateProgress = (progress, message) => {
          scanProgress.set(scanId, { progress, message });
          console.log(`Scan ${scanId}: ${progress}% - ${message}`);
        };
        
        let scanResultsData;
        
        if (scanType === 'zap') {
          updateProgress(5, 'Initializing ZAP scanner...');
          scanResultsData = { zap: await scannerService.runZap(target, scanId, updateProgress) };
        } else if (scanType === 'full' || !scanType) {
          updateProgress(5, 'Running full scan...');
          scanResultsData = await scannerService.runFullScan(target, scanId);
          updateProgress(90, 'Processing results...');
        } else if (scanType === 'nuclei') {
          updateProgress(5, 'Running Nuclei scan...');
          scanResultsData = { nuclei: await scannerService.runNuclei(target, scanId) };
          updateProgress(90, 'Processing results...');
        } else if (scanType === 'nikto') {
          updateProgress(5, 'Running Nikto scan...');
          scanResultsData = { nikto: await scannerService.runNikto(target, scanId) };
          updateProgress(90, 'Processing results...');
        }

        updateProgress(90, 'Processing results...');
        
        const vulnerabilities = [];

        // Process ZAP results
        if (scanResultsData.zap?.alerts && scanResultsData.zap.success) {
          for (const alert of scanResultsData.zap.alerts) {
            const title = alert.alert || alert.name;
            const severity = alert.risk?.toLowerCase() || 'info';
            
            const vuln = {
              id: `zap-${vulnerabilities.length}`,
              title,
              severity,
              description: alert.description,
              url: alert.url,
              param: alert.param || '',
              evidence: alert.evidence || '',
              solution: alert.solution,
              cwe: alert.cweid && alert.cweid !== '-1' ? alert.cweid : null,
              cvss_score: null,
              reference: alert.reference,
              source: 'ZAP'
            };
            
            // Add AI classification (non-blocking)
            if (this.aiClassifier) {
              this.aiClassifier.classifyVulnerability(
                `${title}: ${alert.description || ''}`
              ).then(aiResult => {
                if (aiResult) {
                  vuln.ai_type = aiResult.type;
                  vuln.ai_confidence = aiResult.confidence;
                  console.log(`✓ AI: ${title} → ${aiResult.type} (${Math.round(aiResult.confidence * 100)}%)`);
                }
              }).catch(err => {
                console.warn(`⚠️  AI classification failed for ${title}: ${err.message}`);
              });
            }
            
            vulnerabilities.push(vuln);
            console.log(`✓ ZAP: ${title} (${severity})`);
          }
        }

        // Process Nuclei results
        if (scanResultsData.nuclei?.outputFile && scanResultsData.nuclei.success) {
          try {
            const output = await fs.readFile(scanResultsData.nuclei.outputFile, 'utf-8');
            const lines = output.trim().split('\n').filter(l => l.trim());
            
            for (const line of lines) {
              try {
                const vuln_data = JSON.parse(line);
                const title = (vuln_data.info?.name || vuln_data['template-id'] || 'Unknown');
                const severity = vuln_data.info?.severity || 'info';
                
                const vuln = {
                  id: `nuclei-${vulnerabilities.length}`,
                  title,
                  severity,
                  description: vuln_data.info?.description,
                  url: vuln_data.matched_at,
                  evidence: vuln_data.extracted_results?.join(', '),
                  solution: vuln_data.info?.remediation,
                  cwe: vuln_data.info?.cwe_id,
                  cvss_score: parseFloat(vuln_data.info?.cvss_score) || null,
                  source: 'Nuclei'
                };
                
                // Add AI classification (non-blocking)
                if (this.aiClassifier) {
                  this.aiClassifier.classifyVulnerability(
                    `${title}: ${vuln_data.info?.description || ''}`
                  ).then(aiResult => {
                    if (aiResult) {
                      vuln.ai_type = aiResult.type;
                      vuln.ai_confidence = aiResult.confidence;
                      console.log(`✓ AI: ${title} → ${aiResult.type} (${Math.round(aiResult.confidence * 100)}%)`);
                    }
                  }).catch(err => {
                    console.warn(`⚠️  AI classification failed for ${title}: ${err.message}`);
                  });
                }
                
                vulnerabilities.push(vuln);
                console.log(`✓ Nuclei: ${title} (${severity})`);
              } catch (parseError) {
                console.error('Failed to parse Nuclei result:', parseError.message);
              }
            }
          } catch (fileError) {
            console.error('Failed to read Nuclei output:', fileError.message);
          }
        }


        // Update scan result in memory AND save to database
        const scanData = {
          id: scanId,
          target,
          status: 'Completed',
          created_at: createdAt,
          finished_at: new Date().toISOString(),
          vulnerabilities
        };
        
        scanResults.set(scanId, scanData);
        
        // Save to database
        try {
          const client = await this.fastify.pg.connect();
          try {
            await client.query(
              'INSERT INTO scans (target, status, created_at, finished_at, vulnerabilities_data) VALUES ($1, $2, $3, $4, $5)',
              [target, 'Completed', createdAt, new Date().toISOString(), JSON.stringify(vulnerabilities)]
            );
            console.log(`Scan ${scanId} saved to database`);
          } finally {
            client.release();
          }
        } catch (dbError) {
          console.warn(`Failed to save scan to database: ${dbError.message}`);
        }
        
      } catch (error) {
        console.error('Scan error:', error);
        scanProgress.set(scanId, { progress: 0, message: `Error: ${error.message}` });
        scanResults.set(scanId, {
          ...scanResults.get(scanId),
          status: 'Failed'
        });
      }
    });

    return { id: scanId, target, status: 'Running' };
  }

  async delete(request, reply) {
    const scanId = parseInt(request.params.id);
    
    if (!scanResults.has(scanId)) {
      return reply.code(404).send({ error: 'Scan not found' });
    }
    
    scanResults.delete(scanId);
    scanProgress.delete(scanId);
    
    return { success: true, message: 'Scan deleted from memory' };
  }
}

module.exports = MemoryScanController;
