let isFirstLoad = true;
let lastURLs = [];
let isExpanded = false;
let currentURLs = [];
let isDragging = false;
let dragTimeout = null;

// Toggle between collapsed and expanded views
function toggleView() {
  // Don't toggle if we just finished dragging
  if (isDragging) {
    return;
  }
  
  const collapsedView = document.getElementById('collapsedView');
  const expandedView = document.getElementById('expandedView');
  
  if (isExpanded) {
    // Collapse
    collapsedView.style.display = 'flex';
    expandedView.style.display = 'none';
    window.electronAPI.collapseWindow();
    isExpanded = false;
  } else {
    // Expand
    collapsedView.style.display = 'none';
    expandedView.style.display = 'block';
    window.electronAPI.expandWindow();
    isExpanded = true;
  }
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

// Update dot count badge
function updateDotCount(count) {
  const dotCount = document.getElementById('dotCount');
  if (count > 0) {
    dotCount.textContent = count;
    dotCount.style.display = 'flex';
  } else {
    dotCount.style.display = 'none';
  }
}

// Open URL in default browser and auto-collapse
async function openURL(url) {
  try {
    await window.electronAPI.openURL(url);
    // Auto-collapse after opening app
    setTimeout(() => {
      if (isExpanded) {
        toggleView();
      }
    }, 300);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

// Render URLs
function renderURLs(urls) {
  currentURLs = urls;
  const list = document.getElementById('appList');
  
  // Update dot count badge
  updateDotCount(urls.length);
  
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
    // Try multiple fallbacks for favicon
    const domain = new URL(item.url).hostname;
    const fallbackIcon = `https://logo.clearbit.com/${domain}`;
    
    return `
    <div class="app-item" onclick="openURL('${item.url.replace(/'/g, "\\'")}');" data-title="${escapeHtml(item.title)}">
      <img 
        class="app-icon" 
        src="${item.favicon}" 
        alt="${item.title}"
        loading="eager"
        decoding="sync"
        onerror="this.onerror=null; this.src='${fallbackIcon}'; this.onerror=function(){ this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23888%22%3E%3Cpath d=%22M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z%22/%3E%3C/svg%3E'; }"
      >
    </div>
  `;
  }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fetch URLs from server
async function fetchURLs() {
  try {
    const urls = await window.electronAPI.fetchURLs();
    renderURLs(urls);
    
    // Hide loading after first successful fetch
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
  // Click on the rocket icon to expand
  const clickArea = document.getElementById('clickArea');
  if (clickArea) {
    clickArea.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleView();
    });
    
    // Double-click to reset position if stuck
    clickArea.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      window.electronAPI.resetPosition();
    });
  }
  
  // Close button to collapse
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleView);
  }
  
  // Initial fetch and set up polling
  fetchURLs();
  setInterval(fetchURLs, 5000); // Poll every 5 seconds
});
