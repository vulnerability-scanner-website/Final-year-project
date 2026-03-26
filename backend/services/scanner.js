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
      let scanTarget = target;
      if (target.includes('localhost:8080'))  scanTarget = 'http://dvwa-target:80';
      else if (target.includes('localhost:5001')) scanTarget = 'http://security-scanner-backend:5000';
      else if (target.includes('localhost:8888')) scanTarget = 'http://vulnerable-app:80';

      console.log(`ZAP scanning target: ${scanTarget}`);
      if (progressCallback) progressCallback(5, 'Configuring ZAP...');

      // Reduced spider settings for faster scans
      const zapSet = async (path, params) => {
        try { await axios.get(`${this.zapUrl}${path}`, { params, timeout: 8000 }); }
        catch (e) { console.warn(`ZAP config warning: ${e.message}`); }
      };

      await zapSet('/JSON/spider/action/setOptionMaxDepth/',    { Integer: 5 });
      await zapSet('/JSON/spider/action/setOptionMaxChildren/', { Integer: 20 });
      await zapSet('/JSON/spider/action/setOptionMaxDuration/', { Integer: 2 });

      if (progressCallback) progressCallback(10, 'Starting spider scan...');

      let spiderRes;
      try {
        spiderRes = await axios.get(`${this.zapUrl}/JSON/spider/action/scan/`, {
          params: { url: scanTarget }, timeout: 20000
        });
      } catch (error) {
        throw new Error(`Failed to start spider scan: ${error.message}`);
      }

      const spiderId = spiderRes.data.scan;
      console.log(`Spider scan started: ${spiderId}`);

      // Wait for spider — max 60s (30 × 2s)
      let spiderStatus = 0, spiderAttempts = 0;
      while (spiderStatus < 100 && spiderAttempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const res = await axios.get(`${this.zapUrl}/JSON/spider/view/status/`, {
            params: { scanId: spiderId }, timeout: 8000
          });
          spiderStatus = parseInt(res.data.status);
          if (progressCallback) progressCallback(10 + (spiderStatus * 0.2), `Spider: ${spiderStatus}%`);
        } catch (e) { console.warn('Spider status error:', e.message); }
        spiderAttempts++;
      }

      if (progressCallback) progressCallback(35, 'Starting active scan...');

      // Reduced active scan settings
      await zapSet('/JSON/ascan/action/setOptionMaxRuleDurationInMins/', { Integer: 2 });
      await zapSet('/JSON/ascan/action/setOptionMaxScanDurationInMins/', { Integer: 5 });
      await zapSet('/JSON/ascan/action/setOptionThreadPerHost/',         { Integer: 5 });

      let scanRes;
      try {
        scanRes = await axios.get(`${this.zapUrl}/JSON/ascan/action/scan/`, {
          params: { url: scanTarget }, timeout: 20000
        });
      } catch (error) {
        throw new Error(`Failed to start active scan: ${error.message}`);
      }

      const scanIdZap = scanRes.data.scan;
      console.log(`Active scan started: ${scanIdZap}`);

      // Wait for active scan — max 5 min (60 × 5s)
      let scanStatus = 0, scanAttempts = 0;
      while (scanStatus < 100 && scanAttempts < 60) {
        await new Promise(r => setTimeout(r, 5000));
        try {
          const res = await axios.get(`${this.zapUrl}/JSON/ascan/view/status/`, {
            params: { scanId: scanIdZap }, timeout: 8000
          });
          scanStatus = parseInt(res.data.status);
          if (progressCallback) progressCallback(35 + (scanStatus * 0.6), `Active scan: ${scanStatus}%`);
        } catch (e) { console.warn('Active scan status error:', e.message); }
        scanAttempts++;
      }

      if (progressCallback) progressCallback(95, 'Collecting results...');

      let alertsRes;
      try {
        alertsRes = await axios.get(`${this.zapUrl}/JSON/core/view/alerts/`, {
          params: { baseurl: scanTarget }, timeout: 20000
        });
      } catch (error) {
        console.error('Failed to get alerts:', error.message);
        alertsRes = { data: { alerts: [] } };
      }

      if (progressCallback) progressCallback(100, 'Scan completed');
      const alerts = alertsRes.data.alerts || [];
      console.log(`ZAP completed: ${alerts.length} alerts`);
      return { success: true, alerts };
    } catch (error) {
      console.error('ZAP error:', error.message);
      if (progressCallback) progressCallback(0, `Error: ${error.message}`);
      return { success: false, alerts: [] };
    }
  }

  async runNuclei(target, scanId) {
    let scanTarget = target;
    if (target.includes('localhost:8080'))  scanTarget = 'http://dvwa-target:80';
    else if (target.includes('localhost:5001')) scanTarget = 'http://security-scanner-backend:5000';
    else if (target.includes('localhost:8888')) scanTarget = 'http://vulnerable-app:80';

    const outputFile = `/scans/nuclei_${scanId}.json`;
    // Limit to critical/high/medium, cap rate and concurrency
    const cmd = `docker exec ${this.scannerContainer} sh -c "nuclei -u '${scanTarget}' -jsonl -o ${outputFile} -silent -nc -c 25 -rate-limit 50 -severity critical,high,medium -timeout 5"`;

    try {
      await execAsync(cmd, { timeout: 120000 }); // 2 min max
      return { success: true, outputFile };
    } catch (error) {
      console.error('Nuclei error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runNikto(target, scanId) {
    let scanTarget = target;
    if (target.includes('localhost:8080'))  scanTarget = 'dvwa-target:80';
    else if (target.includes('localhost:5001')) scanTarget = 'security-scanner-backend:5000';
    else if (target.includes('localhost:8888')) scanTarget = 'vulnerable-app:80';

    const outputFile = `/scans/nikto_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} perl /opt/nikto/program/nikto.pl -h ${scanTarget} -Format json -output ${outputFile} -Tuning 123bde -maxtime 2m`;

    try {
      await execAsync(cmd, { timeout: 150000 }); // 2.5 min max
      return { success: true, outputFile };
    } catch (error) {
      console.error('Nikto error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runFullScan(target, scanId) {
    const updateProgress = (progress, message) => console.log(`Scan ${scanId}: ${progress}% - ${message}`);
    const zap = await this.runZap(target, scanId, updateProgress);
    const nuclei = await this.runNuclei(target, scanId);
    return { zap, nuclei };
  }
}

module.exports = new ScannerService();
