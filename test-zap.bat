@echo off
echo Testing ZAP Scanner Setup...
echo.

echo 1. Checking if containers are running...
docker ps --filter name=security-scanner-zap --format "{{.Names}} - {{.Status}}"
docker ps --filter name=pensive_saha --format "{{.Names}} - {{.Status}}"
echo.

echo 2. Testing ZAP API connection...
curl -s http://localhost:9090/JSON/core/view/version/ 
echo.
echo.

echo 3. All checks complete!
echo.
echo ZAP Scanner is ready at: http://localhost:9090
echo Juice Shop target at: http://localhost:3001
echo.
echo Now you can:
echo - Go to your frontend
echo - Click "New Scan"
echo - Select "ZAP - OWASP ZAP (Recommended)"
echo - Enter target: http://pensive_saha:3000
echo - Start the scan!
pause
