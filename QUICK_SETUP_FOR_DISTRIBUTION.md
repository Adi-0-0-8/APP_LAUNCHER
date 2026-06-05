# 🚀 Quick Setup Guide - Distributing to Users

## What You're Building
- **You**: Keep server + admin panel (manage apps centrally)
- **Users**: Get only the floating launcher EXE (no admin access)

---

## Step 1: Configure Server URL

Edit `electron-app/main.js` line ~30:

```javascript
// Change this line:
serverUrl: 'http://localhost:3000',

// To your server IP/domain:
serverUrl: 'http://192.168.1.100:3000',  // Local network
// OR
serverUrl: 'http://yourcompany.com:3000',  // Public server
```

---

## Step 2: Build the EXE

```bash
cd electron-app
npm install
npm run build
```

Wait 2-5 minutes. Output:
- `electron-app\dist\App Launcher Setup 1.0.0.exe` ✅

---

## Step 3: Distribute to Users

### Give users ONLY:
✅ `App Launcher Setup 1.0.0.exe` (~150MB)

### Don't give users:
❌ Server folder
❌ Admin panel
❌ Source code

---

## Step 4: Start Your Server

On YOUR machine (or dedicated server):

```bash
cd server
npm install
node index.js
```

Keep this running 24/7.

Manage apps at: `http://YOUR_IP:3000/admin`

---

## User Installation (They do this)

1. Run `App Launcher Setup 1.0.0.exe`
2. Follow installer
3. Launch from desktop shortcut
4. See floating 🚀 rocket
5. Click to see apps you published!

**That's it!** No configuration for users.

---

## Managing Apps

### You control everything from admin panel:

**Add App**: 
1. Go to `http://YOUR_SERVER:3000/admin`
2. Enter URL + optional custom icon
3. Click Publish
4. **All users see it in 5 seconds**

**Remove App**:
1. Click "Unpublish"
2. **All users lose access in 5 seconds**

No need to update the EXE!

---

## Testing Before Distribution

1. **Start server**: `node index.js` in server folder
2. **Get your IP**: Run `ipconfig` (Windows) and find IPv4
3. **Update main.js** with your IP
4. **Build EXE**
5. **Test on another computer**:
   - Install the EXE
   - Floating rocket should appear
   - Click it → should show your apps

If step 5 works, you're ready to distribute!

---

## Summary

**Your Setup** (Admin):
```
Your Computer/Server:
├── Server running (node index.js)
├── Admin panel (manage apps)
└── Build EXE once
```

**User Setup** (Clients):
```
User Computer:
└── Install EXE → Done!
    (Connects to YOUR server automatically)
```

**Workflow**:
```
You → Add app in admin panel
Users → See it automatically (no reinstall needed!)
```

---

## Important Notes

1. **Server must be always running** for users to see apps
2. **Users only see the launcher** (no admin panel access)
3. **You control all apps** from your admin panel
4. **Changes are instant** (users sync every 5 seconds)
5. **One-time build** (only rebuild if you want new features)

🎉 Perfect for:
- Corporate environments
- Team shared links
- Centrally managed app portals
- Client deployments

---

Need help? Read `DISTRIBUTION_GUIDE.md` for detailed information!
