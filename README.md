# 🚀 Launcher App - Electron + Express

A complete fullstack application with an Electron desktop launcher, Express backend server, and web-based admin panel.

## 📁 Project Structure

```
project/
├── server/
│   ├── index.js          → Express server entry point
│   ├── urls.json         → Persistent storage (JSON file)
│   ├── package.json
│   └── routes/
│       └── urls.js       → All URL routes (GET, POST, DELETE)
│
├── admin/
│   └── index.html        → Single file admin panel (vanilla HTML/CSS/JS)
│
└── electron-app/
    ├── package.json
    ├── main.js           → Electron main process
    ├── preload.js        → Preload script (contextBridge)
    └── renderer/
        ├── index.html    → Electron UI
        ├── style.css     → Styling
        └── app.js        → Renderer logic (polling, displaying icons)
```

## 🏗️ Architecture

```
Admin Panel (Web UI)
        │
        │  POST /urls (publish)
        │  DELETE /urls/:id (unpublish)
        ▼
Express Server (Node.js)
  - Stores URLs in urls.json
  - Fetches favicons server-side
        ▲
        │  GET /urls (polls every 5 seconds)
        │
Electron App
  - Displays URL icons/favicons
  - Opens URLs in default browser
```

**Important:** The Electron app NEVER communicates directly with websites. All communication goes through the Express server.

## ✅ Features

### Server (Express - Port 3000)
- ✅ Stores URLs in `urls.json` file (persists on restart)
- ✅ Auto-fetches page title by parsing `<title>` tag
- ✅ Auto-generates favicon URL via Google's favicon service
- ✅ Unique ID generation using `crypto.randomUUID()`
- ✅ CORS enabled for all origins
- ✅ REST API endpoints:
  - `GET /urls` - Get all URLs
  - `POST /urls` - Publish new URL
  - `DELETE /urls/:id` - Unpublish URL
- ✅ Serves admin panel at `/admin`

### Admin Panel (Web UI)
- ✅ Pure HTML, CSS, JavaScript (no frameworks)
- ✅ Modern dark UI
- ✅ Publish new URLs with auto title/favicon fetch
- ✅ View all published URLs
- ✅ Unpublish URLs
- ✅ Auto-refresh every 5 seconds
- ✅ Loading states and error handling
- ✅ Empty state when no URLs published

### Electron App
- ✅ Secure architecture with contextBridge
- ✅ Polls server every 5 seconds
- ✅ Displays URL cards with favicons
- ✅ Opens URLs in default browser via `shell.openExternal`
- ✅ Modern, animated UI
- ✅ Loading and empty states
- ✅ Error handling for server connectivity

## 🚀 How to Run

### 1. Start the Express Server

```bash
cd server
npm install
npm start
```

Server will run on **http://localhost:3000**

### 2. Open Admin Panel

Open your browser and go to:
**http://localhost:3000/admin**

### 3. Start the Electron App

```bash
cd electron-app
npm install
npm start
```

## 🎯 Usage

1. **Publish URLs** in the admin panel:
   - Enter a full URL (e.g., `https://youtube.com`)
   - Click "Publish"
   - The server will automatically fetch the page title and favicon

2. **View in Electron App**:
   - The Electron app will automatically display all published URLs
   - Click any URL card to open it in your default browser

3. **Unpublish URLs**:
   - In the admin panel, click "Unpublish" on any URL
   - The URL will be removed from both the admin panel and Electron app

## 🔒 Security Features

- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ `webSecurity: true`
- ✅ All external communication from Electron goes through IPC → main process → Express server
- ✅ Renderer has zero direct network access
- ✅ Safe API exposed via `contextBridge`

## 📊 Data Structure

Each URL entry in `urls.json`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://youtube.com",
  "favicon": "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
  "title": "YouTube",
  "publishedAt": "2026-06-05T13:21:00.000Z"
}
```

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Desktop:** Electron
- **Storage:** JSON file (urls.json)
- **Icons:** Google Favicon Service

## 📝 API Endpoints

### GET /urls
Returns all published URLs as JSON array.

### POST /urls
Publish a new URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://example.com",
  "favicon": "https://www.google.com/s2/favicons?domain=example.com&sz=64",
  "title": "Example Domain",
  "publishedAt": "2026-06-05T13:21:00.000Z"
}
```

### DELETE /urls/:id
Unpublish a URL by ID.

**Response:**
```json
{
  "success": true,
  "message": "URL deleted"
}
```

## 🎨 Screenshots

The app features a modern dark theme with:
- Gradient backgrounds
- Smooth animations
- Hover effects
- Loading states
- Empty states
- Error handling

## 🔧 Development

To run Electron with DevTools open:

```bash
cd electron-app
npm start -- --dev
```

Or set environment variable:
```bash
NODE_ENV=development npm start
```

## 📦 Dependencies

### Server
- express: ^4.18.2
- cors: ^2.8.5

### Electron App
- electron: ^28.0.0

## 📄 License

MIT

---

Made with ❤️ using Electron + Express
