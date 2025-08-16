#!/usr/bin/env pwsh
# Vercel Frontend Configuration Update Script
# This script helps update the frontend to connect to the Railway deployed backend

Write-Host "🌐 Vercel Frontend Configuration Update" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to get user input
function Get-UserInput {
    param(
        [string]$Prompt,
        [string]$DefaultValue = "",
        [bool]$Required = $true
    )
    
    do {
        $input = Read-Host -Prompt $Prompt
        
        if ([string]::IsNullOrWhiteSpace($input) -and ![string]::IsNullOrWhiteSpace($DefaultValue)) {
            $input = $DefaultValue
        }
        
        if ($Required -and [string]::IsNullOrWhiteSpace($input)) {
            Write-Host "❌ This field is required. Please enter a value." -ForegroundColor Red
        }
    } while ($Required -and [string]::IsNullOrWhiteSpace($input))
    
    return $input
}

# Get Railway backend URL
Write-Host "\n📡 Backend Configuration" -ForegroundColor Yellow
$railwayUrl = Get-UserInput "Enter your Railway backend URL (e.g., https://your-app.railway.app)"

# Remove trailing slash if present
$railwayUrl = $railwayUrl.TrimEnd('/')

# Validate URL format
if ($railwayUrl -notmatch '^https?://') {
    Write-Host "❌ Invalid URL format. Please include http:// or https://" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend URL: $railwayUrl" -ForegroundColor Green

# Check if frontend directory exists
$frontendPath = "./frontend"
if (!(Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend directory found" -ForegroundColor Green

# Update environment files
Write-Host "\n🔧 Updating Environment Configuration..." -ForegroundColor Yellow

# Environment variables to set
$envVars = @{
    "NEXT_PUBLIC_API_URL" = $railwayUrl
    "NEXT_PUBLIC_API_BASE_URL" = "$railwayUrl/api/v1"
    "NEXT_PUBLIC_BACKEND_URL" = $railwayUrl
}

# Update .env.local
$envLocalPath = "$frontendPath/.env.local"
Write-Host "Updating $envLocalPath..."

$envContent = @()
if (Test-Path $envLocalPath) {
    $existingContent = Get-Content $envLocalPath
    foreach ($line in $existingContent) {
        $keep = $true
        foreach ($var in $envVars.Keys) {
            if ($line -match "^$var=") {
                $keep = $false
                break
            }
        }
        if ($keep) {
            $envContent += $line
        }
    }
}

# Add new environment variables
foreach ($var in $envVars.GetEnumerator()) {
    $envContent += "$($var.Key)=$($var.Value)"
}

# Write updated content
$envContent | Out-File -FilePath $envLocalPath -Encoding UTF8
Write-Host "✅ Updated $envLocalPath" -ForegroundColor Green

# Update .env.example if it exists
$envExamplePath = "$frontendPath/.env.example"
if (Test-Path $envExamplePath) {
    Write-Host "Updating $envExamplePath..."
    
    $exampleContent = @()
    $existingExample = Get-Content $envExamplePath
    
    foreach ($line in $existingExample) {
        $keep = $true
        foreach ($var in $envVars.Keys) {
            if ($line -match "^$var=") {
                $keep = $false
                break
            }
        }
        if ($keep) {
            $exampleContent += $line
        }
    }
    
    # Add example values
    foreach ($var in $envVars.Keys) {
        $exampleContent += "$var=https://your-app.railway.app"
    }
    
    $exampleContent | Out-File -FilePath $envExamplePath -Encoding UTF8
    Write-Host "✅ Updated $envExamplePath" -ForegroundColor Green
}

# Check for config files that might need updating
Write-Host "\n🔍 Checking for additional configuration files..." -ForegroundColor Yellow

$configFiles = @(
    "$frontendPath/next.config.js",
    "$frontendPath/next.config.mjs",
    "$frontendPath/src/config/api.js",
    "$frontendPath/src/config/api.ts",
    "$frontendPath/src/lib/api.js",
    "$frontendPath/src/lib/api.ts",
    "$frontendPath/src/utils/api.js",
    "$frontendPath/src/utils/api.ts"
)

$foundConfigs = @()
foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        $foundConfigs += $configFile
        Write-Host "📄 Found: $configFile" -ForegroundColor Cyan
    }
}

if ($foundConfigs.Count -gt 0) {
    Write-Host "\n⚠️  Manual Review Required:" -ForegroundColor Yellow
    Write-Host "The following configuration files may need manual updates:"
    foreach ($config in $foundConfigs) {
        Write-Host "   - $config" -ForegroundColor Yellow
    }
    Write-Host "\nPlease review these files and update any hardcoded API URLs to point to:"
    Write-Host "   $railwayUrl" -ForegroundColor Cyan
}

# Vercel deployment instructions
Write-Host "\n🚀 Vercel Deployment Instructions" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "\n1. Update Vercel Environment Variables:"
Write-Host "   Go to: https://vercel.com/[your-username]/[your-project]/settings/environment-variables"
Write-Host "\n   Add/Update these variables:"
foreach ($var in $envVars.GetEnumerator()) {
    Write-Host "   - $($var.Key): $($var.Value)" -ForegroundColor Cyan
}

Write-Host "\n2. Redeploy your Vercel application:"
Write-Host "   Option A: Push to your main branch (if auto-deploy is enabled)"
Write-Host "   Option B: Manual redeploy from Vercel dashboard"
Write-Host "   Option C: Use Vercel CLI: vercel --prod"

Write-Host "\n3. Test the connection:"
Write-Host "   - Open your Vercel app"
Write-Host "   - Check browser developer tools for API calls"
Write-Host "   - Verify API requests are going to: $railwayUrl"

# CORS configuration reminder
Write-Host "\n🔒 CORS Configuration Reminder" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

Write-Host "\nDon't forget to update your Railway backend CORS settings!"
Write-Host "\nIn your Railway environment variables, set:"
Write-Host "   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,$railwayUrl"
Write-Host "\nReplace 'your-vercel-app.vercel.app' with your actual Vercel domain."

# Testing instructions
Write-Host "\n🧪 Testing Instructions" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

Write-Host "\n1. Test backend health:"
Write-Host "   curl $railwayUrl/health"

Write-Host "\n2. Test API documentation:"
Write-Host "   Open: $railwayUrl/docs"

Write-Host "\n3. Test frontend-backend connection:"
Write-Host "   - Open your Vercel app"
Write-Host "   - Try user registration/login"
Write-Host "   - Check network tab for successful API calls"

Write-Host "\n✨ Configuration update complete!" -ForegroundColor Cyan
Write-Host "\nNext: Deploy to Vercel and test the full application." -ForegroundColor Cyan