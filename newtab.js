// smart tab: newtab.js

function groupTabsByDomain(tabs) {
  const groups = {};
  for (const tab of tabs) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(tab);
    } catch (e) {
      // skip invalid URLs
    }
  }
  return groups;
}

function createFavicon(url, className) {
  const img = document.createElement('img');
  img.className = className;
  img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
  img.alt = '';
  return img;
}

function domainColor(domain) {
  // Простой хеш -> HSL
  let hash = 0;
  for (let i = 0; i < domain.length; ++i) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 56%, 92%)`;
}

// Utility to get/set pinned domains in localStorage
function getPinnedDomains() {
  try {
    return JSON.parse(localStorage.getItem('pinnedDomains') || '[]');
  } catch {
    return [];
  }
}
function setPinnedDomains(domains) {
  localStorage.setItem('pinnedDomains', JSON.stringify(domains));
}

function isDomainPinned(domain) {
  const pinned = getPinnedDomains();
  return pinned.includes(domain);
}
function pinDomain(domain) {
  const pinned = getPinnedDomains();
  if (!pinned.includes(domain)) {
    pinned.push(domain);
    setPinnedDomains(pinned);
  }
}
function unpinDomain(domain) {
  let pinned = getPinnedDomains();
  pinned = pinned.filter(d => d !== domain);
  setPinnedDomains(pinned);
}

function renderSpeedDial(groups) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'speeddial';
  app.appendChild(container);

  // 1. Создаем массив DOM-элементов групп
  const groupElems = [];
  // Sort: pinned groups first
  const pinnedDomains = getPinnedDomains();
  const sortedGroupEntries = Object.entries(groups)
    // Filter out 'newtab' and extension new tab domains
    .filter(([domain]) => {
      const lower = domain.toLowerCase();
      return lower !== 'newtab' && lower !== 'chrome://newtab' && lower !== 'chrome-extension://newtab';
    })
    .sort(([a], [b]) => {
      const aPinned = pinnedDomains.includes(a);
      const bPinned = pinnedDomains.includes(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  sortedGroupEntries.forEach(([domain, tabs]) => {
    const group = document.createElement('div');
    group.className = 'masonry-group';
    group.style.background = domainColor(domain);
    if (isDomainPinned(domain)) group.classList.add('pinned-group');

    // Header: favicon + domain + pin button
    const header = document.createElement('div');
    header.className = 'speeddial-group-header';
    header.appendChild(createFavicon('https://' + domain, 'speeddial-favicon'));
    const domainSpan = document.createElement('span');
    domainSpan.className = 'speeddial-domain';
    domainSpan.textContent = domain;
    header.appendChild(domainSpan);
    // Pin button for group
    const pinBtn = document.createElement('button');
    pinBtn.className = 'speeddial-group-pin';
    pinBtn.title = isDomainPinned(domain) ? 'Unpin group' : 'Pin group';
    pinBtn.textContent = isDomainPinned(domain) ? '📌' : '📍';
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Animate group before re-render
      group.classList.add('group-moving');
      setTimeout(() => {
        if (isDomainPinned(domain)) {
          unpinDomain(domain);
        } else {
          pinDomain(domain);
        }
        renderSpeedDial(groups); // re-render after animation
      }, 260); // match CSS transition
    });
    header.appendChild(pinBtn);

    // Close All Tabs button
    const closeAllBtn = document.createElement('button');
    closeAllBtn.className = 'speeddial-group-closeall';
    closeAllBtn.title = 'Close all tabs in this group';
    closeAllBtn.textContent = '✖';
    closeAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm(`Close ALL tabs for ${domain}? This cannot be undone.`)) return;
      // Animate all tabs in group
      const tabLis = ul.querySelectorAll('.speeddial-tab');
      tabLis.forEach(li => {
        li.classList.add('tab-removing');
        li.style.pointerEvents = 'none';
      });
              setTimeout(() => {
          // Remove all tabs in this group from allTabsCache
          allTabsCache = allTabsCache.filter(t => {
            try {
              const url = new URL(t.url);
              return url.hostname !== domain;
            } catch {
              return true;
            }
          });
          // Close all tabs in Chrome
          tabs.forEach(tab => {
            if (chrome.tabs) chrome.tabs.remove(tab.id);
          });
          // Re-render to remove the group
          filterAndRender(document.getElementById('search-input')?.value || '');
          // Update duplicate count after closing all tabs in group
          updateDuplicateCount();
        }, 320); // match CSS transition
    });
    header.appendChild(closeAllBtn);
    group.appendChild(header);

    // List of tabs
    const ul = document.createElement('ul');
    ul.className = 'speeddial-tabs';
    tabs.forEach(tab => {
      const li = document.createElement('li');
      li.className = 'speeddial-tab';
      li.title = tab.title;
      li.appendChild(createFavicon(tab.url, 'speeddial-tab-favicon'));
      const titleSpan = document.createElement('span');
      titleSpan.className = 'speeddial-tab-title';
      titleSpan.textContent = tab.title || tab.url;
      li.appendChild(titleSpan);
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'speeddial-tab-close';
      closeBtn.title = 'Close tab';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chrome.tabs) {
          chrome.tabs.remove(tab.id);
          // Smooth removal animation
          li.classList.add('tab-removing');
          li.style.pointerEvents = 'none';
          setTimeout(() => {
            li.remove();
            // Optionally, update allTabsCache and re-render if group is empty
            // Remove tab from allTabsCache
            allTabsCache = allTabsCache.filter(t => t.id !== tab.id);
            // If group is now empty, re-render to remove the group
            const groupTabs = tabs.filter(t => t.id !== tab.id);
            if (groupTabs.length === 0) {
              filterAndRender(document.getElementById('search-input')?.value || '');
            }
            // Update duplicate count after closing tab
            updateDuplicateCount();
          }, 320); // match CSS transition
        }
      });
      li.appendChild(closeBtn);
      // Tab activation handler
      li.addEventListener('click', () => {
        if (chrome.tabs && chrome.windows) {
          chrome.tabs.update(tab.id, {active: true}, () => {
            if (tab.windowId !== undefined) {
              chrome.windows.update(tab.windowId, {focused: true});
            }
            window.close(); // Close the new tab after activating
          });
        }
      });
      ul.appendChild(li);
    });
    group.appendChild(ul);
    container.appendChild(group);
    groupElems.push(group);
  });

  // 2. После рендера — masonry layout
  setTimeout(() => {
    const containerWidth = container.clientWidth;
    const minTileWidth = 220;
    const maxTileWidth = 320;
    const gap = 24;
    // Calculate optimal columns and tile width
    let columns = Math.floor((containerWidth + gap) / (minTileWidth + gap));
    if (columns < 1) columns = 1;
    // Calculate tile width so tiles fill all width
    let tileWidth = Math.floor((containerWidth - gap * (columns - 1)) / columns);
    if (tileWidth > maxTileWidth) {
      tileWidth = maxTileWidth;
      columns = Math.floor((containerWidth + gap) / (tileWidth + gap));
      if (columns < 1) columns = 1;
      tileWidth = Math.floor((containerWidth - gap * (columns - 1)) / columns);
    }
    const colHeights = Array(columns).fill(0);
    groupElems.forEach((group, i) => {
      group.style.position = 'absolute';
      group.style.width = tileWidth + 'px';
      // Найти колонку с минимальной высотой
      let minCol = 0;
      for (let c = 1; c < columns; ++c) {
        if (colHeights[c] < colHeights[minCol]) minCol = c;
      }
      const left = minCol * (tileWidth + gap);
      const top = colHeights[minCol];
      group.style.left = left + 'px';
      group.style.top = top + 'px';
      colHeights[minCol] += group.offsetHeight + gap;
    });
    // Высота контейнера
    container.style.height = Math.max(...colHeights) + 'px';
  }, 0);
}

let allTabsCache = [];

// Function to calculate duplicate count and update button text
function updateDuplicateCount() {
  console.log('updateDuplicateCount called');
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const removeDupesBtn = document.getElementById('remove-dupes-btn');
    if (!removeDupesBtn || !chrome.tabs) {
      console.log('updateDuplicateCount: Button or chrome.tabs not available');
      return;
    }
    
    // Get the current tab's id (the extension's new tab page)
    chrome.tabs.query({active: true, currentWindow: true}, (currentTabs) => {
      const currentTabId = currentTabs && currentTabs.length > 0 ? currentTabs[0].id : null;
      console.log('updateDuplicateCount: Current tab ID:', currentTabId);
      console.log('updateDuplicateCount: Total tabs in cache:', allTabsCache.length);
      
      // Find duplicates: keep one tab per unique URL, but never close the current extension tab
      const urlToTab = {};
      const duplicateTabIds = [];
      for (const tab of allTabsCache) {
        if (!tab.url) continue;
        
        // Skip extension new tab pages and chrome://newtab
        try {
          const url = new URL(tab.url);
          if (url.protocol === 'chrome-extension:' || 
              url.href === 'chrome://newtab/' ||
              url.href.includes('chrome-extension://newtab')) {
            continue;
          }
        } catch (e) {
          // Skip invalid URLs
          continue;
        }
        
        if (urlToTab[tab.url]) {
          // Only add to duplicates if not the current tab
          if (tab.id !== currentTabId) {
            duplicateTabIds.push(tab.id);
          }
        } else {
          urlToTab[tab.url] = tab.id;
        }
      }
      // Update button text with count
      const count = duplicateTabIds.length;
      console.log('updateDuplicateCount: Duplicate count:', count);
      removeDupesBtn.textContent = count > 0 ? `🗑️ Remove duplicates(${count})` : '🗑️ Remove duplicates';
      console.log('updateDuplicateCount: Button text updated to:', removeDupesBtn.textContent);
    });
  }, 100);
}

function filterAndRender(query) {
  query = (query || '').trim().toLowerCase();
  const filteredGroups = {};
  const groups = groupTabsByDomain(allTabsCache);
  Object.entries(groups).forEach(([domain, tabs]) => {
    // Фильтруем вкладки по title или url или домену
    const matchDomain = domain.toLowerCase().includes(query);
    // Filter out 'newtab' and extension new tab domains
    if (domain.toLowerCase() === 'newtab' || domain.toLowerCase() === 'chrome://newtab' || domain.toLowerCase() === 'chrome-extension://newtab') return;
    const filteredTabs = tabs.filter(tab =>
      (tab.title && tab.title.toLowerCase().includes(query)) ||
      (tab.url && tab.url.toLowerCase().includes(query)) ||
      matchDomain
    );
    if (filteredTabs.length > 0) {
      filteredGroups[domain] = filteredTabs;
    }
  });
  renderSpeedDial(filteredGroups);
}

function logAndRenderGroupedTabs() {
  if (!chrome.tabs) {
    document.getElementById('app').textContent = 'chrome.tabs API is not available. Please run as an extension!';
    return;
  }
  chrome.tabs.query({}, (tabs) => {
    allTabsCache = tabs;
    filterAndRender(document.getElementById('search-input')?.value || '');
    // Update duplicate count after loading tabs
    updateDuplicateCount();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search-input');
  if (search) {
    search.addEventListener('input', e => {
      filterAndRender(search.value);
      // Update duplicate count after search filter
      updateDuplicateCount();
    });
  }

  // Dark mode logic
  const themeBtn = document.getElementById('theme-switcher');
  const body = document.body;
  function setTheme(mode) {
    if (mode === 'dark') {
      body.classList.add('dark');
      themeBtn.textContent = '☀️ Light';
    } else {
      body.classList.remove('dark');
      themeBtn.textContent = '🌙 Dark';
    }
    localStorage.setItem('theme', mode);
  }
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }
  if (themeBtn) {
    let current = getPreferredTheme();
    setTheme(current);
    themeBtn.addEventListener('click', () => {
      current = (body.classList.contains('dark')) ? 'light' : 'dark';
      setTheme(current);
    });
  }

  // Remove duplicates button logic
  const removeDupesBtn = document.getElementById('remove-dupes-btn');
  if (removeDupesBtn) {
    removeDupesBtn.addEventListener('click', async () => {
      if (!chrome.tabs) return;
      // Get the current tab's id (the extension's new tab page)
      chrome.tabs.query({active: true, currentWindow: true}, (currentTabs) => {
        const currentTabId = currentTabs && currentTabs.length > 0 ? currentTabs[0].id : null;
        // Find duplicates: keep one tab per unique URL, but never close the current extension tab
        const urlToTab = {};
        const duplicateTabIds = [];
        for (const tab of allTabsCache) {
          if (!tab.url) continue;
          
          // Skip extension new tab pages and chrome://newtab
          try {
            const url = new URL(tab.url);
            if (url.protocol === 'chrome-extension:' || 
                url.href === 'chrome://newtab/' ||
                url.href.includes('chrome-extension://newtab')) {
              continue;
            }
          } catch (e) {
            // Skip invalid URLs
            continue;
          }
          
          if (urlToTab[tab.url]) {
            // Only add to duplicates if not the current tab
            if (tab.id !== currentTabId) {
              duplicateTabIds.push(tab.id);
            }
          } else {
            urlToTab[tab.url] = tab.id;
          }
        }
        if (duplicateTabIds.length === 0) {
          alert('No duplicate tabs found.');
          return;
        }
        if (!confirm(`Remove ${duplicateTabIds.length} duplicate tab(s)? This cannot be undone.`)) return;
        // Close duplicates
        chrome.tabs.remove(duplicateTabIds, () => {
          // Remove from cache and refresh UI
          allTabsCache = allTabsCache.filter(tab => !duplicateTabIds.includes(tab.id));
          filterAndRender(document.getElementById('search-input')?.value || '');
          // Update duplicate count after removal
          updateDuplicateCount();
        });
      });
    });
  }

  // Footer links functionality
  const rateExtensionLink = document.getElementById('rate-extension');
  const donateLink = document.getElementById('donate-link');

  if (rateExtensionLink) {
    rateExtensionLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Open Chrome Web Store rating page for the extension
      if (chrome.runtime && chrome.runtime.id) {
        const storeUrl = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
        chrome.tabs.create({ url: storeUrl });
      } else {
        // Fallback for development
        alert('Please rate the extension on the Chrome Web Store!');
      }
    });
  }

  if (donateLink) {
    donateLink.addEventListener('click', (e) => {
      e.preventDefault();
      // You can customize this URL to your preferred donation platform
      const donateUrl = 'https://www.buymeacoffee.com/yourusername'; // Replace with actual donation URL
      chrome.tabs.create({ url: donateUrl });
    });
  }
});

logAndRenderGroupedTabs(); 