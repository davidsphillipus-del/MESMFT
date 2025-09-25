@echo off
echo ========================================
echo   MESMTF GitHub Push Script
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize git repository
    echo Please ensure Git is installed and accessible
    pause
    exit /b 1
)

echo.
echo Step 2: Adding all files to git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files to git
    pause
    exit /b 1
)

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit: Complete MESMTF Healthcare Management System - Frontend: React + TypeScript healthcare management system - Backend: Node.js + Express API with authentication - Features: Role-based access, patient management, appointments - Integration: Complete frontend-backend integration - Users: 12 pre-configured test users across all roles - Documentation: Comprehensive setup and usage guides"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)

echo.
echo Step 4: Setting up remote repository...
echo Please enter your GitHub username:
set /p username="GitHub Username: "

echo Please enter your repository name (default: mesmtf-healthcare-system):
set /p reponame="Repository Name: "
if "%reponame%"=="" set reponame=mesmtf-healthcare-system

git remote add origin https://github.com/%username%/%reponame%.git
if %errorlevel% neq 0 (
    echo ERROR: Failed to add remote repository
    echo Please ensure the repository exists on GitHub
    pause
    exit /b 1
)

echo.
echo Step 5: Setting main branch and pushing to GitHub...
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub
    echo Please check your credentials and repository access
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! 
echo ========================================
echo.
echo Your MESMTF project has been successfully pushed to GitHub!
echo Repository URL: https://github.com/%username%/%reponame%
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Add a description and topics
echo 3. Enable GitHub Pages if desired
echo 4. Share with your team!
echo.
pause
