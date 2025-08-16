#!/usr/bin/env pwsh

# GitHub Actions & Railway Deployment Status Checker
# This script helps you monitor your deployment progress

Write-Host "Railway Deployment Status Checker" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# GitHub repository information
$GITHUB_REPO = "MalayThoria/Deadpool"
$GITHUB_ACTIONS_URL = "https://github.com/$GITHUB_REPO/actions"

Write-Host "Deployment Monitoring Links:" -ForegroundColor Yellow
Write-Host ""
Write-Host "GitHub Actions Workflow:" -ForegroundColor Green
Write-Host "   $GITHUB_ACTIONS_URL" -ForegroundColor White
Write-Host ""
Write-Host "Railway Dashboard:" -ForegroundColor Green
Write-Host "   https://railway.app/dashboard" -ForegroundColor White
Write-Host ""

# Instructions
Write-Host "What to Check:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. GitHub Actions Status:" -ForegroundColor Cyan
Write-Host "   - Go to: $GITHUB_ACTIONS_URL" -ForegroundColor White
Write-Host "   - Look for: 'Trigger Railway deployment with configured GitHub secrets'" -ForegroundColor White
Write-Host "   - Status should be: Green checkmark (Success)" -ForegroundColor White
Write-Host ""
Write-Host "2. Railway Deployment:" -ForegroundColor Cyan
Write-Host "   - Go to: https://railway.app/dashboard" -ForegroundColor White
Write-Host "   - Find your deployed service" -ForegroundColor White
Write-Host "   - Status should be: Active" -ForegroundColor White
Write-Host ""
Write-Host "3. Get Railway URL:" -ForegroundColor Cyan
Write-Host "   - In GitHub Actions logs, look for:" -ForegroundColor White
Write-Host "     'Railway deployment URL: https://your-app.railway.app'" -ForegroundColor White
Write-Host "   - OR in Railway dashboard, click your service to see the URL" -ForegroundColor White
Write-Host ""

# Test commands
Write-Host "Test Commands (Replace with your actual Railway URL):" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Health Check:" -ForegroundColor Green
Write-Host "curl https://your-app.railway.app/health" -ForegroundColor White
Write-Host ""
Write-Host "# API Documentation:" -ForegroundColor Green
Write-Host "# Open in browser: https://your-app.railway.app/docs" -ForegroundColor White
Write-Host ""

# Next steps
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verify GitHub Actions completed successfully" -ForegroundColor White
Write-Host "2. Get your Railway deployment URL" -ForegroundColor White
Write-Host "3. Test the health endpoint" -ForegroundColor White
Write-Host "4. Run: .\update-vercel-config.ps1" -ForegroundColor White
Write-Host "5. Test full-stack integration" -ForegroundColor White
Write-Host ""

# Auto-open GitHub Actions
Write-Host "Opening GitHub Actions in your browser..." -ForegroundColor Cyan
try {
    Start-Process $GITHUB_ACTIONS_URL
    Write-Host "GitHub Actions opened successfully!" -ForegroundColor Green
} catch {
    Write-Host "Could not open browser automatically" -ForegroundColor Red
    Write-Host "Please manually go to: $GITHUB_ACTIONS_URL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deployment typically takes 5-10 minutes..." -ForegroundColor Yellow
Write-Host "Refresh the GitHub Actions page to see progress" -ForegroundColor Yellow
Write-Host ""
Write-Host "Once deployment completes, come back and run the frontend update!" -ForegroundColor Green
Write-Host ""