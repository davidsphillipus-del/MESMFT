@echo off
echo ========================================
echo   MESMTF Healthcare System Startup
echo ========================================
echo.

echo Starting Backend Server...
start "MESMTF Backend" cmd /k "cd backend && echo Backend Starting... && npx ts-node --transpile-only src/index.ts"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Application...
start "MESMTF Frontend" cmd /k "echo Frontend Starting... && npm start"

echo.
echo ========================================
echo   MESMTF System Starting...
echo ========================================
echo.
echo Backend will be available at: http://localhost:5001
echo Frontend will be available at: http://localhost:3000
echo.
echo Both applications are starting in separate windows.
echo Please wait a moment for them to fully load.
echo.
echo Test Users (password: password123):
echo - doctor1@mesmtf.com
echo - nurse1@mesmtf.com  
echo - patient1@mesmtf.com
echo - admin1@mesmtf.com
echo.
pause
