const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const urlsRouter = require('./routes/urls');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|ico|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://app-launcher-u0x7.onrender.com',
    /\.vercel\.app$/, // Allow all Vercel deployments
    /localhost:\d+$/  // Allow all localhost ports
  ],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// File upload endpoint
app.post('/upload-icon', upload.single('icon'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const iconUrl = `${BASE_URL}/uploads/${req.file.filename}`;
  res.json({ iconUrl });
});

// API routes
app.use('/urls', urlsRouter);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.1.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
  console.log(`📊 Admin panel: ${BASE_URL}/admin`);
  console.log(`🏥 Health check: ${BASE_URL}/health`);
});
