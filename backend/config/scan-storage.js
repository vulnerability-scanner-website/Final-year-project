module.exports = {
  // Scan storage settings - DISABLED to prevent disk usage
  SAVE_SCANS_TO_DB: false, // Don't save to database
  SAVE_ZAP_SESSIONS: false, // Don't save ZAP sessions
  
  // Temporary scan mode - results only in memory
  TEMPORARY_SCAN_MODE: true, // Only keep in memory
  
  // Auto-cleanup settings (not needed since we don't store)
  AUTO_DELETE_OLD_SCANS: false,
  SCAN_RETENTION_DAYS: 0,
  
  // Memory limits
  MAX_RESULTS_IN_MEMORY: parseInt(process.env.MAX_RESULTS_IN_MEMORY || '1000'),
};
