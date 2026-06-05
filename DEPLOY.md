# 🚀 Deployment Guide

## 1️⃣ Deploy Server to Render

1. Go to https://render.com/
2. New Web Service → Connect your GitHub repo
3. Configure:
   - **Name**: `app-launcher-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Deploy!
5. Copy your URL: `https://your-app.onrender.com`

## 2️⃣ Deploy Admin to Vercel

1. Update `admin/index.html` line 557:
   ```javascript
   const API_URL = 'https://your-app.onrender.com'; // Your Render URL
   ```

2. Go to https://vercel.com/
3. Import GitHub repo
4. Configure:
   - **Framework**: Other
   - **Root Directory**: `admin`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
5. Deploy!
6. Your admin: `https://your-admin.vercel.app`

## 3️⃣ Distribute Electron App

1. Update `electron-app/.env`:
   ```env
   SERVER_URL=https://your-app.onrender.com
   ```

2. Zip the `electron-app` folder

3. Share with users → They run `START.bat`

## ✅ Final URLs

- 🖥️ **Server**: `https://your-app.onrender.com`
- 📊 **Admin Panel**: `https://your-admin.vercel.app`
- 🚀 **Electron App**: Distributed ZIP file

---

**Done!** Manage apps from anywhere via the admin panel!
