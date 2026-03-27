module.exports = {
  // Scan storage settings
  SAVE_SCANS_TO_DB: true, // Save to database
  SAVE_ZAP_SESSIONS: false, // Don't save ZAP sessions
  
  // Temporary scan mode
  TEMPORARY_SCAN_MODE: false, // Use database storage
  
  // Auto-cleanup settings
  AUTO_DELETE_OLD_SCANS: false,
  SCAN_RETENTION_DAYS: 30,
  
  // Memory limits
  MAX_RESULTS_IN_MEMORY: parseInt(process.env.MAX_RESULTS_IN_MEMORY || '1000'),
};
