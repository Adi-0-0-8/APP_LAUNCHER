# Quick Install Script for Golang AppLauncher
Write-Host "🚀 AppLauncher - Golang Version Setup" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Step 1: Check if Go is installed
Write-Host "📦 Step 1: Checking Go installation..." -ForegroundColor Yellow
try {
    $goVersion = go version 2>&1
    Write-Host "✅ Go is installed: $goVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Go is NOT installed!`n" -ForegroundColor Red
    Write-Host "Please install Go first:" -ForegroundColor Yellow
    Write-Host "1. Download: https://go.dev/dl/" -ForegroundColor White
    Write-Host "2. Install the .msi file" -ForegroundColor White
    Write-Host "3. Restart terminal and run this script again`n" -ForegroundColor White
    pause
    exit
}

# Step 2: Install Wails
Write-Host "📦 Step 2: Installing Wails CLI..." -ForegroundColor Yellow
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Add GOPATH to current session if not in PATH
$goPath = go env GOPATH
$goBin = Join-Path $goPath "bin"
if ($env:PATH -notlike "*$goBin*") {
    $env:PATH += ";$goBin"
    Write-Host "✅ Added Go bin to PATH for this session`n" -ForegroundColor Green
}

# Step 3: Verify Wails
Write-Host "📦 Step 3: Verifying Wails installation..." -ForegroundColor Yellow
try {
    $wailsVersion = wails version 2>&1
    Write-Host "✅ Wails installed: $wailsVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Wails installation failed!`n" -ForegroundColor Red
    Write-Host "Try manually: go install github.com/wailsapp/wails/v2/cmd/wails@latest`n" -ForegroundColor Yellow
    pause
    exit
}

# Step 4: Create Wails project
Write-Host "📦 Step 4: Creating Wails project..." -ForegroundColor Yellow
Set-Location ..
if (Test-Path "app-launcher-go") {
    Write-Host "⚠️  Project already exists, skipping creation`n" -ForegroundColor Yellow
} else {
    wails init -n app-launcher-go -t vanilla
    Write-Host "✅ Project created`n" -ForegroundColor Green
}

Set-Location app-launcher-go

# Step 5: Copy UI files
Write-Host "📦 Step 5: Copying UI files..." -ForegroundColor Yellow
if (Test-Path "..\electron-app\renderer") {
    Copy-Item ..\electron-app\renderer\* -Destination frontend\ -Recurse -Force
    Write-Host "✅ UI files copied`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Electron UI files not found, using default`n" -ForegroundColor Yellow
}

# Step 6: Copy icon
Write-Host "📦 Step 6: Copying icon..." -ForegroundColor Yellow
if (Test-Path "..\electron-app\assets\icon.ico") {
    New-Item -ItemType Directory -Path "build\windows" -Force | Out-Null
    Copy-Item ..\electron-app\assets\icon.ico -Destination build\windows\icon.ico -Force
    Write-Host "✅ Icon copied`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Icon not found, using default`n" -ForegroundColor Yellow
}

# Step 7: Build
Write-Host "📦 Step 7: Building application..." -ForegroundColor Yellow
Write-Host "(This may take 2-3 minutes...)`n" -ForegroundColor White

wails build

if (Test-Path "build\bin\app-launcher-go.exe") {
    Write-Host "`n✅ Build successful!`n" -ForegroundColor Green
    
    $size = (Get-Item "build\bin\app-launcher-go.exe").Length / 1MB
    Write-Host "📊 File size: $([math]::Round($size, 2)) MB`n" -ForegroundColor Cyan
    
    Write-Host "🎉 All done!" -ForegroundColor Green
    Write-Host "Your app is ready at: build\bin\app-launcher-go.exe`n" -ForegroundColor White
    
    Write-Host "To run it: .\build\bin\app-launcher-go.exe" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Build failed!`n" -ForegroundColor Red
    Write-Host "Check the error messages above`n" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
pause
