const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { randomUUID } = require('crypto');

const URLS_FILE = path.join(__dirname, '../urls.json');

// Helper to read URLs from file
async function readURLs() {
  try {
    const data = await fs.readFile(URLS_FILE, 'utf8');
    const urls = JSON.parse(data);
    
    // Migration: Add missing fields to old entries
    let needsSave = false;
    urls.forEach(url => {
      if (!url.hasOwnProperty('customName')) {
        url.customName = null;
        needsSave = true;
      }
      if (!url.hasOwnProperty('pinned')) {
        url.pinned = false;
        needsSave = true;
      }
    });
    
    // Save migrated data
    if (needsSave) {
      console.log('🔄 Migrating old entries with new fields...');
      await writeURLs(urls);
    }
    
    return urls;
  } catch (error) {
    return [];
  }
}

// Helper to write URLs to file
async function writeURLs(urls) {
  await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

// Helper to fetch page title and favicon
function fetchPageMetadata(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const timeout = setTimeout(() => {
      const domain = extractDomain(url);
      console.log(`⏱️ Timeout fetching ${url}, using domain as fallback`);
      resolve({ 
        title: domain || 'Untitled',
        favicon: `https://logo.clearbit.com/${domain}`
      });
    }, 10000); // 10 second timeout
    
    const request = protocol.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        // Stop collecting after we have enough data
        if (data.length > 100000) {
          res.destroy();
        }
      });
      
      res.on('end', () => {
        clearTimeout(timeout);
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
        
        // Try to find high-quality favicon
        let favicon = null;
        
        // Look for apple-touch-icon (usually high quality)
        const appleIconMatch = data.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i) ||
                               data.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i);
        
        if (appleIconMatch) {
          favicon = resolveUrl(url, appleIconMatch[1]);
        }
        
        // Look for icon with sizes specified (usually higher quality)
        if (!favicon) {
          const sizedIconMatch = data.match(/<link[^>]*rel=["']icon["'][^>]*sizes=["'](\d+)x\d+["'][^>]*href=["']([^"']+)["']/i) ||
                                  data.match(/<link[^>]*href=["']([^"']+)["'][^>]*sizes=["'](\d+)x\d+["'][^>]*rel=["']icon["']/i);
          if (sizedIconMatch) {
            const iconUrl = sizedIconMatch[2] || sizedIconMatch[1];
            favicon = resolveUrl(url, iconUrl);
          }
        }
        
        // Look for any favicon link
        if (!favicon) {
          const iconMatch = data.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
                            data.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
          if (iconMatch) {
            favicon = resolveUrl(url, iconMatch[1]);
          }
        }
        
        // Fallback to multiple sources
        if (!favicon) {
          const domain = extractDomain(url);
          // Try Clearbit Logo API (high quality company logos)
          favicon = `https://logo.clearbit.com/${domain}`;
        }
        
        console.log(`✅ Fetched metadata for ${url}: ${title}`);
        resolve({ title, favicon });
      });
    }).on('error', (error) => {
      clearTimeout(timeout);
      const domain = extractDomain(url);
      console.log(`❌ Error fetching ${url}:`, error.message);
      resolve({ 
        title: domain || 'Untitled',
        favicon: `https://logo.clearbit.com/${domain}`
      });
    }).on('timeout', () => {
      clearTimeout(timeout);
      request.destroy();
      const domain = extractDomain(url);
      console.log(`⏱️ Request timeout for ${url}`);
      resolve({ 
        title: domain || 'Untitled',
        favicon: `https://logo.clearbit.com/${domain}`
      });
    });
  });
}

// Helper to resolve relative URLs
function resolveUrl(baseUrl, relativeUrl) {
  try {
    // If already absolute URL
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    const base = new URL(baseUrl);
    
    // If starts with //, add protocol
    if (relativeUrl.startsWith('//')) {
      return base.protocol + relativeUrl;
    }
    
    // If starts with /, it's absolute path
    if (relativeUrl.startsWith('/')) {
      return `${base.protocol}//${base.host}${relativeUrl}`;
    }
    
    // Otherwise, relative to current path
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    return relativeUrl;
  }
}

// Helper to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

// GET /urls - Get all URLs
router.get('/', async (req, res) => {
  try {
    const urls = await readURLs();
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read URLs' });
  }
});

// POST /urls - Add new URL
router.post('/', async (req, res) => {
  try {
    const { url, customIcon, customName } = req.body;
    
    console.log(`📨 POST /urls received: ${url}`);
    if (customName) console.log(`🏷️ Custom name: ${customName}`);
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const urls = await readURLs();
    
    let title, favicon;
    
    // If custom icon provided, use it directly
    if (customIcon && typeof customIcon === 'string') {
      try {
        new URL(customIcon); // Validate custom icon URL
        favicon = customIcon;
        
        console.log(`🎨 Using custom icon: ${customIcon}`);
        
        // Still fetch title from the page
        const metadata = await fetchPageMetadata(url);
        title = metadata.title;
      } catch {
        return res.status(400).json({ error: 'Invalid custom icon URL' });
      }
    } else {
      console.log(`🔍 Fetching metadata for: ${url}`);
      // Fetch page title and favicon automatically
      const metadata = await fetchPageMetadata(url);
      title = metadata.title;
      favicon = metadata.favicon;
    }
    
    // Create new entry
    const newEntry = {
      id: randomUUID(),
      url,
      favicon,
      title,
      customName: customName || null,
      pinned: false,
      publishedAt: new Date().toISOString()
    };
    
    urls.push(newEntry);
    await writeURLs(urls);
    
    console.log(`✅ Published: ${customName || title} (${url})`);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error(`❌ Error publishing URL:`, error);
    res.status(500).json({ error: 'Failed to add URL' });
  }
});

// POST /urls/:id/pin - Toggle pin status
router.post('/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;
    const urls = await readURLs();
    
    const urlEntry = urls.find(item => item.id === id);
    
    if (!urlEntry) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    // Check if trying to pin when already at limit
    const pinnedCount = urls.filter(u => u.pinned).length;
    if (!urlEntry.pinned && pinnedCount >= 5) {
      return res.status(400).json({ error: 'Maximum 5 apps can be pinned' });
    }
    
    // Toggle pin status
    urlEntry.pinned = !urlEntry.pinned;
    
    await writeURLs(urls);
    
    console.log(`${urlEntry.pinned ? '📌 Pinned' : '📍 Unpinned'}: ${urlEntry.customName || urlEntry.title}`);
    res.json({ success: true, pinned: urlEntry.pinned });
  } catch (error) {
    console.error(`❌ Error toggling pin:`, error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// DELETE /urls/:id - Remove URL
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const urls = await readURLs();
    
    const index = urls.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    urls.splice(index, 1);
    await writeURLs(urls);
    
    res.json({ success: true, message: 'URL deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

module.exports = router;
