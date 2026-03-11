const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const execAsync = promisify(exec);

class ScannerService {
  constructor() {
    this.scannerContainer = 'security-scanner-tools';
    this.zapUrl = 'http://security-scanner-zap:8090';
  }

  async runZap(target, scanId) {
    try {
      // Start spider scan
      const spiderRes = await axios.get(`${this.zapUrl}/JSON/spider/action/scan/`, {
        params: { url: target }
      });
      const spiderId = spiderRes.data.scan;

      // Wait for spider to complete
      let spiderStatus = 0;
      while (spiderStatus < 100) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusRes = await axios.get(`${this.zapUrl}/JSON/spider/view/status/`, {
          params: { scanId: spiderId }
        });
        spiderStatus = parseInt(statusRes.data.status);
      }

      // Start active scan
      const scanRes = await axios.get(`${this.zapUrl}/JSON/ascan/action/scan/`, {
        params: { url: target }
      });
      const scanIdZap = scanRes.data.scan;

      // Wait for active scan to complete
      let scanStatus = 0;
      while (scanStatus < 100) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const statusRes = await axios.get(`${this.zapUrl}/JSON/ascan/view/status/`, {
          params: { scanId: scanIdZap }
        });
        scanStatus = parseInt(statusRes.data.status);
      }

      // Get alerts
      const alertsRes = await axios.get(`${this.zapUrl}/JSON/core/view/alerts/`, {
        params: { baseurl: target }
      });

      return { success: true, alerts: alertsRes.data.alerts };
    } catch (error) {
      console.error('ZAP error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runNuclei(target, scanId) {
    const outputFile = `/scans/nuclei_${scanId}.json`;
    const cmd = `docker exec ${this.scannerContainer} sh -c "nuclei -u '${target}' -jsonl -o ${outputFile} -silent -nc"`;
    
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
    const cmd = `docker exec ${this.scannerContainer} perl /opt/nikto/program/nikto.pl -h ${target} -Format json -output ${outputFile}`;
    
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
      nikto: null,
      subfinder: null
    };

    try {
      const url = new URL(target);
      const domain = url.hostname;
      results.subfinder = await this.runSubfinder(domain, scanId);
    } catch (e) {
      console.error('Subfinder skipped:', e.message);
    }

    results.nuclei = await this.runNuclei(target, scanId);
    results.nikto = await this.runNikto(target, scanId);

    return results;
  }
}

module.exports = new ScannerService();
