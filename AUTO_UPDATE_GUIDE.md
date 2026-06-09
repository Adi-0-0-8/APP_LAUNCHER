# 🔄 Auto-Update System Guide

## Overview
Your Electron app now supports **automatic updates** via GitHub Releases. Users will automatically receive updates without needing to manually download and reinstall the app.

## How It Works

### For Users:
1. Open the app → App checks GitHub for new versions (after 3 seconds)
2. If update found → Downloads automatically in the background
3. Update installs automatically when user closes the app
4. Next time they open → Updated version! ✨

### For You (Developer):
When you want to push an update:

## 📦 Step-by-Step: Releasing an Update

### 1. **Update Version Number**
Edit `electron-app/package.json`:
```json
{
  "version": "1.0.2"  // Increment this (was 1.0.1)
}
```

### 2. **Build the App**
```bash
cd electron-app
npm run build
```

This creates TWO installers in `dist/`:
- `AppLauncher-Setup.exe` - Auto-updatable installer (for new users)
- `AppLauncher-Portable.exe` - Portable version (no auto-update)
- `latest.yml` - Update manifest file (important!)

### 3. **Create GitHub Release**

#### Option A: Manual Release (Easier)
1. Go to: https://github.com/Adi-0-0-8/APP_LAUNCHER/releases
2. Click "**Draft a new release**"
3. **Tag version**: `v1.0.2` (must match package.json version with 'v' prefix)
4. **Release title**: `v1.0.2` or "Version 1.0.2 - Bug Fixes"
5. **Description**: Write what's new:
   ```
   ## What's New
   - Fixed JavaScript error in sidebar
   - Added duplicate URL detection
   - Improved auto-expand/collapse behavior
   ```
6. **Upload files**: Drag these 3 files from `dist/`:
   - `AppLauncher-Setup.exe`
   - `AppLauncher-Portable.exe` (optional, for users who want portable)
   - `latest.yml` ⚠️ **REQUIRED** for auto-update!
7. Click "**Publish release**"

#### Option B: Automated Release (Requires GitHub Token)
```bash
# Set GitHub token as environment variable
set GH_TOKEN=your_github_personal_access_token

# Build and publish automatically
cd electron-app
npm run release
```

### 4. **Users Get Updated Automatically**
- Users open the app → Checks GitHub → Downloads v1.0.2
- When they close the app → Installs automatically
- Next open → Running v1.0.2! 🎉

## 🔐 GitHub Token Setup (For Automated Releases)

1. Go to: https://github.com/settings/tokens
2. Click "**Generate new token (classic)**"
3. Name: `electron-builder-releases`
4. Scopes: Check ✅ `repo` (all sub-options)
5. Click "**Generate token**"
6. **Copy the token** (you won't see it again!)
7. Set as environment variable:
   ```bash
   # Windows CMD
   setx GH_TOKEN "ghp_yourtoken..."
   
   # Windows PowerShell
   $env:GH_TOKEN = "ghp_yourtoken..."
   
   # Or add to electron-app/.env file
   GH_TOKEN=ghp_yourtoken...
   ```

## 📋 Quick Checklist

Before releasing an update:
- [ ] Increment version in `package.json`
- [ ] Test the app locally (`npm start`)
- [ ] Build the app (`npm run build`)
- [ ] Create GitHub release with tag matching version
- [ ] Upload `AppLauncher-Setup.exe` and `latest.yml`
- [ ] Publish the release

## 🎯 Two Types of Updates

### 1. **Server/Admin Changes** (No App Update Needed)
- Adding/removing URLs → Just push to GitHub, Render auto-deploys
- Changing admin panel → Vercel auto-deploys
- Users see changes immediately (no app update)

### 2. **Electron App Changes** (Requires App Update)
- UI changes, new features, bug fixes
- Follow the release process above
- Users get updated automatically

## ⚠️ Important Notes

1. **Version must match**: Tag `v1.0.2` must match `package.json` version `1.0.2`
2. **Always include `latest.yml`**: This tells the app where to find updates
3. **Installer vs Portable**: 
   - `Setup.exe` = Auto-updatable (recommended for users)
   - `Portable.exe` = No auto-update, single EXE
4. **First distribution**: Give users the `Setup.exe`, not `Portable.exe`

## 🧪 Testing Updates

To test if auto-update works:
1. Build version 1.0.1, install it
2. Create GitHub release v1.0.2
3. Open v1.0.1 app → Check console logs
4. Should see: "Update available: 1.0.2"
5. Close app → Should auto-install
6. Re-open → Check "About" shows v1.0.2

## 📊 Example Release Schedule

```
v1.0.1 - Initial release (December 1)
v1.0.2 - Bug fixes (December 5)
v1.1.0 - New features (December 15)
v1.1.1 - Hotfix (December 16)
v2.0.0 - Major update (January 1)
```

## 🎓 Versioning Guide

- **1.0.x** - Bug fixes, minor changes
- **1.x.0** - New features, no breaking changes
- **x.0.0** - Major update, breaking changes

---

**That's it!** Your users will always have the latest version automatically. 🚀
