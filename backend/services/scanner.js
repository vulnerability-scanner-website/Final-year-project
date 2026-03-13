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
      if (progressCallback) progressCallback(10, 'Starting ZAP spider scan...');
      
      // Configure ZAP for faster scanning
      await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxDepth/`, {
        params: { Integer: 3 } // Limit spider depth
      });
      await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxChildren/`, {
        params: { Integer: 10 } // Limit children per node
      });
      await axios.get(`${this.zapUrl}/JSON/spider/action/setOptionMaxDuration/`, {
        params: { Integer: 2 } // Max 2 minutes for spider
      });
      
      // Start spider scan
      const spiderRes = await axios.get(`${this.zapUrl}/JSON/spider/action/scan/`, {
        params: { url: target }
      });
      const spiderId = spiderRes.data.scan;

      // Wait for spider to complete (check every 1 second)
      let spiderStatus = 0;
      while (spiderStatus < 100) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusRes = await axios.get(`${this.zapUrl}/JSON/spider/view/status/`, {
          params: { scanId: spiderId }
        });
        spiderStatus = parseInt(statusRes.data.status);
        if (progressCallback) progressCallback(10 + (spiderStatus * 0.3), `Spider scan: ${spiderStatus}%`);
      }

      if (progressCallback) progressCallback(40, 'Starting active scan...');
      
      // Configure active scan for speed
      await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionMaxRuleDurationInMins/`, {
        params: { Integer: 1 } // Max 1 min per rule
      });
      await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionMaxScanDurationInMins/`, {
        params: { Integer: 5 } // Max 5 minutes total
      });
      await axios.get(`${this.zapUrl}/JSON/ascan/action/setOptionThreadPerHost/`, {
        params: { Integer: 4 } // Increase threads
      });
      
      // Start active scan
      const scanRes = await axios.get(`${this.zapUrl}/JSON/ascan/action/scan/`, {
        params: { url: target }
      });
      const scanIdZap = scanRes.data.scan;

      // Wait for active scan to complete (check every 2 seconds)
      let scanStatus = 0;
      while (scanStatus < 100) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusRes = await axios.get(`${this.zapUrl}/JSON/ascan/view/status/`, {
          params: { scanId: scanIdZap }
        });
        scanStatus = parseInt(statusRes.data.status);
        if (progressCallback) progressCallback(40 + (scanStatus * 0.5), `Active scan: ${scanStatus}%`);
      }

      if (progressCallback) progressCallback(90, 'Collecting results...');
      
      // Get alerts
      const alertsRes = await axios.get(`${this.zapUrl}/JSON/core/view/alerts/`, {
        params: { baseurl: target }
      });

      if (progressCallback) progressCallback(100, 'Scan completed');
      return { success: true, alerts: alertsRes.data.alerts };
    } catch (error) {
      console.error('ZAP error:', error.message);
      if (progressCallback) progressCallback(0, `Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runNuclei(target, scanId) {
    const outputFile = `/scans/nuclei_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} sh -c "nuclei -u '${target}' -jsonl -o ${outputFile} -silent -nc -c 50 -rate-limit 150"`;
    
    try {
      await execAsync(cmd);
      return { success: true, outputFile };
    } catch (error) {
      console.error('Nuclei error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runNikto(target, scanId) {
    const outputFile = `/scans/nikto_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} perl /opt/nikto/program/nikto.pl -h ${target} -Format json -output ${outputFile} -Tuning 123bde -maxtime 3m`;
    
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
      nuclei: null,
      nikto: null
    };

    // Run Nuclei and Nikto in parallel for speed
    const [nucleiResult, niktoResult] = await Promise.all([
      this.runNuclei(target, scanId),
      this.runNikto(target, scanId)
    ]);

    results.nuclei = nucleiResult;
    results.nikto = niktoResult;

    return results;
  }
}

module.exports = new ScannerService();
