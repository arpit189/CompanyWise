# Installation Guide

## Quick Start

### Step 1: Download the Extension

1. Download the extension files from this repository
2. Extract the ZIP file to a folder on your computer

### Step 2: Load in Chrome

1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the folder containing the extension files
6. The extension should now appear in your extensions list

### Step 3: Test the Extension

1. Go to any LeetCode problem page (e.g., https://leetcode.com/problems/two-sum/)
2. Look for a floating circular icon on the left side of the page
3. Click the icon to see company information for that problem

## Troubleshooting

### Icon doesn't appear?
- Make sure you're on a LeetCode problem page (URL contains `/problems/`)
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page

### No company data?
- Check your internet connection
- Click the "Refresh Data" button in the panel
- The extension caches data for 24 hours

### Extension not loading?
- Verify all files are present in the extension folder
- Check the browser console for errors
- Make sure you're using Chrome or a Chromium-based browser

## Files Required

Make sure these files are in your extension folder:
- `manifest.json`
- `content.js`
- `background.js`
- `panel.css`
- `icon-48.png` (or `icon.svg`)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify you're on a supported LeetCode page
3. Try disabling and re-enabling the extension
4. Check the README.md for more detailed information
