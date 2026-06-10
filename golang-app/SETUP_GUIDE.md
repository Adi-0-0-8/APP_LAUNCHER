# 🚀 Complete Setup Guide - Golang App

## Step 1: Install Go (5 minutes)

1. **Download Go:**
   - Go to: https://go.dev/dl/
   - Download: `go1.21.6.windows-amd64.msi` (or latest)
   - Run installer
   - Click "Next" → "Next" → "Install"

2. **Verify Installation:**
   ```bash
   # Open NEW terminal (important!)
   go version
   # Should show: go version go1.21.6 windows/amd64
   ```

---

## Step 2: Install Wails CLI (2 minutes)

```bash
# Install Wails
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Verify
wails version
# Should show: Wails CLI v2.x.x
```

---

## Step 3: Create Wails Project (3 minutes)

```bash
cd c:\Users\AdityaU\Downloads\Electron

# Create new Wails project
wails init -n app-launcher-go -t vanilla

cd app-launcher-go
```

---

## Step 4: Copy Your UI Files (1 minute)

```bash
# Copy your existing HTML/CSS/JS
Copy-Item ..\electron-app\renderer\* -Destination frontend\ -Recurse -Force

# Copy icon
Copy-Item ..\electron-app\assets\icon.ico -Destination build\windows\icon.ico -Force
```

---

## Step 5: Update Configuration (2 minutes)

Edit `wails.json`:
```json
{
  "name": "AppLauncher",
  "outputfilename": "AppLauncher",
  "frontend:install": "",
  "frontend:build": "",
  "frontend:dev:watcher": "",
  "frontend:dev:serverUrl": "auto",
  "author": {
    "name": "Aditya U"
  },
  "info": {
    "productName": "AppLauncher",
    "productVersion": "1.0.7",
    "copyright": "Copyright © 2026 Aditya U"
  }
}
```

---

## Step 6: Build the App (3 minutes)

```bash
# Build for Windows
wails build

# Output will be in: build\bin\AppLauncher.exe (~15 MB)
```

---

## Step 7: Test It!

```bash
# Run in development mode
wails dev

# Or run the built exe
.\build\bin\AppLauncher.exe
```

---

## 📊 Result

**You'll get:**
- ✅ `AppLauncher.exe` (~15 MB)
- ✅ Same UI (your HTML/CSS/JS)
- ✅ Native Windows app
- ✅ Fast startup (0.5s)
- ✅ Low memory (30 MB RAM)

---

## 🔧 Troubleshooting

### "wails: command not found"
- Close and reopen terminal
- Or add Go bin to PATH: `C:\Users\YourName\go\bin`

### "gcc: command not found"
- Download: https://jmeubank.github.io/tdm-gcc/download/
- Install TDM-GCC 10.3.0 (64-bit)
- Restart terminal

### Build fails
- Make sure Go is in PATH
- Run: `go env GOPATH`
- Check output shows proper path

---

## 📝 Next Steps After Building

1. **Test the exe:** `.\build\bin\AppLauncher.exe`
2. **Create installer:** Use Inno Setup or NSIS
3. **Distribute:** Send the 15 MB exe!

---

## 🎯 Timeline

- Install Go: 5 minutes
- Install Wails: 2 minutes  
- Create project: 3 minutes
- Copy files: 1 minute
- Configure: 2 minutes
- Build: 3 minutes
- **Total: ~15 minutes**

---

## 💡 Advantages vs Electron

| Feature | Electron | Wails (Go) |
|---------|----------|------------|
| Download | 73 MB | 15 MB |
| Installed | 270 MB | 20 MB |
| Startup | 2-3s | 0.5s |
| Memory | 150 MB | 30 MB |
| UI | HTML/CSS/JS | Same! |

---

**Start with Step 1!** 🚀
