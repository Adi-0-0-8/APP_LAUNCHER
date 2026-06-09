# 🔧 Manual Release Guide (Temporary Fix)

Since GitHub Actions is having issues, let's create the release manually:

## 📦 Step 1: Build v1.0.2 Locally

```bash
cd electron-app
npm run build
npx electron-builder --win nsis --config
```

This creates:
- `dist/AppLauncher-Setup.exe`
- `dist/AppLauncher-Portable.exe`  
- `dist/latest.yml`

---

## 🚀 Step 2: Create GitHub Release Manually

1. Go to: https://github.com/Adi-0-0-8/APP_LAUNCHER/releases
2. Click **"Draft a new release"**
3. Fill in:
   - **Tag:** `v1.0.2`
   - **Title:** `Version 1.0.2`
   - **Description:**
     ```
     ## 🚀 What's New in v1.0.2
     
     - Added version badge for testing auto-update
     - Fixed sidebar expand event names
     
     **For existing users:** Your app will auto-update when you restart it.
     **For new users:** Download and run AppLauncher-Setup.exe
     ```
4. **Upload files** from `electron-app/dist/`:
   - `AppLauncher-Setup.exe`
   - `AppLauncher-Portable.exe`
   - `latest.yml` ⚠️ **REQUIRED for auto-update!**
5. Click **"Publish release"**

---

## 🧪 Step 3: Test Auto-Update

Now follow the TEST_AUTO_UPDATE.md guide!

---

## 🔧 Fix GitHub Actions Later

We can debug the Actions workflow after testing. For now, manual release works fine!
