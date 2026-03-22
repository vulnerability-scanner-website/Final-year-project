const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const execAsync = promisify(exec);

class ScannerService {
  constructor() {
    this.scannerContainer = 'security-scanner-tools';
    this.zapUrl = 'http://security-scanner-zap:8090';
  }

  async runZap(target, scanId, progressCallback) {
    try {
      // Convert localhost to container name for internal scanning
      let scanTarget = target;
      if (target.includes('localhost:8080')) {
        scanTarget = 'http://dvwa-target:80';
      } else if (target.includes('localhost:5001')) {
        scanTarget = 'http://security-scanner-backend:5000';
      } else if (target.includes('localhost:8888')) {
        scanTarget = 'http://vulnerable-app:80';
      }
      
      console.log(`ZAP scanning target: ${scanTarget}`);
      if (progressCallback) progressCallback(10, 'Starting ZAP spider scan...');
      
      // Configure ZAP for thorough scanning
      try {
        await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxDepth/`, {
          params: { Integer: 15 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set spider max depth:', e.message);
      }
      
      try {
        await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxChildren/`, {
          params: { Integer: 100 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set spider max children:', e.message);
      }
      
      try {
        await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxDuration/`, {
          params: { Integer: 15 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set spider max duration:', e.message);
      }
      
      // Start spider scan
      let spiderRes;
      try {
        spiderRes = await axios.get(`${this.zapUrl}/JSON/spider/action/scan/`, {
          params: { url: scanTarget },
          timeout: 30000
        });
      } catch (error) {
        console.error('Spider scan start failed:', error.response?.status, error.message);
        throw new Error(`Failed to start spider scan: ${error.message}`);
      }
      
      const spiderId = spiderRes.data.scan;
      console.log(`Spider scan started with ID: ${spiderId}`);

      // Wait for spider to complete
      let spiderStatus = 0;
      let spiderAttempts = 0;
      while (spiderStatus < 100 && spiderAttempts < 300) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const statusRes = await axios.get(`${this.zapUrl}/JSON/spider/view/status/`, {
            params: { scanId: spiderId },
            timeout: 10000
          });
          spiderStatus = parseInt(statusRes.data.status);
          if (progressCallback) progressCallback(10 + (spiderStatus * 0.2), `Spider scan: ${spiderStatus}%`);
          spiderAttempts++;
        } catch (error) {
          console.warn('Error checking spider status:', error.message);
          spiderAttempts++;
        }
      }

      if (progressCallback) progressCallback(35, 'Starting active scan (this may take 10-30 minutes)...');
      
      // Configure active scan for thorough scanning
      try {
        await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionMaxRuleDurationInMins/`, {
          params: { Integer: 10 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set ascan max rule duration:', e.message);
      }
      
      try {
        await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionMaxScanDurationInMins/`, {
          params: { Integer: 60 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set ascan max scan duration:', e.message);
      }
      
      try {
        await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionThreadPerHost/`, {
          params: { Integer: 16 },
          timeout: 10000
        });
      } catch (e) {
        console.warn('Could not set ascan thread per host:', e.message);
      }
      
      // Start active scan
      let scanRes;
      try {
        scanRes = await axios.get(`${this.zapUrl}/JSON/ascan/action/scan/`, {
          params: { url: scanTarget },
          timeout: 30000
        });
      } catch (error) {
        console.error('Active scan start failed:', error.response?.status, error.message);
        throw new Error(`Failed to start active scan: ${error.message}`);
      }
      
      const scanIdZap = scanRes.data.scan;
      console.log(`Active scan started with ID: ${scanIdZap}`);

      // Wait for active scan to complete
      let scanStatus = 0;
      let scanAttempts = 0;
      while (scanStatus < 100 && scanAttempts < 600) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
          const statusRes = await axios.get(`${this.zapUrl}/JSON/ascan/view/status/`, {
            params: { scanId: scanIdZap },
            timeout: 10000
          });
          scanStatus = parseInt(statusRes.data.status);
          if (progressCallback) progressCallback(35 + (scanStatus * 0.6), `Active scan: ${scanStatus}%`);
          scanAttempts++;
        } catch (error) {
          console.warn('Error checking active scan status:', error.message);
          scanAttempts++;
        }
      }

      if (progressCallback) progressCallback(95, 'Collecting results...');
      
      // Get alerts
      let alertsRes;
      try {
        alertsRes = await axios.get(`${this.zapUrl}/JSON/core/view/alerts/`, {
          params: { baseurl: scanTarget },
          timeout: 30000
        });
      } catch (error) {
        console.error('Failed to get alerts:', error.response?.status, error.message);
        alertsRes = { data: { alerts: [] } };
      }

      if (progressCallback) progressCallback(100, 'Scan completed');
      const alerts = alertsRes.data.alerts || [];
      console.log(`ZAP scan completed with ${alerts.length} alerts`);
      return { success: true, alerts };
    } catch (error) {
      console.error('ZAP error:', error.message);
      if (progressCallback) progressCallback(0, `Error: ${error.message}`);
      return { success: false, alerts: [] };
    }
  }

  async runNuclei(target, scanId) {
    // Convert localhost to container name
    let scanTarget = target;
    if (target.includes('localhost:8080')) {
      scanTarget = 'http://dvwa-target:80';
    } else if (target.includes('localhost:5001')) {
      scanTarget = 'http://security-scanner-backend:5000';
    } else if (target.includes('localhost:8888')) {
      scanTarget = 'http://vulnerable-app:80';
    }
    
    const outputFile = `/scans/nuclei_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} sh -c "nuclei -u '${scanTarget}' -jsonl -o ${outputFile} -silent -nc -c 50 -rate-limit 150"`;
    
    try {
      await execAsync(cmd);
      return { success: true, outputFile };
    } catch (error) {
      console.error('Nuclei error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runNikto(target, scanId) {
    // Convert localhost to container name
    let scanTarget = target;
    if (target.includes('localhost:8080')) {
      scanTarget = 'dvwa-target:80';
    } else if (target.includes('localhost:5001')) {
      scanTarget = 'security-scanner-backend:5000';
    } else if (target.includes('localhost:8888')) {
      scanTarget = 'vulnerable-app:80';
    }
    
    const outputFile = `/scans/nikto_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} perl /opt/nikto/program/nikto.pl -h ${scanTarget} -Format json -output ${outputFile} -Tuning 123bde -maxtime 3m`;
    
    try {
      await execAsync(cmd);
      return { success: true, outputFile };
    } catch (error) {
      console.error('Nikto error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runSubfinder(domain, scanId) {
    const outputFile = `/scans/subfinder_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} subfinder -d ${domain} -json -o ${outputFile}`;
    
    try {
      await execAsync(cmd);
      return { success: true, outputFile };
    } catch (error) {
      console.error('Subfinder error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runFullScan(target, scanId) {
    const results = {
      zap: null,
      nuclei: null
    };

    // Run ZAP first with progress callback
    const updateProgress = (progress, message) => {
      console.log(`Scan ${scanId}: ${progress}% - ${message}`);
    };
    results.zap = await this.runZap(target, scanId, updateProgress);

    // Run Nuclei
    results.nuclei = await this.runNuclei(target, scanId);

    return results;
  }
}

module.exports = new ScannerService();
