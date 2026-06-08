let isFirstLoad = true;
let lastURLs = [];
let isExpanded = false;
let expandTimeout = null;
let collapseTimeout = null;
let isAnimating = false;

// Expand sidebar
function expandSidebar() {
  if (isExpanded || isAnimating) return;
  console.log('Expanding sidebar...');
  isAnimating = true;
  isExpanded = true;
  
  clearTimeout(collapseTimeout);
  
  document.getElementById('sidebar').classList.remove('collapsed');
  window.electronAPI.expandWindow();
  
  setTimeout(() => {
    isAnimating = false;
  }, 400);
}

// Collapse sidebar
function collapseSidebar() {
  if (!isExpanded || isAnimating) return;
  console.log('Collapsing sidebar...');
  isAnimating = true;
  isExpanded = false;
  
  clearTimeout(expandTimeout);
  
  document.getElementById('sidebar').classList.add('collapsed');
  window.electronAPI.collapseWindow();
  
  setTimeout(() => {
    isAnimating = false;
  }, 400);
}

// Show loading state
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('appList').style.display = 'none';
}

// Show empty state
function showEmptyState() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('appList').style.display = 'none';
}

// Show error state
function showErrorState() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('errorState').style.display = 'flex';
  document.getElementById('appList').style.display = 'none';
}

// Show app list
function showAppList() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('appList').style.display = 'flex';
}

// Open URL in default browser and auto-collapse
async function openURL(url) {
  try {
    await window.electronAPI.openURL(url);
    // Auto-collapse after opening app
    setTimeout(() => {
      collapseSidebar();
    }, 300);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render URLs
function renderURLs(urls) {
  const list = document.getElementById('appList');
  
  if (urls.length === 0) {
    showEmptyState();
    return;
  }
  
  showAppList();
  
  // Only re-render if URLs changed
  const urlsString = JSON.stringify(urls);
  if (urlsString === lastURLs) {
    return;
  }
  lastURLs = urlsString;
  
  // Sort: pinned first, then by date
  urls.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });
  
  list.innerHTML = urls.map(item => {
    const domain = new URL(item.url).hostname.replace('www.', '');
    const fallbackIcon = `https://logo.clearbit.com/${domain}`;
    const displayTitle = item.customName || item.title;
    
    return `
    <div class="app-item ${item.pinned ? 'pinned' : ''}" 
         data-id="${item.id}"
         data-title="${escapeHtml(displayTitle)}">
      <img 
        class="app-icon" 
        src="${item.favicon}" 
        alt="${displayTitle}"
        loading="eager"
        onerror="this.onerror=null; this.src='${fallbackIcon}'; this.onerror=function(){ this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23888%22%3E%3Cpath d=%22M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z%22/%3E%3C/svg%3E'; }"
      >
      ${item.pinned ? '<span class="pin-indicator">📌</span>' : ''}
    </div>
  `;
  }).join('');
  
  // Add click handlers after rendering
  document.querySelectorAll('.app-item').forEach(appItem => {
    const url = urls.find(u => u.id === appItem.dataset.id)?.url;
    
    // Left click - open URL
    appItem.addEventListener('click', (e) => {
      if (url) openURL(url);
    });
    
    // Right click - show context menu to pin/unpin
    appItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(appItem.dataset.id, e.clientX, e.clientY);
    });
  });
}

// Fetch URLs from server
async function fetchURLs() {
  try {
    const urls = await window.electronAPI.fetchURLs();
    console.log('📥 Fetched URLs from server:', urls);
    console.log('📊 Number of apps:', urls.length);
    if (urls.length > 0) {
      console.log('🔍 First app:', urls[0]);
      console.log('   - Title:', urls[0].title);
      console.log('   - Custom Name:', urls[0].customName);
      console.log('   - Pinned:', urls[0].pinned);
    }
    renderURLs(urls);
    
    if (isFirstLoad) {
      isFirstLoad = false;
    }
  } catch (error) {
    console.error('Failed to fetch URLs:', error);
    
    if (isFirstLoad) {
      showErrorState();
      isFirstLoad = false;
    }
  }
}

// Show context menu for pin/unpin
function showContextMenu(appId, x, y) {
  // Remove existing menu if any
  const existingMenu = document.getElementById('contextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Get app data
  window.electronAPI.fetchURLs().then(urls => {
    const app = urls.find(u => u.id === appId);
    if (!app) return;
    
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    const pinnedCount = urls.filter(u => u.pinned).length;
    const canPin = !app.pinned && pinnedCount < 5;
    
    menu.innerHTML = `
      ${app.pinned 
        ? '<div class="menu-item" data-action="unpin">📍 Unpin</div>' 
        : canPin 
          ? '<div class="menu-item" data-action="pin">📌 Pin</div>'
          : '<div class="menu-item disabled">📌 Pin (Max 5 reached)</div>'
      }
    `;
    
    document.body.appendChild(menu);
    
    // Handle menu clicks
    menu.querySelectorAll('.menu-item:not(.disabled)').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'pin' || action === 'unpin') {
          togglePin(appId);
        }
        menu.remove();
      });
    });
    
    // Close menu on click outside
    setTimeout(() => {
      document.addEventListener('click', function closeMenu() {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      });
    }, 100);
  });
}

// Toggle pin status
async function togglePin(appId) {
  try {
    await window.electronAPI.togglePin(appId);
    fetchURLs(); // Refresh list
  } catch (error) {
    console.error('Failed to toggle pin:', error);
  }
}

// Track mouse position
let mouseX = 0;
let mouseY = 0;
let mouseInsideWindow = false;

document.addEventListener('mouseenter', () => {
  mouseInsideWindow = true;
  console.log('🖱️ Mouse entered window');
});

document.addEventListener('mouseleave', () => {
  mouseInsideWindow = false;
  console.log('🖱️ Mouse left window');
  
  // Collapse when mouse leaves the window
  if (isExpanded) {
    clearTimeout(expandTimeout);
    collapseTimeout = setTimeout(() => {
      collapseSidebar();
    }, 300);
  }
});

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Expand when mouse is near left edge (within 10px)
  if (mouseX <= 10 && !isExpanded) {
    clearTimeout(collapseTimeout);
    expandTimeout = setTimeout(() => {
      expandSidebar();
    }, 150);
  }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeBtn');
  
  // Start collapsed
  document.getElementById('sidebar').classList.add('collapsed');
  window.electronAPI.collapseWindow();
  
  // Close button - quit app
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.electronAPI.quitApp();
  });
  
  // Initial fetch and set up polling
  fetchURLs();
  setInterval(fetchURLs, 5000);
});
