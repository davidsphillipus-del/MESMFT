# MESMTF GitHub Push Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MESMTF GitHub Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize git repository" }

    Write-Host ""
    Write-Host "Step 2: Adding all files to git..." -ForegroundColor Yellow
    git add .
    if ($LASTEXITCODE -ne 0) { throw "Failed to add files to git" }

    Write-Host ""
    Write-Host "Step 3: Creating initial commit..." -ForegroundColor Yellow
    $commitMessage = @"
Initial commit: Complete MESMTF Healthcare Management System

- Frontend: React + TypeScript healthcare management system
- Backend: Node.js + Express API with authentication
- Features: Role-based access, patient management, appointments
- Integration: Complete frontend-backend integration
- Users: 12 pre-configured test users across all roles
- Documentation: Comprehensive setup and usage guides
"@
    
    git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) { throw "Failed to create commit" }

    Write-Host ""
    Write-Host "Step 4: Setting up remote repository..." -ForegroundColor Yellow
    $username = Read-Host "Please enter your GitHub username"
    $reponame = Read-Host "Please enter your repository name (default: mesmtf-healthcare-system)"
    
    if ([string]::IsNullOrEmpty($reponame)) {
        $reponame = "mesmtf-healthcare-system"
    }

    git remote add origin "https://github.com/$username/$reponame.git"
    if ($LASTEXITCODE -ne 0) { throw "Failed to add remote repository" }

    Write-Host ""
    Write-Host "Step 5: Setting main branch and pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    if ($LASTEXITCODE -ne 0) { throw "Failed to push to GitHub" }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your MESMTF project has been successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$username/$reponame" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your repository on GitHub" -ForegroundColor White
    Write-Host "2. Add a description and topics" -ForegroundColor White
    Write-Host "3. Enable GitHub Pages if desired" -ForegroundColor White
    Write-Host "4. Share with your team!" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Ensure Git is installed and accessible" -ForegroundColor White
    Write-Host "2. Check your GitHub credentials" -ForegroundColor White
    Write-Host "3. Verify the repository exists on GitHub" -ForegroundColor White
    Write-Host "4. Try running commands manually if needed" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to continue..."
