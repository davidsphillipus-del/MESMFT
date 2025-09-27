# MESMTF Healthcare System Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MESMTF Healthcare System Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'MESMTF Backend Starting...' -ForegroundColor Green; npx ts-node --transpile-only src/index.ts"

Write-Host "Waiting 3 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'MESMTF Frontend Starting...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   MESMTF System Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both applications are starting in separate windows." -ForegroundColor White
Write-Host "Please wait a moment for them to fully load." -ForegroundColor White
Write-Host ""
Write-Host "Test Users (password: password123):" -ForegroundColor Yellow
Write-Host "- doctor1@mesmtf.com" -ForegroundColor White
Write-Host "- nurse1@mesmtf.com" -ForegroundColor White
Write-Host "- patient1@mesmtf.com" -ForegroundColor White
Write-Host "- admin1@mesmtf.com" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..."
