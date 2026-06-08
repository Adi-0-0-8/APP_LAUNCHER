const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
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
console.log('===========================================');

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
  
  mainWindow = new BrowserWindow({
    width: 80,
    height: screenHeight,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
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

// IPC Handler: Toggle pin
ipcMain.handle('toggle-pin', async (event, appId) => {
  return new Promise((resolve, reject) => {
    const protocol = config.serverUrl.startsWith('https') ? https : http;
    const url = `${config.serverUrl}/urls/${appId}/pin`;
    
    const req = protocol.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
});

// IPC Handler: Expand window
// IPC Handler: Expand window
ipcMain.on('expand-window', () => {
  if (mainWindow) {
    console.log('📢 Expand window called');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { height: screenHeight } = primaryDisplay.workArea;
    mainWindow.setSize(80, screenHeight);
    mainWindow.setPosition(0, 0);
    console.log('✅ Window expanded to 80px');
  }
});

// IPC Handler: Collapse window
ipcMain.on('collapse-window', () => {
  if (mainWindow) {
    console.log('📢 Collapse window called');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { height: screenHeight } = primaryDisplay.workArea;
    mainWindow.setSize(5, screenHeight);
    mainWindow.setPosition(0, 0);
    console.log('✅ Window collapsed to 5px');
  }
});

// IPC Handler: Quit app
ipcMain.on('quit-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

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
