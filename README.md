# Smart Tabs Chrome Extension

Smart Tabs is a Chrome extension that transforms your new tab page into a powerful dashboard for managing and navigating your open browser tabs. It automatically groups your tabs by domain, making it easy to find, switch, and close tabs, especially when you have many open at once.

## Features

- **Grouped Tabs by Domain:** Automatically organizes all your open tabs into visually distinct groups based on their website domain.
- **Search Tabs:** Quickly filter and find tabs by title, URL, or domain using the search bar at the top.
- **Pin Tab Groups:** Pin your most important domain groups to keep them at the top for easy access.
- **One-Click Tab Switching:** Click any tab in the dashboard to instantly switch to it.
- **Close Tabs Easily:** Close any tab directly from the dashboard with a single click.
- **Visual Speed Dial:** Enjoy a clean, masonry-style layout with favicons and color-coded groups for quick visual navigation.
- **Responsive Design:** Works well on various screen sizes.

## How It Works

- When you open a new tab, Smart Tabs replaces the default new tab page with a dashboard showing all your open tabs, grouped by domain.
- Use the search bar to filter tabs by keyword, domain, or URL.
- Pin important domain groups to keep them at the top.
- Click a tab to switch to it, or click the ✕ button to close it.

## Installation

1. Download or clone this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable "Developer mode" (toggle in the top right).
4. Click "Load unpacked" and select the folder containing this extension's files.
5. The extension will now be active and will override your new tab page.

## Permissions

- **tabs:** To read and manage your open tabs for grouping, searching, and switching.
- **<all_urls>:** To access tab URLs for grouping and display.

## Files

- `manifest.json` — Extension manifest and permissions.
- `newtab.html` — Custom new tab page UI.
- `newtab.js` — Main logic for grouping, searching, and managing tabs.
- `newtab.css` — Styles for the dashboard layout and groups.
- `icon16.png`, `icon48.png`, `icon128.png` — Extension icons.

## Privacy

Smart Tabs does not collect or transmit any personal data. All tab information is processed locally in your browser.

## License

MIT License. See [LICENSE](LICENSE) for details.