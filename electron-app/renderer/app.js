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
  
  list.innerHTML = urls.map(item => {
    const domain = new URL(item.url).hostname;
    const fallbackIcon = `https://logo.clearbit.com/${domain}`;
    
    return `
    <div class="app-item" onclick="openURL('${item.url.replace(/'/g, "\\'")}');" data-title="${escapeHtml(item.title)}">
      <img 
        class="app-icon" 
        src="${item.favicon}" 
        alt="${item.title}"
        loading="eager"
        onerror="this.onerror=null; this.src='${fallbackIcon}'; this.onerror=function(){ this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23888%22%3E%3Cpath d=%22M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z%22/%3E%3C/svg%3E'; }"
      >
    </div>
  `;
  }).join('');
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
