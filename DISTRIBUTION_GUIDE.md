# 📦 Distribution Guide - Which File to Send Users?

## 🎯 Quick Answer

**Send users:** `AppLauncher-Setup.exe` (73.24 MB)

This is the **installer** that supports automatic updates.

---

## 📁 File Breakdown

Your build creates these files in `electron-app/dist/`:

### ✅ **AppLauncher-Setup.exe** (73.24 MB)
- **What:** Installer with auto-update support
- **Who:** Send this to ALL users
- **Why:** Users will automatically get future updates
- **Install:** User runs it → Choose install location → Creates Start Menu shortcut

### ⚠️ **AppLauncher-Portable.exe** (66.46 MB)
- **What:** Portable single EXE (no install needed)
- **Who:** Only for users who specifically want portable version
- **Why:** Doesn't support auto-updates (they must manually download new versions)
- **Use:** Double-click and runs immediately, no installation

### 📄 **latest.yml** (<1 KB)
- **What:** Update manifest file
- **Who:** DON'T send to users
- **Why:** Only needed for GitHub Releases (tells app where updates are)

---

## 🚀 Distribution Workflow

### For New Users (First Time):
1. Send them: `AppLauncher-Setup.exe`
2. They install it once
3. They're done! Future updates are automatic

### For Updates:
1. You: Build new version → Create GitHub Release
2. Users: App auto-downloads and installs
3. No need to send them anything!

---

## 📊 Comparison

| Feature | Setup.exe | Portable.exe |
|---------|-----------|--------------|
| Auto-update | ✅ Yes | ❌ No |
| Installation required | ✅ Yes | ❌ No |
| Start menu shortcut | ✅ Yes | ❌ No |
| Desktop shortcut | ✅ Optional | ❌ No |
| File size | 73 MB | 66 MB |
| **Recommended** | ✅ **YES** | Only for special cases |

---

## 💡 Recommendations

**Most users:** Send `AppLauncher-Setup.exe`
- Installs properly
- Creates shortcuts
- Gets automatic updates
- Professional experience

**Power users who want portable:** Send `AppLauncher-Portable.exe`
- No installation
- Run from USB drive
- Must manually update

---

## 🎓 User Instructions

### For Setup.exe:
```
1. Download AppLauncher-Setup.exe
2. Double-click to run the installer
3. Choose install location (or use default)
4. Click Install
5. Done! App will auto-update in future
```

### For Portable.exe:
```
1. Download AppLauncher-Portable.exe
2. Move to desired folder (Desktop, USB drive, etc.)
3. Double-click to run
4. No installation needed
5. To "uninstall": Just delete the .exe file
```

---

## 🔄 Update Strategy

**Setup.exe users:**
- Build new version → Create GitHub release → Users automatically get it
- They never need to download again

**Portable.exe users:**
- Build new version → Send them new Portable.exe
- They must manually replace the old file

**Winner:** Setup.exe (auto-update = happy users) 🏆

---

**Bottom line:** Always recommend `AppLauncher-Setup.exe` to users unless they specifically need portable version!
