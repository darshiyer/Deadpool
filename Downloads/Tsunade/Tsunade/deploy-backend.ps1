# Backend Deployment Script for Cloud Platforms (PowerShell)
# This script prepares the backend for deployment

Write-Host "Preparing backend for deployment..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Copy production requirements
Copy-Item "requirements-prod.txt" "requirements.txt" -Force

# Create runtime.txt for Python version
"python-3.11.0" | Out-File -FilePath "runtime.txt" -Encoding UTF8

# Create app.py for some platforms that expect it
Copy-Item "main.py" "app.py" -Force

Write-Host "Backend prepared for deployment!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "- requirements.txt (production dependencies)"
Write-Host "- runtime.txt (Python version)"
Write-Host "- Procfile (process configuration)"
Write-Host "- app.py (alternative entry point)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push to GitHub repository"
Write-Host "2. Connect to Render/Railway/Heroku"
Write-Host "3. Set environment variables in platform dashboard"
Write-Host "4. Deploy!"

Write-Host ""
Write-Host "Required environment variables:" -ForegroundColor Magenta
Write-Host "- DATABASE_URL"
Write-Host "- SECRET_KEY"
Write-Host "- CORS_ORIGINS"
Write-Host "- OPENAI_API_KEY (optional)"

# Return to root directory
Set-Location ..