const { app, BrowserWindow, ipcMain, shell, screen, dialog } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

let mainWindow;
let isExpanded = false;
let lastCollapsedPosition = { x: 100, y: 100 };
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

// Load environment variables (if .env exists)
let SERVER_URL = 'http://localhost:3000'; // Default
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/SERVER_URL=(.+)/);
    if (match) {
      SERVER_URL = match[1].trim();
    }
  }
} catch (error) {
  console.error('Could not load .env:', error);
}

// Load or create configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);
      console.log('Loaded config:', config);
      return config;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  
  // Default config
  return {
    serverUrl: SERVER_URL,
    position: { x: 100, y: 100 }
  };
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Saved config:', config);
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

const config = loadConfig();
lastCollapsedPosition = config.position || { x: 100, y: 100 };

console.log('Using server URL:', config.serverUrl);

// Save position
function saveWindowPosition() {
  if (isExpanded) {
    console.log('Skipping save - window is expanded');
    return;
  }
  
  try {
    const [x, y] = mainWindow.getPosition();
    const position = { x, y };
    lastCollapsedPosition = position;
    
    config.position = position;
    saveConfig(config);
    console.log('Saved collapsed position:', position);
  } catch (error) {
    console.error('Failed to save window position:', error);
  }
}

function createWindow() {
  const savedPosition = lastCollapsedPosition;
  
  mainWindow = new BrowserWindow({
    width: 50,
    height: 50,
    x: savedPosition.x,
    y: savedPosition.y,
    frame: false,
    transparent: true,
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

  // Open DevTools in development only
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Send server URL to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('server-url', config.serverUrl);
  });

  // Prevent window from going completely off-screen during drag
  let isDragging = false;
  let dragCheckInterval = null;

  mainWindow.on('will-move', () => {
    isDragging = true;
    if (!dragCheckInterval) {
      dragCheckInterval = setInterval(() => {
        const bounds = mainWindow.getBounds();
        const displays = screen.getAllDisplays();
        let isVisible = false;

        // Check if window is visible on any display
        for (const display of displays) {
          const area = display.workArea;
          if (bounds.x < area.x + area.width && 
              bounds.x + bounds.width > area.x &&
              bounds.y < area.y + area.height && 
              bounds.y + bounds.height > area.y) {
            isVisible = true;
            break;
          }
        }

        // If completely off-screen, reset to safe position
        if (!isVisible) {
          const primaryDisplay = screen.getPrimaryDisplay();
          const { x, y, width, height } = primaryDisplay.workArea;
          mainWindow.setPosition(x + 100, y + 100);
        }
      }, 100);
    }
  });

  // Save position after move completes
  mainWindow.on('moved', () => {
    isDragging = false;
    if (dragCheckInterval) {
      clearInterval(dragCheckInterval);
      dragCheckInterval = null;
    }
    saveWindowPosition();
  });

  // Also save position before closing
  mainWindow.on('close', () => {
    saveWindowPosition();
  });
}

// IPC Handler: Fetch URLs from server
ipcMain.handle('fetch-urls', async () => {
  return new Promise((resolve, reject) => {
    const protocol = config.serverUrl.startsWith('https') ? https : http;
    const url = `${config.serverUrl}/urls`;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const urls = JSON.parse(data);
          resolve(urls);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
});

// IPC Handler: Open URL in default browser
ipcMain.handle('open-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler: Expand window
ipcMain.on('expand-window', () => {
  if (mainWindow) {
    // Save current collapsed position before expanding
    const [currentX, currentY] = mainWindow.getPosition();
    lastCollapsedPosition = { x: currentX, y: currentY };
    
    const display = screen.getDisplayMatching({ x: currentX, y: currentY, width: 50, height: 50 });
    const workArea = display.workArea;
    
    let newX = currentX;
    let newY = currentY;
    
    // Make sure expanded window fits on screen
    if (newX + 80 > workArea.x + workArea.width) {
      newX = workArea.x + workArea.width - 80;
    }
    if (newY + 600 > workArea.y + workArea.height) {
      newY = workArea.y + workArea.height - 600;
    }
    if (newX < workArea.x) {
      newX = workArea.x;
    }
    if (newY < workArea.y) {
      newY = workArea.y;
    }
    
    isExpanded = true;
    mainWindow.setSize(80, 600);
    mainWindow.setPosition(newX, newY);
    console.log('Expanded window at:', newX, newY);
  }
});

// IPC Handler: Collapse window
ipcMain.on('collapse-window', () => {
  if (mainWindow) {
    // Return to last collapsed position
    mainWindow.setSize(50, 50);
    mainWindow.setPosition(lastCollapsedPosition.x, lastCollapsedPosition.y);
    isExpanded = false;
    saveWindowPosition();
    console.log('Collapsed window to:', lastCollapsedPosition);
  }
});

// IPC Handler: Reset position (emergency reset)
ipcMain.on('reset-position', () => {
  if (mainWindow) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y } = primaryDisplay.workArea;
    lastCollapsedPosition = { x: x + 100, y: y + 100 };
    mainWindow.setSize(50, 50);
    mainWindow.setPosition(lastCollapsedPosition.x, lastCollapsedPosition.y);
    isExpanded = false;
    saveWindowPosition();
  }
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
