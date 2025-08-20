# Changelog

All notable changes to the LeetCode Company Finder Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial development version

## [1.0.0] - 2024-01-XX

### Added
- **Floating Icon**: Circular icon that appears on the left side of LeetCode problem pages
- **Company Panel**: Expandable panel showing companies that have asked the current problem
- **Frequency Data**: Display of company frequency with time-based breakdowns (6 months, 1 year, 2 years, all time)
- **Data Caching**: Local storage with 24-hour cache expiry for improved performance
- **Fallback Support**: Automatic fallback from GitHub raw files to Netlify site
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works on different screen sizes and orientations
- **Dark Mode Support**: Automatically adapts to LeetCode's dark mode theme
- **Error Handling**: Graceful handling of network errors and missing data
- **Problem Identification**: Multiple strategies for extracting problem information from URLs and page content

### Technical Features
- **Manifest V3**: Modern Chrome extension architecture
- **Content Script**: Main functionality injected into LeetCode pages
- **Background Service Worker**: Handles extension lifecycle and caching
- **Chrome Storage API**: Local data persistence
- **Promise-based Data Fetching**: Robust network requests with error handling
- **Event-driven Architecture**: Clean separation of concerns

### Data Sources
- **Primary**: GitHub raw files from Leetcode-Company-Wise-Questions-Website repository
- **Fallback**: Netlify site for when GitHub is unavailable
- **Local Cache**: 24-hour cache to reduce network requests

### UI/UX Features
- **Smooth Animations**: CSS transitions for panel open/close
- **Hover Effects**: Visual feedback on interactive elements
- **Focus Management**: Proper keyboard navigation and focus handling
- **Loading States**: Clear indication when data is being fetched
- **Error States**: User-friendly error messages with retry options

### Security & Privacy
- **Minimal Permissions**: Only requests necessary host permissions
- **No Telemetry**: No user data collection or external tracking
- **Local Processing**: All data processing happens locally in the browser
- **Secure Fetching**: Uses HTTPS for all external requests

### Browser Support
- **Chrome**: Primary target browser (Manifest V3)
- **Edge**: Compatible with Chromium-based browsers
- **Other Chromium browsers**: Should work with Manifest V3 support

## Future Versions

### Planned Features
- **Settings Panel**: User-configurable options for cache duration and data sources
- **Company Logos**: Visual company logos in the company list
- **Advanced Filtering**: Filter companies by frequency, time period, or company name
- **Export Functionality**: Export company data for personal use
- **Statistics Dashboard**: Overview of problems by company frequency
- **Bookmark Integration**: Save favorite problems or companies
- **Notification System**: Alerts for new company data updates

### Technical Improvements
- **Service Worker Caching**: More sophisticated caching strategies
- **Background Sync**: Automatic data updates in the background
- **Performance Optimization**: Lazy loading and virtual scrolling for large datasets
- **Offline Support**: Full functionality when network is unavailable
- **Analytics Dashboard**: Extension usage statistics (opt-in)

### UI Enhancements
- **Custom Themes**: User-selectable color schemes
- **Animation Options**: Configurable animation speeds and styles
- **Layout Customization**: Adjustable panel position and size
- **Accessibility Improvements**: Enhanced screen reader support
- **Internationalization**: Multi-language support

---

## Version Numbering

- **Major**: Breaking changes or major feature additions
- **Minor**: New features or significant improvements
- **Patch**: Bug fixes and minor improvements

## Release Process

1. **Development**: Features developed in feature branches
2. **Testing**: Manual and automated testing on multiple LeetCode pages
3. **Review**: Code review and security assessment
4. **Release**: Tagged release with updated changelog
5. **Distribution**: Chrome Web Store submission (future)
