# 🚀 Quick Start Guide

## Prerequisites

- Node.js installed (v14 or higher)
- npm (comes with Node.js)

## ⚡ Fast Setup (Windows)

### Option 1: Use Batch Files (Easiest)

1. **Start Server:**
   - Double-click `START_SERVER.bat`
   - A new window will open showing the server running

2. **Open Admin Panel:**
   - Open browser: http://localhost:3000/admin

3. **Start Electron App:**
   - Double-click `START_ELECTRON.bat`

### Option 2: Manual Commands

1. **Start the Server:**
```bash
cd server
npm start
```

2. **Open Admin Panel:**
   - Browser: http://localhost:3000/admin

3. **Start Electron App (in a new terminal):**
```bash
cd electron-app
npm start
```

## 📝 First Time Setup

If this is your first time running the project:

1. **Install Server Dependencies:**
```bash
cd server
npm install
```

2. **Install Electron Dependencies:**
```bash
cd electron-app
npm install
```

Then follow the "Fast Setup" steps above.

## 🎯 How to Use

### Publish a URL

1. Go to admin panel: http://localhost:3000/admin
2. Enter a full URL (e.g., `https://youtube.com`)
3. Click "Publish"
4. The server will automatically:
   - Fetch the page title
   - Get the favicon
   - Store it in `urls.json`

### View in Electron

- The Electron app automatically polls the server every 5 seconds
- Click any URL card to open it in your default browser

### Unpublish a URL

- In the admin panel, click "Unpublish" next to any URL

## 🧪 Testing the Setup

### Test the Server API

```bash
# Test GET endpoint
curl http://localhost:3000/urls

# Test POST endpoint (add a URL)
curl -X POST http://localhost:3000/urls -H "Content-Type: application/json" -d "{\"url\":\"https://github.com\"}"
```

### Expected Behavior

1. **Server Console:** Shows logs for requests
2. **Admin Panel:** Updates automatically every 5 seconds
3. **Electron App:** Updates automatically every 5 seconds
4. **urls.json:** Gets updated with new entries

## 🔍 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Try: `netstat -ano | findstr :3000`
- Kill the process or change the port in `server/index.js`

### Electron app shows "Unable to connect to server"
- Make sure the server is running on port 3000
- Check server console for errors

### Favicon not showing
- Favicon is fetched from Google's service
- Fallback icon will show if unavailable

### Empty state persists
- Check if server is running
- Check browser console for CORS errors
- Verify `urls.json` has valid JSON

## 📊 Port Information

- **Express Server:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **API Endpoints:**
  - GET /urls
  - POST /urls
  - DELETE /urls/:id

## 🛠️ Development Mode

To run Electron with DevTools:

```bash
cd electron-app
npm start -- --dev
```

Or:
```bash
set NODE_ENV=development
npm start
```

## 📁 Important Files

- `server/urls.json` - Persistent storage (auto-created)
- `server/index.js` - Express server
- `server/routes/urls.js` - API routes
- `electron-app/main.js` - Electron main process
- `electron-app/renderer/app.js` - Frontend logic
- `admin/index.html` - Admin panel

## 🎨 Demo URLs to Try

```
https://youtube.com
https://github.com
https://stackoverflow.com
https://reddit.com
https://twitter.com
https://medium.com
https://dev.to
https://netflix.com
```

## ⚠️ Notes

- URLs must include protocol (https:// or http://)
- Server fetches page titles automatically
- Electron app never contacts websites directly
- All communication goes through Express server
- Data persists in `urls.json` file

---

Need help? Check the main README.md for detailed architecture information.
