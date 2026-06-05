# 📦 Distribution Guide - App Launcher

## For Administrators (You)

### Setup Your Central Server

1. **Host the server** on a machine accessible to all users:
   ```bash
   cd server
   npm install
   node index.js
   ```

2. **Get your server URL**:
   - Local network: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)
   - Public server: `http://yourdomain.com:3000` or `https://yourdomain.com`

3. **Manage apps** from admin panel:
   - Open: `http://YOUR_SERVER:3000/admin`
   - Add/remove apps as needed
   - All users will see these apps automatically

### Build the Electron App

1. **Update server URL** in `electron-app/main.js`:
   ```javascript
   // Change line ~30
   serverUrl: 'http://YOUR_SERVER_IP:3000',  // Your server URL
   ```

2. **Build the EXE**:
   ```bash
   cd electron-app
   npm install
   npm run build
   ```

3. **Find the installer**:
   - `electron-app\dist\App Launcher Setup 1.0.0.exe`

---

## For End Users (Clients)

### What They Get
- **Single EXE installer**: `App Launcher Setup 1.0.0.exe` (~150MB)
- **Just the floating launcher** - No admin panel, no server setup

### Installation (User)

1. **Download and run** `App Launcher Setup 1.0.0.exe`
2. Follow the installation wizard
3. Launch "App Launcher" from desktop shortcut
4. A floating rocket 🚀 appears on screen
5. **Done!** No configuration needed

### Using the App (User)

1. **See available apps**: Click the floating 🚀 rocket
2. **Open an app**: Click any app icon in the sidebar
3. **Move the launcher**: Drag the rocket anywhere on screen
4. **Reset position**: Double-click the rocket if it gets stuck

### User Features
- ✅ Floating launcher icon (always on top)
- ✅ Auto-syncs apps from your central server
- ✅ Click to open apps in browser
- ✅ Drag to reposition
- ✅ Remembers position on restart
- ❌ No admin panel (managed by you)
- ❌ No server setup required

---

## Distribution Workflow

### Step 1: Setup Your Server (Once)
```
Your Server Machine:
├── server/
│   ├── node index.js  ← Running 24/7
│   └── urls.json      ← Your app list
└── Admin Panel
    └── http://YOUR_IP:3000/admin
```

### Step 2: Build the Client App (Once)
1. Update server URL in code
2. Build EXE
3. Get installer file

### Step 3: Distribute to Users
1. Share `App Launcher Setup 1.0.0.exe`
2. Users install and run
3. They see apps you publish from admin panel

### Step 4: Manage Apps Centrally
- You add/remove apps from admin panel
- All users see changes automatically (within 5 seconds)
- No need to redistribute the EXE

---

## Network Requirements

### For Admin (You)
- Server must be accessible to all users
- Firewall: Allow port 3000 (or your custom port)
- For remote access: Port forwarding or VPN

### For Users
- Must be able to reach your server URL
- Same network: Easy (local IP)
- Remote: Requires public IP or domain
- Firewall: Allow outgoing HTTP/HTTPS

---

## Testing Before Distribution

1. **Start your server**:
   ```bash
   cd server
   node index.js
   ```

2. **Test from another computer**:
   - Open browser: `http://YOUR_IP:3000/admin`
   - If this works, the Electron app will work too

3. **Build and test EXE**:
   - Install on test machine
   - Verify it connects to your server
   - Verify apps appear correctly

---

## Custom Branding

Before building, you can customize:

1. **App Name** (`electron-app/package.json`):
   ```json
   "productName": "Your Company Launcher"
   ```

2. **App Icon** (`electron-app/assets/icon.ico`):
   - Create 256x256 PNG
   - Convert to ICO format
   - Replace default icon

3. **Server URL** (hardcoded in `main.js`):
   ```javascript
   serverUrl: 'http://your-company-server.com:3000'
   ```

4. **Rebuild**:
   ```bash
   npm run build
   ```

---

## Updating Apps

### Adding New Apps
1. Open admin panel: `http://YOUR_SERVER:3000/admin`
2. Enter URL (e.g., `https://github.com`)
3. Optionally: Custom icon or upload image
4. Click "Publish"
5. **All users see it within 5 seconds**

### Removing Apps
1. Open admin panel
2. Click "Unpublish" on any app
3. **All users lose access within 5 seconds**

No need to update or reinstall the client app!

---

## Advanced: Public Access

To make your server accessible over internet:

### Option 1: Cloud Server (Recommended)
1. Deploy server to cloud (AWS, DigitalOcean, Heroku)
2. Get public URL: `https://yourdomain.com`
3. Update EXE with public URL
4. Users access from anywhere

### Option 2: Port Forwarding
1. Setup port forwarding on your router (port 3000)
2. Get your public IP
3. Update EXE: `http://YOUR_PUBLIC_IP:3000`
4. Users access over internet

### Option 3: VPN/Tailscale
1. Setup company VPN or Tailscale
2. Use internal network IP
3. Users connect via VPN

---

## Troubleshooting for Users

### "Unable to connect to server"
- Check internet connection
- Verify server is running
- Check firewall settings
- Contact admin (you)

### Launcher disappeared
- Double-click desktop shortcut
- Or: Search "App Launcher" in Start Menu

### Can't move launcher
- Try double-clicking to reset position

---

## Summary

**You (Admin)**:
- Run the server once
- Build EXE once (with your server URL)
- Manage apps from web panel anytime

**Users (Clients)**:
- Install EXE once
- Get automatic app updates
- No configuration needed
- Simple floating launcher

**Updates**:
- Apps: Just update via admin panel
- Launcher: Only if you want to change features/design

---

Perfect for:
- Corporate app portals
- Team quick links
- Shared tool launchers
- Centrally managed shortcuts

🚀 Users get a beautiful launcher, you keep full control!
