# Koyeb Migration Script for Tsunade FastAPI Backend
# This script helps prepare your project for Koyeb deployment

Write-Host "🚀 Tsunade Backend - Koyeb Migration Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "backend/main.py")) {
    Write-Host "❌ Error: Please run this script from the Tsunade project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Check if koyeb.yaml exists
if (Test-Path "koyeb.yaml") {
    Write-Host "✅ koyeb.yaml configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ koyeb.yaml not found. Please ensure the configuration file exists." -ForegroundColor Red
    exit 1
}

# Check backend requirements
if (Test-Path "backend/requirements.txt") {
    Write-Host "✅ Backend requirements.txt found" -ForegroundColor Green
    $reqCount = (Get-Content "backend/requirements.txt" | Measure-Object -Line).Lines
    Write-Host "   📦 Found $reqCount dependencies" -ForegroundColor Gray
} else {
    Write-Host "❌ backend/requirements.txt not found" -ForegroundColor Red
    exit 1
}

# Check if main.py exists
if (Test-Path "backend/main.py") {
    Write-Host "✅ FastAPI main.py found" -ForegroundColor Green
} else {
    Write-Host "❌ backend/main.py not found" -ForegroundColor Red
    exit 1
}

# Validate environment variables
Write-Host "\n🔧 Environment Variables Check" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

$envVars = @(
    "ENVIRONMENT",
    "DEBUG", 
    "SECRET_KEY",
    "CORS_ORIGINS",
    "DATABASE_URL",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    "API_V1_STR",
    "PROJECT_NAME"
)

Write-Host "Required environment variables for Koyeb:" -ForegroundColor Gray
foreach ($var in $envVars) {
    Write-Host "  • $var" -ForegroundColor Gray
}

# Check if .env.production exists
if (Test-Path ".env.production") {
    Write-Host "\n✅ .env.production found - you can reference this for Koyeb setup" -ForegroundColor Green
} else {
    Write-Host "\n⚠️  .env.production not found - you'll need to set environment variables manually in Koyeb" -ForegroundColor Yellow
}

# Git status check
Write-Host "\n📋 Git Status Check" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
        git status --short
        Write-Host "\n💡 Consider committing changes before deploying to Koyeb" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Git working directory is clean" -ForegroundColor Green
    }
    
    $currentBranch = git branch --show-current 2>$null
    Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Gray
    
    if ($currentBranch -ne "master" -and $currentBranch -ne "main") {
        Write-Host "⚠️  You're not on master/main branch. Koyeb will deploy from master by default." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Git not available or not a git repository" -ForegroundColor Yellow
}

# Check for potential issues
Write-Host "\n🔍 Potential Issues Check" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Check for Docker files that might interfere
$dockerFiles = @("Dockerfile", "docker-compose.yml", ".dockerignore")
foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Write-Host "⚠️  Found $file - ensure Koyeb uses buildpack, not Docker" -ForegroundColor Yellow
    }
}

# Check for large files that might slow deployment
$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 10MB }
if ($largeFiles) {
    Write-Host "⚠️  Large files found (>10MB):" -ForegroundColor Yellow
    foreach ($file in $largeFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "   • $($file.Name) ($sizeMB MB)" -ForegroundColor Gray
    }
    Write-Host "   Consider adding to .gitignore if not needed for deployment" -ForegroundColor Gray
}

# Summary and next steps
Write-Host "\n📋 Migration Summary" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "✅ Project structure validated" -ForegroundColor Green
Write-Host "✅ Koyeb configuration ready" -ForegroundColor Green
Write-Host "✅ Dependencies verified" -ForegroundColor Green

Write-Host "\n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create Koyeb account at https://www.koyeb.com" -ForegroundColor White
Write-Host "2. Connect your GitHub repository" -ForegroundColor White
Write-Host "3. Create new service using the koyeb.yaml configuration" -ForegroundColor White
Write-Host "4. Set up environment variables in Koyeb dashboard" -ForegroundColor White
Write-Host "5. Create managed PostgreSQL database" -ForegroundColor White
Write-Host "6. Deploy and test your service" -ForegroundColor White
Write-Host "7. Update frontend API URL to point to Koyeb" -ForegroundColor White

Write-Host "\n📖 For detailed instructions, see: KOYEB_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan

Write-Host "\n🚀 Ready for Koyeb migration!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan