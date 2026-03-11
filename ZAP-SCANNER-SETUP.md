# ZAP Scanner Setup - Complete

## What Was Added

### 1. OWASP ZAP Scanner Container
- **Image**: zaproxy/zap-stable
- **Port**: 9090 (external) -> 8090 (internal)
- **API**: http://security-scanner-zap:8090 (from backend)
- **Status**: ✅ Running and operational

### 2. Backend Integration
- Added `runZap()` method to scanner service
- Performs spider scan + active scan
- Returns detailed vulnerability alerts
- Parses results and saves to database

### 3. Frontend Updates
- Added "ZAP - OWASP ZAP (Recommended)" option
- Set as default scan type
- Shows as most comprehensive option

## How to Use

### Start a Scan from Frontend:
1. Go to your security scanner dashboard
2. Click "New Scan" button
3. Fill in:
   - Scan Name: Any name you want
   - Target URL: http://pensive_saha:3000 (for Juice Shop)
   - Scan Type: Select "ZAP - OWASP ZAP (Recommended)"
4. Click "Start Scan"

### What Happens:
1. ZAP spider crawls the website (finds all pages)
2. ZAP active scanner tests for vulnerabilities
3. Results are saved to database with:
   - Vulnerability title
   - Severity (info, low, medium, high)
   - Description
4. Scan status updates to "Completed"

## Why ZAP is Better Than Nuclei

| Feature | ZAP | Nuclei |
|---------|-----|--------|
| Vulnerability Types | 100+ (XSS, SQLi, CSRF, etc.) | Template-based only |
| Active Testing | ✅ Yes | ❌ No |
| Spider/Crawler | ✅ Yes | ❌ No |
| False Positives | Low | Medium |
| Scan Depth | Deep | Surface |
| Industry Standard | ✅ OWASP Official | Community tool |

## Verify Setup

Run these commands to verify everything works:

```cmd
# Check containers
docker ps --filter name=zap

# Test ZAP API
docker exec security-scanner-backend wget -qO- http://security-scanner-zap:8090/JSON/core/view/version/

# Ensure Juice Shop is running
docker start pensive_saha
```

## Troubleshooting

**If scan shows 0 vulnerabilities:**
1. Make sure target container is running: `docker start pensive_saha`
2. Check ZAP logs: `docker logs security-scanner-zap`
3. Verify backend can reach ZAP: `docker exec security-scanner-backend wget -qO- http://security-scanner-zap:8090/JSON/core/view/version/`

**Scan takes too long:**
- ZAP is thorough and can take 5-15 minutes
- This is normal for comprehensive scanning
- Check scan progress in backend logs

## Next Steps

1. Start Juice Shop: `docker start pensive_saha`
2. Go to frontend and create a new ZAP scan
3. Target: http://pensive_saha:3000
4. Wait for scan to complete (5-15 minutes)
5. View vulnerabilities in dashboard

ZAP will find MANY more vulnerabilities than Nuclei!
