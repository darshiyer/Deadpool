#!/usr/bin/env pwsh
# Railway Deployment Setup Script
# This script helps set up the GitHub Actions + Railway deployment

Write-Host "🚀 Railway Deployment Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to prompt for input with validation
function Get-UserInput {
    param(
        [string]$Prompt,
        [string]$DefaultValue = "",
        [bool]$Required = $true,
        [bool]$Secure = $false
    )
    
    do {
        if ($Secure) {
            $input = Read-Host -Prompt $Prompt -AsSecureString
            $input = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($input))
        } else {
            $input = Read-Host -Prompt $Prompt
        }
        
        if ([string]::IsNullOrWhiteSpace($input) -and ![string]::IsNullOrWhiteSpace($DefaultValue)) {
            $input = $DefaultValue
        }
        
        if ($Required -and [string]::IsNullOrWhiteSpace($input)) {
            Write-Host "❌ This field is required. Please enter a value." -ForegroundColor Red
        }
    } while ($Required -and [string]::IsNullOrWhiteSpace($input))
    
    return $input
}

# Check prerequisites
Write-Host "\n📋 Checking Prerequisites..." -ForegroundColor Yellow

$prerequisites = @(
    @{Name="git"; Command="git"; Required=$true},
    @{Name="GitHub CLI"; Command="gh"; Required=$false},
    @{Name="Railway CLI"; Command="railway"; Required=$false}
)

foreach ($prereq in $prerequisites) {
    if (Test-Command $prereq.Command) {
        Write-Host "✅ $($prereq.Name) is installed" -ForegroundColor Green
    } else {
        if ($prereq.Required) {
            Write-Host "❌ $($prereq.Name) is required but not installed" -ForegroundColor Red
            exit 1
        } else {
            Write-Host "⚠️  $($prereq.Name) is not installed (optional)" -ForegroundColor Yellow
        }
    }
}

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "❌ This script must be run from the root of your git repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Running from git repository" -ForegroundColor Green

# Get repository information
$repoUrl = git config --get remote.origin.url
$currentBranch = git branch --show-current

Write-Host "\n📊 Repository Information:" -ForegroundColor Cyan
Write-Host "Repository: $repoUrl"
Write-Host "Current Branch: $currentBranch"

# Collect configuration
Write-Host "\n🔧 Configuration Setup" -ForegroundColor Yellow
Write-Host "Please provide the following information:\n"

$config = @{}

# Railway Token
$config.RailwayToken = Get-UserInput "Railway API Token (from railway.app/account/tokens)" -Secure $true

# Database URLs
$config.MongoDbUri = Get-UserInput "MongoDB URI (mongodb+srv://...)" -Secure $true
$config.RedisUrl = Get-UserInput "Redis URL (redis://...)" -Secure $true

# JWT Secret
$config.SecretKey = Get-UserInput "JWT Secret Key (generate a secure random string)" -Secure $true

# OpenAI API Key
$config.OpenAiKey = Get-UserInput "OpenAI API Key (sk-...)" -Secure $true

# Google OAuth (optional)
$useGoogleOAuth = Get-UserInput "Do you want to configure Google OAuth? (y/n)" -DefaultValue "n" -Required $false
if ($useGoogleOAuth -eq "y" -or $useGoogleOAuth -eq "yes") {
    $config.GoogleClientId = Get-UserInput "Google OAuth Client ID"
    $config.GoogleClientSecret = Get-UserInput "Google OAuth Client Secret" -Secure $true
}

# Slack webhook (optional)
$useSlack = Get-UserInput "Do you want to configure Slack notifications? (y/n)" -DefaultValue "n" -Required $false
if ($useSlack -eq "y" -or $useSlack -eq "yes") {
    $config.SlackWebhook = Get-UserInput "Slack Webhook URL" -Secure $true
}

# Set GitHub Secrets
Write-Host "\n🔐 Setting GitHub Repository Secrets..." -ForegroundColor Yellow

if (Test-Command "gh") {
    Write-Host "Using GitHub CLI to set secrets..."
    
    $secrets = @{
        "RAILWAY_TOKEN" = $config.RailwayToken
        "MONGODB_URI" = $config.MongoDbUri
        "REDIS_URL" = $config.RedisUrl
        "SECRET_KEY" = $config.SecretKey
        "OPENAI_API_KEY" = $config.OpenAiKey
    }
    
    if ($config.GoogleClientId) {
        $secrets["GOOGLE_OAUTH_CLIENT_ID"] = $config.GoogleClientId
        $secrets["GOOGLE_OAUTH_CLIENT_SECRET"] = $config.GoogleClientSecret
    }
    
    if ($config.SlackWebhook) {
        $secrets["SLACK_WEBHOOK"] = $config.SlackWebhook
    }
    
    foreach ($secret in $secrets.GetEnumerator()) {
        try {
            $secret.Value | gh secret set $secret.Key
            Write-Host "✅ Set secret: $($secret.Key)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to set secret: $($secret.Key)" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "GitHub CLI not available. Please set the following secrets manually:" -ForegroundColor Yellow
    Write-Host "Go to: https://github.com/[your-username]/[your-repo]/settings/secrets/actions\n"
    
    Write-Host "Required Secrets:"
    Write-Host "- RAILWAY_TOKEN: [Your Railway API Token]"
    Write-Host "- MONGODB_URI: [Your MongoDB URI]"
    Write-Host "- REDIS_URL: [Your Redis URL]"
    Write-Host "- SECRET_KEY: [Your JWT Secret Key]"
    Write-Host "- OPENAI_API_KEY: [Your OpenAI API Key]"
    
    if ($config.GoogleClientId) {
        Write-Host "- GOOGLE_OAUTH_CLIENT_ID: [Your Google OAuth Client ID]"
        Write-Host "- GOOGLE_OAUTH_CLIENT_SECRET: [Your Google OAuth Client Secret]"
    }
    
    if ($config.SlackWebhook) {
        Write-Host "- SLACK_WEBHOOK: [Your Slack Webhook URL]"
    }
}

# Commit and push changes
Write-Host "\n📤 Committing and Pushing Changes..." -ForegroundColor Yellow

try {
    git add .
    git commit -m "Add Railway deployment configuration with GitHub Actions"
    git push origin $currentBranch
    Write-Host "✅ Changes committed and pushed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to commit/push changes" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please commit and push manually:" -ForegroundColor Yellow
    Write-Host "git add ."
    Write-Host "git commit -m 'Add Railway deployment configuration'"
    Write-Host "git push origin $currentBranch"
}

# Final instructions
Write-Host "\n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

Write-Host "\nNext Steps:"
Write-Host "1. 🚂 Go to railway.app and create a new project"
Write-Host "2. 🔗 Connect your GitHub repository to Railway"
Write-Host "3. ⚙️  Set environment variables in Railway dashboard:"
Write-Host "   - MONGODB_URI"
Write-Host "   - REDIS_URL"
Write-Host "   - SECRET_KEY"
Write-Host "   - OPENAI_API_KEY"
Write-Host "   - ALLOWED_ORIGINS (set to your Vercel domain)"
if ($config.GoogleClientId) {
    Write-Host "   - GOOGLE_OAUTH_CLIENT_ID"
    Write-Host "   - GOOGLE_OAUTH_CLIENT_SECRET"
}

Write-Host "\n4. 🚀 Push to master branch to trigger deployment:"
Write-Host "   git push origin master"

Write-Host "\n5. 🌐 Update Vercel environment variables:"
Write-Host "   - NEXT_PUBLIC_API_URL: https://your-app.railway.app"
Write-Host "   - NEXT_PUBLIC_API_BASE_URL: https://your-app.railway.app/api/v1"

Write-Host "\n6. 🧪 Test the deployment:"
Write-Host "   curl https://your-app.railway.app/health"

Write-Host "\n📚 For detailed instructions, see: GITHUB_ACTIONS_RAILWAY_DEPLOYMENT.md"

Write-Host "\n✨ Happy deploying!" -ForegroundColor Cyan