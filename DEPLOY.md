# 🚀 Deployment Guide

## 1️⃣ Deploy Server to Render

1. Go to https://render.com/
2. New Web Service → Connect GitHub repo: `Adi-0-0-8/APP_LAUNCHER`
3. Configure:
   - **Name**: `app-launcher-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Deploy!
5. Copy your URL: `https://app-launcher-u0x7.onrender.com` ✅

---

## 2️⃣ Deploy Admin Panel to Vercel

1. Go to https://vercel.com/
2. Import GitHub repo: `Adi-0-0-8/APP_LAUNCHER`
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `admin`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
   - **Install Command**: (leave empty)
4. Deploy!

Your admin panel: `https://your-admin.vercel.app` 🎉

**That's it!** No build process needed - it's just one HTML file!

---

## 3️⃣ Distribute Electron App to Users

### Option A: GitHub Releases (Recommended)
1. Create a release on GitHub
2. Attach `electron-app.zip` 
3. Users download and run `START.bat`

### Option B: Direct Share
1. Zip the `electron-app` folder
2. Share via Google Drive/OneDrive/Dropbox
3. Users extract and run `START.bat`

---

## ✅ Final Setup

After deployment, you'll have:

- 🖥️ **Server API**: `https://app-launcher-u0x7.onrender.com`
- 📊 **Admin Panel**: `https://your-admin.vercel.app`
- 🚀 **Electron App**: Distributed to users

### What Each URL Does:

| URL | Purpose | Who Uses It |
|-----|---------|-------------|
| `https://app-launcher-u0x7.onrender.com` | Backend API | Electron app & Admin panel |
| `https://your-admin.vercel.app` | Manage apps | You (admin) |
| Desktop app | Floating launcher | End users |

---

## 🔄 Making Changes

### Update Apps:
- Go to your admin panel
- Add/remove URLs
- Changes appear in all Electron apps within 5 seconds!

### Update Admin Panel:
1. Edit `admin/index.html`
2. Git push
3. Vercel auto-deploys!

### Update Electron App:
1. Edit files in `electron-app/`
2. Zip the folder
3. Re-distribute to users

---

## 🎉 You're Done!

Your app is now deployed globally:
- ✅ Server running 24/7 on Render
- ✅ Admin panel hosted on Vercel
- ✅ Electron app ready to distribute

Manage everything from your admin panel! 🚀

