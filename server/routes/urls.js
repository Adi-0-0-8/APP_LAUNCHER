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
    return JSON.parse(data);
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
    
    protocol.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        // Stop collecting after we have enough data
        if (data.length > 100000) {
          res.destroy();
        }
      });
      
      res.on('end', () => {
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
        
        resolve({ title, favicon });
      });
    }).on('error', (error) => {
      const domain = extractDomain(url);
      resolve({ 
        title: domain || 'Untitled',
        favicon: `https://logo.clearbit.com/${domain}`
      });
    }).on('timeout', () => {
      const domain = extractDomain(url);
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
    const { url, customIcon } = req.body;
    
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
        
        // Still fetch title from the page
        const metadata = await fetchPageMetadata(url);
        title = metadata.title;
      } catch {
        return res.status(400).json({ error: 'Invalid custom icon URL' });
      }
    } else {
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
      publishedAt: new Date().toISOString()
    };
    
    urls.push(newEntry);
    await writeURLs(urls);
    
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add URL' });
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
