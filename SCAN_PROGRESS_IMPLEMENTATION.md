# Real-Time Scan Progress Implementation

## Problem
- Scans stay at 50% progress and don't show real-time updates
- Users don't know what's happening during the scan
- No feedback on scan stages (spider, active scan, results)

## Solution Implemented

### 1. Backend Progress Tracking

**File:** `backend/services/scanner.js`
- Added `progressCallback` parameter to `runZap()` function
- Progress updates at each stage:
  - 10%: Starting spider scan
  - 10-40%: Spider scan progress
  - 40%: Starting active scan
  - 40-90%: Active scan progress
  - 90%: Collecting results
  - 100%: Scan completed

**File:** `backend/controllers/ScanController.js`
- Added `scanProgress` Map to store active scan progress
- Added `getProgress()` method to retrieve current progress
- Modified `create()` to update progress during scan
- Progress automatically cleaned up after 5 minutes

**File:** `backend/routes/scans.js`
- Added new endpoint: `GET /api/scans/:id/progress`
- Returns: `{ progress: 0-100, message: "Current status" }`

### 2. How to Use (Frontend Integration)

```javascript
// Start a scan
const response = await fetch('/api/scans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    target: 'http://example.com',
    scanType: 'zap'
  })
});

const scan = await response.json();

// Poll for progress every 2 seconds
const progressInterval = setInterval(async () => {
  const progressRes = await fetch(`/api/scans/${scan.id}/progress`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { progress, message } = await progressRes.json();
  
  // Update UI
  setProgress(progress);
  setMessage(message);
  
  // Stop polling when complete
  if (progress >= 100) {
    clearInterval(progressInterval);
  }
}, 2000);
```

### 3. Progress Stages

| Progress | Stage | Description |
|----------|-------|-------------|
| 0-5% | Initialization | Starting scanner |
| 5-10% | Spider Start | Initiating spider scan |
| 10-40% | Spider Scan | Crawling website |
| 40% | Active Scan Start | Starting vulnerability detection |
| 40-90% | Active Scan | Testing for vulnerabilities |
| 90-100% | Results | Collecting and processing results |
| 100% | Complete | Scan finished |

### 4. Scanner Improvements

#### ZAP Scanner
- Real-time progress from ZAP API
- Spider scan progress tracked
- Active scan progress tracked
- Better error handling

#### Nuclei Scanner
- Fast template-based scanning
- JSON output for easy parsing
- Silent mode for cleaner output

#### Nikto Scanner
- Web server security checks
- JSON output format
- Comprehensive vulnerability detection

### 5. To Apply Changes

```bash
# Restart Docker Desktop if it's having issues
# Then run:
docker-compose down
docker-compose up -d --build
```

### 6. Testing

1. Start a scan from the dashboard
2. Watch the progress bar update in real-time
3. See status messages change:
   - "Starting scan..."
   - "Spider scan: 25%"
   - "Active scan: 50%"
   - "Collecting results..."
   - "Scan completed"

### 7. Future Enhancements

- [ ] WebSocket for push-based updates (no polling)
- [ ] Scan pause/resume functionality
- [ ] Estimated time remaining
- [ ] Detailed scan logs
- [ ] Email notifications on completion
- [ ] Scheduled scans
- [ ] Scan templates/profiles
- [ ] Custom scan configurations

### 8. Performance Optimization

**Current:**
- Frontend polls every 2 seconds
- Progress stored in memory (Map)
- Auto-cleanup after 5 minutes

**Recommended:**
- Use WebSocket for real-time push
- Store progress in Redis for scalability
- Add scan queue for multiple concurrent scans

### 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scans` | Start new scan |
| GET | `/api/scans` | List all scans |
| GET | `/api/scans/:id` | Get scan details |
| GET | `/api/scans/:id/progress` | Get real-time progress |
| DELETE | `/api/scans/:id` | Delete scan |

### 10. Troubleshooting

**Progress stuck at 0%:**
- Check if scanner containers are running
- Check backend logs: `docker logs security-scanner-backend`
- Verify ZAP is accessible: `docker logs security-scanner-zap`

**Progress not updating:**
- Check if polling is working in frontend
- Verify progress endpoint returns data
- Check browser console for errors

**Scan fails:**
- Verify target URL is accessible
- Check if ZAP container is healthy
- Review backend error logs

## Summary

The real-time progress tracking is now implemented in the backend. To see it work:

1. Restart Docker containers
2. Start a new scan
3. Poll `/api/scans/:id/progress` every 2 seconds
4. Display progress and message in UI

This provides users with real-time feedback on scan progress instead of being stuck at 50%!
