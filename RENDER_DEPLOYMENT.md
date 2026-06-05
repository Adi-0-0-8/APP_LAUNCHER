# 🚀 Deploy to Render.com

## Prerequisites
- GitHub account
- Render.com account (free tier available)

---

## Step 1: Prepare Your Repository

### 1.1 Create .gitignore
Create `server/.gitignore`:
```
node_modules/
uploads/
.env
urls.json
```

### 1.2 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Deploy to Render

### 2.1 Create New Web Service
1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Service
- **Name**: `launcher-app-server` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Instance Type**: Free

### 2.3 Environment Variables (Optional)
No environment variables needed! The app auto-detects Render's URL.

### 2.4 Deploy
Click "Create Web Service" and wait 2-5 minutes.

---

## Step 3: Get Your Server URL

After deployment completes:
1. Your server URL will be: `https://launcher-app-server.onrender.com`
2. Admin panel: `https://launcher-app-server.onrender.com/admin`
3. API: `https://launcher-app-server.onrender.com/urls`

**Copy this URL!** You'll need it for the Electron app.

---

## Step 4: Update Electron App

### 4.1 Create `.env` file
In `electron-app/` folder, create `.env`:
```env
SERVER_URL=https://your-app.onrender.com
```
Replace with your actual Render URL.

### 4.2 Build the EXE
```bash
cd electron-app
npm install
npm run build
```

The EXE will now connect to your Render server!

---

## Step 5: Test Everything

1. **Test Admin Panel**:
   - Visit: `https://your-app.onrender.com/admin`
   - Add a test URL
   
2. **Test Electron App**:
   - Install the EXE on any computer
   - Floating launcher should appear
   - Click it → should show your test URL

3. **Verify Connection**:
   - Health check: `https://your-app.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

## Important Notes

### Free Tier Limitations
- ⚠️ **Auto-sleep after 15 min of inactivity**
- First request after sleep takes ~30 seconds
- 750 hours/month free (enough for testing)

### Solutions for Auto-Sleep:
1. **Upgrade to paid tier** ($7/month - no sleep)
2. **Use UptimeRobot** to ping every 5 minutes (keeps it awake)
3. **Accept the delay** (first launch after idle will be slow)

### Data Persistence
- ✅ `urls.json` persists across deploys
- ✅ Uploaded images persist
- ⚠️ Free tier has limited storage

---

## Distributing to Users

### With Render Deployment:

**Give users**:
- ✅ `App Launcher Setup 1.0.0.exe`

**Users get**:
- ✅ Floating launcher
- ✅ Connects to your Render server
- ✅ Works from anywhere (internet access required)
- ✅ No local server needed!

**You manage**:
- ✅ Apps from: `https://your-app.onrender.com/admin`
- ✅ Accessible from anywhere
- ✅ Updates appear to all users instantly

---

## Monitoring Your Deployment

### Render Dashboard
- View logs: Real-time server logs
- Metrics: CPU, memory, requests
- Deploy history: All deployments

### Health Checks
- Manual: Visit `/health` endpoint
- Automatic: Render monitors automatically

---

## Updating Your Server

### Method 1: Git Push (Automatic)
```bash
# Make changes to server code
git add .
git commit -m "Update server"
git push

# Render auto-deploys in ~2 minutes
```

### Method 2: Manual Deploy
- Go to Render dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## Troubleshooting

### "Application failed to respond"
- Check logs in Render dashboard
- Verify start command: `node index.js`
- Check root directory: `server`

### "Cannot connect to server" (Electron)
- Verify `.env` has correct URL
- Check URL format: `https://` (not `http://`)
- Test in browser first

### Uploads not working
- Render free tier has ephemeral storage
- Uploaded files persist but have limits
- Consider upgrading or using external storage (S3)

### Slow first request
- Normal on free tier (auto-sleep)
- Use UptimeRobot or upgrade to prevent

---

## Cost Breakdown

### Free Tier
- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min
- ✅ 100 GB bandwidth
- ✅ Perfect for testing/small teams

### Paid Tier ($7/month)
- ✅ No auto-sleep
- ✅ Always fast
- ✅ More resources
- ✅ Better for production

---

## Alternative: Railway.app

Similar to Render, also has free tier:
1. Connect GitHub repo
2. Set root path: `server`
3. Deploy
4. Get URL: `https://your-app.up.railway.app`

---

## Summary

**Local Development**:
```
http://localhost:3000 → Your computer
```

**Render Deployment**:
```
https://your-app.onrender.com → Cloud server
Users can access from anywhere!
```

**Distribution Workflow**:
1. Deploy server to Render → Get URL
2. Create `.env` with Render URL
3. Build EXE with `npm run build`
4. Distribute EXE to users
5. Manage apps from Render admin panel

🎉 **Your app is now globally accessible!**

---

Need help? Check Render's documentation: https://render.com/docs
