const scanStorage = require('../config/scan-storage');
const fs = require('fs').promises;
const path = require('path');

class CleanupService {
  constructor(fastify) {
    this.fastify = fastify;
    this.isRunning = false;
  }

  async start() {
    if (!scanStorage.AUTO_DELETE_OLD_SCANS) {
      console.log('⚠️  Auto-cleanup disabled');
      return;
    }

    console.log(`🧹 Auto-cleanup enabled: Deleting scans older than ${scanStorage.SCAN_RETENTION_DAYS} days`);
    
    // Run cleanup every hour
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);

    // Run initial cleanup after 1 minute
    setTimeout(() => this.cleanup(), 60000);
  }

  async cleanup() {
    if (this.isRunning) {
      console.log('⏭️  Cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🧹 Starting cleanup...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - scanStorage.SCAN_RETENTION_DAYS);

      const client = await this.fastify.pg.connect();
      
      try {
        // Get old scans
        const result = await client.query(
          'SELECT id FROM scans WHERE created_at < $1',
          [cutoffDate]
        );

        if (result.rows.length === 0) {
          console.log('✅ No old scans to delete');
          return;
        }

        console.log(`🗑️  Deleting ${result.rows.length} old scans...`);

        // Delete vulnerabilities first (foreign key constraint)
        await client.query(
          'DELETE FROM vulnerabilities WHERE scan_id IN (SELECT id FROM scans WHERE created_at < $1)',
          [cutoffDate]
        );

        // Delete scans
        await client.query(
          'DELETE FROM scans WHERE created_at < $1',
          [cutoffDate]
        );

        // Clean up scan result files
        const scanDir = '/scans';
        try {
          const files = await fs.readdir(scanDir);
          for (const file of files) {
            const filePath = path.join(scanDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              console.log(`🗑️  Deleted file: ${file}`);
            }
          }
        } catch (err) {
          console.error('Error cleaning scan files:', err.message);
        }

        console.log(`✅ Cleanup completed: Deleted ${result.rows.length} scans`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('🛑 Cleanup service stopped');
    }
  }
}

module.exports = CleanupService;
