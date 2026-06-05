# 📦 Building App Launcher as EXE

## Prerequisites
- Node.js installed (v14 or higher)
- All dependencies installed

## Step 1: Install Dependencies

### Server Dependencies
```bash
cd server
npm install
```

### Electron App Dependencies
```bash
cd electron-app
npm install
```

## Step 2: Build the EXE

```bash
cd electron-app
npm run build
```

This will create a Windows installer in `electron-app/dist/` folder.

## Step 3: Output Files

After building, you'll find:

- **Installer**: `electron-app/dist/App Launcher Setup 1.0.0.exe`
- **Unpacked**: `electron-app/dist/win-unpacked/` (portable version)

## Installation Options

### Option 1: Use the Installer
1. Run `App Launcher Setup 1.0.0.exe`
2. Choose installation directory
3. Installer will create:
   - Desktop shortcut
   - Start menu shortcut
4. Launch from shortcuts

### Option 2: Portable Version
1. Go to `electron-app/dist/win-unpacked/`
2. Run `App Launcher.exe` directly
3. No installation required!

## Distribution

To share with others:

### Share the Installer (Recommended)
- File: `App Launcher Setup 1.0.0.exe`
- Size: ~150MB (includes everything)
- Users run installer to install

### Share Portable Version
1. Zip the entire `win-unpacked` folder
2. Users extract and run `App Launcher.exe`
3. No installation required

## Important Notes

⚠️ **The Electron app requires the server to be running!**

Users need to:
1. Install the Electron app (from EXE)
2. Start the server separately:
   ```bash
   cd server
   npm install  # First time only
   node index.js
   ```
3. Then launch the Electron app

## Complete Package Distribution

To distribute everything as a complete package:

1. Create a folder structure:
   ```
   AppLauncher/
   ├── server/
   │   ├── index.js
   │   ├── package.json
   │   ├── routes/
   │   └── urls.json
   ├── admin/
   │   └── index.html
   ├── App Launcher Setup.exe
   ├── START_SERVER.bat
   └── README.txt
   ```

2. Create `START_SERVER.bat`:
   ```batch
   @echo off
   cd server
   if not exist "node_modules" (
       echo Installing dependencies...
       call npm install
   )
   echo Starting server...
   node index.js
   ```

3. Create `README.txt`:
   ```
   App Launcher Setup Instructions:
   
   1. Run "START_SERVER.bat" - Keep this window open
   2. Run "App Launcher Setup.exe" to install
   3. Launch "App Launcher" from desktop/start menu
   4. Open browser to http://localhost:3000/admin to manage apps
   
   The server must be running for the app to work!
   ```

## Build Customization

Edit `electron-app/package.json` to customize:
- `productName`: App display name
- `appId`: Unique app identifier
- `icon`: Path to custom icon (256x256 PNG or ICO)
- `version`: Version number

## Troubleshooting

### Build fails
- Make sure all dependencies are installed
- Run `npm install` in electron-app folder
- Check Node.js version (v14+)

### EXE doesn't start
- Server must be running first
- Check Windows Defender/antivirus
- Run as administrator if needed

### Icon not showing
- Icon must be .ico format
- Recommended size: 256x256 pixels
- Place in `electron-app/assets/icon.ico`

## Re-building

To rebuild after changes:
```bash
cd electron-app
npm run build
```

New installer will be in `dist/` folder.

---

Built with ❤️ using Electron
