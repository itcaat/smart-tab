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

function renderSpeedDial(groups) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'speeddial';
  app.appendChild(container);

  // 1. Создаем массив DOM-элементов групп
  const groupElems = [];
  Object.entries(groups).forEach(([domain, tabs]) => {
    const group = document.createElement('div');
    group.className = 'masonry-group';

    // Header: favicon + domain
    const header = document.createElement('div');
    header.className = 'speeddial-group-header';
    header.appendChild(createFavicon('https://' + domain, 'speeddial-favicon'));
    const domainSpan = document.createElement('span');
    domainSpan.className = 'speeddial-domain';
    domainSpan.textContent = domain;
    header.appendChild(domainSpan);
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
          li.style.opacity = '0.5';
          li.style.pointerEvents = 'none';
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
    const groupWidth = 260 + 24; // ширина + gap
    let columns = Math.floor(containerWidth / groupWidth);
    if (columns < 1) columns = 1;
    if (columns > 8) columns = 8;
    const colHeights = Array(columns).fill(0);
    const gap = 24;
    groupElems.forEach((group, i) => {
      group.style.position = 'absolute';
      group.style.width = '260px';
      // Найти колонку с минимальной высотой
      let minCol = 0;
      for (let c = 1; c < columns; ++c) {
        if (colHeights[c] < colHeights[minCol]) minCol = c;
      }
      const left = minCol * (260 + gap);
      const top = colHeights[minCol];
      group.style.left = left + 'px';
      group.style.top = top + 'px';
      colHeights[minCol] += group.offsetHeight + gap;
    });
    // Высота контейнера
    container.style.height = Math.max(...colHeights) + 'px';
  }, 0);
}

function logAndRenderGroupedTabs() {
  if (!chrome.tabs) {
    document.getElementById('app').textContent = 'chrome.tabs API is not available. Please run as an extension!';
    return;
  }
  chrome.tabs.query({}, (tabs) => {
    const groups = groupTabsByDomain(tabs);
    console.log('Grouped tabs:', groups);
    renderSpeedDial(groups);
  });
}

logAndRenderGroupedTabs(); 