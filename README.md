# 🚀 App Launcher

Modern app launcher with Electron client and cloud server.

## 📁 Structure

```
├── server/          → Express backend (deploy to Render)
├── admin/           → Admin panel (deploy to Vercel)
└── electron-app/    → Desktop launcher (distribute to users)
```

## 🚀 Quick Start

### 1. Server (Render)
```bash
cd server
npm install
npm start
```

Deploy to Render:
- Root: `server`
- Build: `npm install`
- Start: `node index.js`

### 2. Admin Panel (Vercel)
Update API URL in `admin/index.html` line ~2:
```javascript
const API_URL = 'https://your-app.onrender.com';
```

Deploy to Vercel:
- Root: `admin`
- Framework: Other
- Build: (empty)

### 3. Electron App (Users)
Update `.env`:
```env
SERVER_URL=https://your-app.onrender.com
```

Distribute:
1. Zip `electron-app` folder
2. Users extract and run `START.bat`

## 🌐 URLs

- Server: `https://your-app.onrender.com`
- Admin: `https://your-admin.vercel.app`
- API: `https://your-app.onrender.com/urls`

---

Built with Electron + Express + Render + Vercel
