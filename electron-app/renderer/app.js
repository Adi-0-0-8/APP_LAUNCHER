let isFirstLoad = true;
let lastURLs = [];
let isExpanded = false;

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

// Open URL in default browser
async function openURL(url) {
  try {
    await window.electronAPI.openURL(url);
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
  
  list.innerHTML = urls.map(item => {
    const domain = new URL(item.url).hostname.replace('www.', '');
    const fallbackIcon = `https://logo.clearbit.com/${domain}`;
    const displayTitle = item.customName || item.title;
    
    // Truncate title to max 8 characters
    const shortTitle = displayTitle.length > 8 ? displayTitle.substring(0, 8) + '...' : displayTitle;
    
    return `
    <div class="app-item" 
         data-id="${item.id}"
         data-title="${escapeHtml(displayTitle)}">
      <div class="app-icon-wrapper">
        <img 
          class="app-icon" 
          src="${item.favicon}" 
          alt="${displayTitle}"
          loading="eager"
          onerror="this.onerror=null; this.src='${fallbackIcon}'; this.onerror=function(){ this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23888%22%3E%3Cpath d=%22M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z%22/%3E%3C/svg%3E'; }"
        >
      </div>
      <div class="app-label">${escapeHtml(shortTitle)}</div>
    </div>
  `;
  }).join('');
  
  // Add click handlers after rendering
  document.querySelectorAll('.app-item').forEach(appItem => {
    const url = urls.find(u => u.id === appItem.dataset.id)?.url;
    
    // Click - open URL
    appItem.addEventListener('click', (e) => {
      if (url) openURL(url);
    });
  });
}

// Fetch URLs from server
async function fetchURLs() {
  try {
    const urls = await window.electronAPI.fetchURLs();
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



// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeBtn');
  const sidebar = document.getElementById('sidebar');
  
  // Start collapsed (no .expanded class)
  sidebar.classList.remove('expanded');
  
  // Listen for expand/collapse events from main process
  window.electronAPI.onExpanded(() => {
    console.log('📢 Sidebar expanding');
    isExpanded = true;
    sidebar.classList.add('expanded');
  });
  
  window.electronAPI.onCollapsed(() => {
    console.log('📢 Sidebar collapsing');
    isExpanded = false;
    sidebar.classList.remove('expanded');
  });
  
  // Close button - quit app
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.electronAPI.quitApp();
  });
  
  // Initial fetch and set up polling
  fetchURLs();
  setInterval(fetchURLs, 5000);
});

// Auto-updater notification function
function showUpdateNotification(message, onClick) {
  console.log('🔔', message);
  // Simple console notification - app will auto-install on quit
}

// Setup auto-updater listeners
if (window.electronAPI.onUpdateAvailable) {
  window.electronAPI.onUpdateAvailable((info) => {
    console.log('🆕 Update available:', info.version);
    showUpdateNotification('New version available! Will download automatically.');
    window.electronAPI.downloadUpdate();
  });
  
  window.electronAPI.onDownloadProgress((percent) => {
    console.log('⬇️ Downloading update:', Math.round(percent) + '%');
  });
  
  window.electronAPI.onUpdateDownloaded((info) => {
    console.log('✅ Update downloaded:', info.version, '- Will install on app restart');
    showUpdateNotification('Update ready! Will install on next restart.');
  });
}
