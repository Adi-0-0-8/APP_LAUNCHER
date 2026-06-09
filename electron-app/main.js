const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

let mainWindow;
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

// Get server URL from environment variable or use hardcoded default
const SERVER_URL = process.env.SERVER_URL || 'https://app-launcher-u0x7.onrender.com';

console.log('===========================================');
console.log('🚀 Starting Electron App');
console.log('📡 Server URL:', SERVER_URL);
console.log('📦 App Version:', app.getVersion());
console.log('===========================================');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ App is up to date:', info.version);
});

autoUpdater.on('error', (err) => {
  console.error('❌ Update error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`⬇️ Download progress: ${Math.round(progressObj.percent)}%`);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj.percent);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// Load or create configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  return { serverUrl: SERVER_URL };
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

const config = loadConfig();

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { height: screenHeight } = primaryDisplay.workArea;
  
  // Window stays fixed size - NEVER resized
  mainWindow = new BrowserWindow({
    width: 110,
    height: screenHeight,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('server-url', config.serverUrl);
  });

  mainWindow.on('close', () => {
    saveConfig(config);
  });

  // --- Mouse-based expand/collapse ---
  let isExpanded = false;

  // Start collapsed: ignore mouse events but forward them so we still get
  // Chromium-level mousemove for the hover-detection strip
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Poll the global cursor position every 100 ms
  setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const mousePos = screen.getCursorScreenPoint();

    if (!isExpanded && mousePos.x <= 8) {
      // Mouse is at the left edge → expand
      isExpanded = true;
      mainWindow.setIgnoreMouseEvents(false);          // accept clicks
      mainWindow.webContents.send('sidebar-expand');
      console.log('🖱️  Mouse at edge → expand');
    } else if (isExpanded && mousePos.x > 120) {
      // Mouse moved well past the sidebar → collapse
      isExpanded = false;
      mainWindow.setIgnoreMouseEvents(true, { forward: true }); // click-through
      mainWindow.webContents.send('sidebar-collapse');
      console.log('🖱️  Mouse away → collapse');
    }
  }, 100);
}

// IPC Handler: Fetch URLs from server
ipcMain.handle('fetch-urls', async () => {
  return new Promise((resolve, reject) => {
    const protocol = config.serverUrl.startsWith('https') ? https : http;
    const url = `${config.serverUrl}/urls`;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
});

// IPC Handler: Open URL
ipcMain.handle('open-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});




// IPC Handler: Quit app
ipcMain.on('quit-app', () => {
  app.quit();
});

// IPC Handler: Download update
ipcMain.on('download-update', () => {
  console.log('⬇️ Starting update download...');
  autoUpdater.downloadUpdate();
});

// IPC Handler: Install update
ipcMain.on('install-update', () => {
  console.log('🔄 Installing update and restarting...');
  autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
  createWindow();
  
  // Check for updates after 3 seconds (give app time to load)
  setTimeout(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('🔍 Checking for updates...');
      autoUpdater.checkForUpdates().catch(err => {
        console.log('⚠️ Could not check for updates:', err.message);
      });
    }
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
