# LeetCode Company Finder Chrome Extension

A Chrome extension that shows company-frequency data for any LeetCode problem. When you visit a LeetCode problem page, a floating icon appears on the left side. Clicking it opens a panel showing which companies have asked this problem and how frequently.

## Features

- **Draggable Floating Icon**: Appears on the right side of LeetCode problem pages, can be moved anywhere
- **Company Data**: Shows companies that have asked the problem with frequency data
- **Company Icons**: Displays company logos or generated initials avatars
- **Time-based Data**: Displays frequency for different time periods (6 months, 1 year, 2 years, all time)
- **Position Persistence**: Icon position is saved and restored across sessions
- **Caching**: Data is cached locally for 24 hours to improve performance
- **Fallback Support**: If GitHub data is unavailable, falls back to the live Netlify site
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works on different screen sizes
- **Dark Mode Support**: Adapts to LeetCode's dark mode
- **Bright UI**: Clean, modern interface with high contrast and subtle shadows

## Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### Method 2: Install from Chrome Web Store (Future)

Once published, you'll be able to install directly from the Chrome Web Store.

## Usage

1. **Navigate to a LeetCode problem** (e.g., https://leetcode.com/problems/two-sum/)
2. **Look for the floating icon** on the right side of the page
3. **Click the icon** to open the company information panel
4. **Drag the icon** to move it anywhere on the screen (position is saved automatically)
5. **Browse companies** that have asked this problem
6. **Click on a company** to open their page on the company-wise site
7. **Use the buttons** to refresh data, open the main site, or reset icon position

### Change the floating icon

Replace the file `icon-48.png` with your new image. Recommended size: 48×48 PNG (for manifest icon) and 24×24 or 36×36 for the in-page image.

Steps:
1. Replace `icon-48.png` in the extension folder with your image (keep the same filename).
2. If you changed the filename, update `content.js` where the icon image is inserted (the `img.src`) and update `manifest.json` `icons` entry accordingly.
3. Reload the unpacked extension (`chrome://extensions` → Reload).
4. If the in-page icon is cached, reload the LeetCode tab to see the new icon.

### Keyboard Navigation

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons and open panels
- **Escape**: Close the panel
- **Arrow keys**: Navigate through company list

## Data Sources

The extension fetches data from two primary sources:

1. **GitHub Raw**: `https://raw.githubusercontent.com/farneet24/Leetcode-Company-Wise-Questions-Website/master/`
   - `preprocessed_companies.json` - Company frequency data
   - `problem_data.json` - Problem metadata

2. **Netlify Site** (fallback): `https://company-wise-leetcode-farneet.netlify.app/`
   - Used when GitHub raw files are unavailable

## Architecture

### Files Structure

```
leetcode-company-finder/
├── manifest.json          # Extension manifest (Manifest V3)
├── content.js            # Main content script
├── background.js         # Service worker
├── panel.css             # Styles for UI components
├── icon-48.png           # Extension icon
├── icon.svg              # SVG version of icon
└── README.md             # This file
```

### Key Components

1. **Content Script** (`content.js`):
   - Detects LeetCode problem pages
   - Extracts problem slug/ID from URL
   - Creates floating icon and panel
   - Handles data fetching and caching
   - Manages UI interactions

2. **Background Service Worker** (`background.js`):
   - Handles extension lifecycle
   - Manages data caching
   - Processes messages from content script

3. **CSS** (`panel.css`):
   - Styles for floating icon and panel
   - Responsive design
   - Dark mode support
   - Accessibility features

### Data Flow

1. **Page Load**: Content script initializes on LeetCode problem pages
2. **Cache Check**: Loads cached data from `chrome.storage.local`
3. **Data Fetch**: Attempts to fetch fresh data from GitHub raw files
4. **Fallback**: If GitHub fails, tries Netlify site
5. **Cache Update**: Stores fresh data with timestamp
6. **UI Update**: Updates panel with company information

## Problem Identification

The extension uses multiple strategies to identify the current problem:

1. **URL Parsing**: Extracts slug from `/problems/<slug>/` path
2. **DOM Elements**: Looks for problem title in page elements
3. **Page Title**: Falls back to parsing document title
4. **Slugification**: Converts titles to URL-friendly slugs

## Caching Strategy

- **Cache Duration**: 24 hours
- **Storage**: `chrome.storage.local`
- **Cache Keys**:
  - `companiesData`: Company frequency data
  - `problemData`: Problem metadata
  - `lastCacheTime`: Timestamp of last cache update

## Permissions

The extension requires the following permissions:

- **Storage**: For caching data locally
- **Host Permissions**:
  - `https://leetcode.com/*` - LeetCode problem pages
  - `https://raw.githubusercontent.com/*` - GitHub raw files
  - `https://company-wise-leetcode-farneet.netlify.app/*` - Fallback data source

## Testing

### Manual Testing Checklist

1. **Installation**:
   - [ ] Extension loads without errors
   - [ ] Icon appears in Chrome extensions list

2. **Basic Functionality**:
   - [ ] Visit https://leetcode.com/problems/two-sum/
   - [ ] Floating icon appears on right side
   - [ ] Click icon opens panel
   - [ ] Panel shows company data for Two Sum
   - [ ] Company rows show avatars/icons

3. **Navigation**:
   - [ ] Click outside panel closes it
   - [ ] Click icon again toggles panel
   - [ ] Escape key closes panel
   - [ ] Tab navigation works
   - [ ] Drag icon to move it (position persists)
   - [ ] Reset position button works

4. **Data Handling**:
   - [ ] Company data loads correctly
   - [ ] Click company opens company page
   - [ ] Refresh button works
   - [ ] "Open on Company-wise Site" button works

5. **Error Handling**:
   - [ ] Visit non-problem page (icon doesn't appear)
   - [ ] Test with network disabled (shows cached data)
   - [ ] Test with invalid problem (shows "not found")

### Test URLs

- **Two Sum**: https://leetcode.com/problems/two-sum/
- **Add Two Numbers**: https://leetcode.com/problems/add-two-numbers/
- **Longest Substring Without Repeating Characters**: https://leetcode.com/problems/longest-substring-without-repeating-characters/

## Development

### Building

1. Clone the repository
2. Make changes to source files
3. Load as unpacked extension in Chrome
4. Test on LeetCode problem pages

### Updating Data

The extension automatically fetches fresh data every 24 hours. To manually refresh:

1. Open the panel on any LeetCode problem
2. Click the "Refresh Data" button
3. Wait for data to load

### Adding Features

Common extension points:

- **New data sources**: Modify `loadFreshData()` in `content.js`
- **UI changes**: Update `panel.css` and panel creation in `content.js`
- **New permissions**: Update `manifest.json`

## Troubleshooting

### Common Issues

1. **Icon doesn't appear**:
   - Check if you're on a LeetCode problem page
   - Verify extension is enabled
   - Check browser console for errors

2. **No company data**:
   - Check internet connection
   - Try refreshing data manually
   - Verify problem exists in dataset

3. **Panel doesn't open**:
   - Check for JavaScript errors in console
   - Try refreshing the page
   - Verify extension permissions

### Debug Mode

To enable debug logging:

1. Open Chrome DevTools
2. Go to Console tab
3. Look for "LeetCode Company Finder" messages

## Privacy & Security

- **No user data collection**: Extension only reads current page URL
- **Local caching**: All data stored locally in browser
- **Minimal permissions**: Only requests necessary host permissions
- **No telemetry**: No data sent to external services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. See LICENSE file for details.

## Acknowledgments

- Data source: [Leetcode-Company-Wise-Questions-Website](https://github.com/farneet24/Leetcode-Company-Wise-Questions-Website)
- Live site: [company-wise-leetcode-farneet.netlify.app](https://company-wise-leetcode-farneet.netlify.app/)

## Changelog

### Version 1.0
- Initial release
- Floating icon on LeetCode problem pages
- Company frequency data display
- Local caching with 24-hour expiry
- Fallback data sources
- Full accessibility support
- Responsive design
- Dark mode support
