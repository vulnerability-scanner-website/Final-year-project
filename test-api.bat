@echo off
echo Testing Vulnerabilities API...
echo.

echo Getting auth token...
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@security.com\",\"password\":\"admin123\"}" > token.json

echo.
echo Fetching vulnerabilities...
echo.

for /f "tokens=2 delims=:," %%a in ('type token.json ^| findstr "token"') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%

curl -s http://localhost:5000/api/vulnerabilities -H "Authorization: Bearer %TOKEN%"

echo.
echo.
echo If you see vulnerabilities above, the API is working!
echo The issue is browser cache - press Ctrl+Shift+R to hard refresh
pause
