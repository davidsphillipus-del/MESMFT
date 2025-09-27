@echo off
echo.
echo ========================================
echo   MESMTF Backend Server Startup
echo ========================================
echo.
echo Checking Node.js version...
node --version
echo.
echo Starting MESMTF Backend Server...
echo Server will run on http://localhost:5001
echo.
node working-backend.js
echo.
echo Backend server stopped.
pause
