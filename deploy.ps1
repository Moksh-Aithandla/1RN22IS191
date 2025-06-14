# Average Calculator Microservice Deployment Script (PowerShell)
# Author: Moksh Aithandla (1RN22IS191)

Write-Host "🚀 Average Calculator Microservice Deployment" -ForegroundColor Green
Write-Host "=============================================="

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v14 or higher." -ForegroundColor Red
    exit 1
}

# Check if port 9876 is available
$portInUse = Get-NetTCPConnection -LocalPort 9876 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 9876 is already in use. Stopping existing processes..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "📋 Deployment Options:"
Write-Host "1. Pure Node.js (No Dependencies) - Recommended"
Write-Host "2. Express Framework (With Dependencies)"
Write-Host "3. Docker Deployment"
Write-Host "4. Run Tests Only"

$option = Read-Host "Select option (1-4)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🟢 Starting Pure Node.js Server..." -ForegroundColor Green
        Write-Host "No dependencies required!" -ForegroundColor Cyan
        Write-Host "🌐 Server will be available at: http://localhost:9876" -ForegroundColor Cyan
        Write-Host "📊 Health check: http://localhost:9876/health" -ForegroundColor Cyan
        Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        node server-pure.js
    }
    "2" {
        Write-Host ""
        Write-Host "🟡 Installing dependencies..." -ForegroundColor Yellow
        npm install
        Write-Host "🟢 Starting Express Server..." -ForegroundColor Green
        npm start
    }
    "3" {
        Write-Host ""
        Write-Host "🐳 Docker Deployment..." -ForegroundColor Blue
        
        # Check if Docker is installed
        try {
            docker --version | Out-Null
        } catch {
            Write-Host "❌ Docker is not installed." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Building Docker image..." -ForegroundColor Cyan
        docker-compose up --build -d
        
        Write-Host "✅ Container started successfully!" -ForegroundColor Green
        Write-Host "🌐 Service available at: http://localhost:9876" -ForegroundColor Cyan
        Write-Host "📊 Health check: http://localhost:9876/health" -ForegroundColor Cyan
        
        # Wait for container to be ready
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "🧪 Testing container health..." -ForegroundColor Yellow
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:9876/health" -Method GET
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            Write-Host "Service Status: $($healthResponse.status)" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Health check failed" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host ""
        Write-Host "🧪 Running Test Suite..." -ForegroundColor Yellow
        
        # Start server in background for testing
        $serverJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            node server-pure.js 
        }
        
        # Wait for server to start
        Start-Sleep -Seconds 3
        
        # Run tests
        node test-pure.js
        
        # Stop server
        Stop-Job $serverJob
        Remove-Job $serverJob
    }
    default {
        Write-Host "❌ Invalid option selected." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📚 Additional Resources:" -ForegroundColor Cyan
Write-Host "- API Testing Guide: API-TESTING-GUIDE.md"
Write-Host "- Documentation: README-PURE.md"
Write-Host "- GitHub Repository: https://github.com/Moksh-Aithandla/evaluation"