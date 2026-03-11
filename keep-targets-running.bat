@echo off
echo Ensuring vulnerable target containers are running...

docker start pensive_saha 2>nul
if %errorlevel% equ 0 (
    echo Started Juice Shop ^(pensive_saha^)
) else (
    echo Juice Shop is already running
)

docker start dvwa-target 2>nul
if %errorlevel% equ 0 (
    echo Started DVWA ^(dvwa-target^)
) else (
    echo DVWA is already running
)

echo.
echo All target containers are now running!
echo - Juice Shop: http://localhost:3001
echo - DVWA: http://localhost:8080
