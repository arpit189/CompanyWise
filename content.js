// LeetCode Company Finder Content Script
class LeetCodeCompanyFinder {
    constructor() {
        this.isPanelOpen = false;
        this.currentProblemData = null;
        this.companiesData = null;
        this.problemData = null;
        this.floatingIcon = null;
        this.panel = null;
        this.lastCacheTime = null;
        this.cacheExpiryHours = 24;
        
        this.init();
    }

    async init() {
        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        // Check if we're on a problem page
        if (!this.isProblemPage()) {
            return;
        }

        // Load cached data first
        await this.loadCachedData();
        
        // Create and inject UI elements
        this.createFloatingIcon();
        this.createPanel();
        
        // Load fresh data in background
        this.loadFreshData();
        
        // Add event listeners
        this.addEventListeners();
    }

    isProblemPage() {
        const url = window.location.href;
        return url.includes('/problems/') || url.includes('/problem/');
    }

    extractProblemSlug() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Primary: extract from URL path /problems/<slug>/
        const problemMatch = path.match(/\/problems\/([^\/]+)/);
        if (problemMatch) {
            return problemMatch[1];
        }
        
        // Secondary: try to extract from page title or other elements
        const titleElement = document.querySelector('h1, [data-cy="question-title"]');
        if (titleElement) {
            const title = titleElement.textContent.trim();
            return this.slugify(title);
        }
        
        // Tertiary: extract from page title
        const pageTitle = document.title;
        if (pageTitle) {
            return this.slugify(pageTitle);
        }
        
        return null;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async loadCachedData() {
        try {
            const cached = await chrome.storage.local.get(['companiesData', 'problemData', 'lastCacheTime']);
            if (cached.companiesData && cached.problemData && cached.lastCacheTime) {
                const cacheAge = Date.now() - cached.lastCacheTime;
                const cacheExpiryMs = this.cacheExpiryHours * 60 * 60 * 1000;
                
                if (cacheAge < cacheExpiryMs) {
                    this.companiesData = cached.companiesData;
                    this.problemData = cached.problemData;
                    this.lastCacheTime = cached.lastCacheTime;
                    console.log('Loaded cached data');
                }
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }

    async loadFreshData() {
        try {
            // Try to fetch from GitHub raw first
            const [companiesResponse, problemResponse] = await Promise.allSettled([
                fetch('https://raw.githubusercontent.com/farneet24/Leetcode-Company-Wise-Questions-Website/master/preprocessed_companies.json'),
                fetch('https://raw.githubusercontent.com/farneet24/Leetcode-Company-Wise-Questions-Website/master/problem_data.json')
            ]);

            let companiesData = null;
            let problemData = null;

            if (companiesResponse.status === 'fulfilled' && companiesResponse.value.ok) {
                companiesData = await companiesResponse.value.json();
            }

            if (problemResponse.status === 'fulfilled' && problemResponse.value.ok) {
                problemData = await problemResponse.value.json();
            }

            // If GitHub fetch failed, try Netlify site
            if (!companiesData || !problemData) {
                const [netlifyCompaniesResponse, netlifyProblemResponse] = await Promise.allSettled([
                    fetch('https://company-wise-leetcode-farneet.netlify.app/preprocessed_companies.json'),
                    fetch('https://company-wise-leetcode-farneet.netlify.app/problem_data.json')
                ]);

                if (netlifyCompaniesResponse.status === 'fulfilled' && netlifyCompaniesResponse.value.ok) {
                    companiesData = await netlifyCompaniesResponse.value.json();
                }

                if (netlifyProblemResponse.status === 'fulfilled' && netlifyProblemResponse.value.ok) {
                    problemData = await netlifyProblemResponse.value.json();
                }
            }

            if (companiesData && problemData) {
                this.companiesData = companiesData;
                this.problemData = problemData;
                this.lastCacheTime = Date.now();
                
                // Cache the data
                await chrome.storage.local.set({
                    companiesData: this.companiesData,
                    problemData: this.problemData,
                    lastCacheTime: this.lastCacheTime
                });
                
                console.log('Loaded fresh data');
                
                // Update panel if it's open
                if (this.isPanelOpen) {
                    this.updatePanel();
                }
            }
        } catch (error) {
            console.error('Error loading fresh data:', error);
        }
    }

    createFloatingIcon() {
        this.floatingIcon = document.createElement('div');
        this.floatingIcon.id = 'leetcode-company-finder-icon';
        this.floatingIcon.className = 'lecf-btn';
        this.floatingIcon.innerHTML = `
            <img src="${chrome.runtime.getURL('icon-48.png')}" alt="Company Finder" width="24" height="24">
        `;
        this.floatingIcon.title = 'Companies that asked this problem';
        this.floatingIcon.setAttribute('role', 'button');
        this.floatingIcon.setAttribute('tabindex', '0');
        this.floatingIcon.setAttribute('aria-label', 'Show companies for this problem');
        
        document.body.appendChild(this.floatingIcon);
        
        // Load saved position
        this.loadIconPosition();
        
        // Add drag functionality
        this.addDragHandlers();
    }

    async loadIconPosition() {
        try {
            const result = await chrome.storage.local.get(['lecfPos']);
            if (result && result.lecfPos) {
                const {right, top} = result.lecfPos;
                this.floatingIcon.style.right = right + 'px';
                this.floatingIcon.style.top = top + 'px';
                this.floatingIcon.style.transform = 'translateY(0)';
            }
        } catch (error) {
            console.error('Error loading icon position:', error);
        }
    }

    addDragHandlers() {
        let isDragging = false;
        let startX = 0, startY = 0, startRight = 0, startTop = 0;

        const handleMouseDown = (e) => {
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const computedStyle = getComputedStyle(this.floatingIcon);
            startRight = parseFloat(computedStyle.right) || 12;
            startTop = parseFloat(computedStyle.top) || window.innerHeight / 2;
            
            const handleMouseMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                
                if (!isDragging && Math.hypot(dx, dy) > 4) {
                    isDragging = true;
                }
                
                if (isDragging) {
                    const newRight = Math.max(8, startRight - dx);
                    const newTop = Math.max(8, Math.min(window.innerHeight - 44, startTop + dy));
                    
                    this.floatingIcon.style.right = `${newRight}px`;
                    this.floatingIcon.style.top = `${newTop}px`;
                    this.floatingIcon.style.transform = 'translateY(0)';
                }
            };
            
            const handleMouseUp = (ev) => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                if (isDragging) {
                    // Persist position
                    const finalRight = parseFloat(this.floatingIcon.style.right);
                    const finalTop = parseFloat(this.floatingIcon.style.top);
                    chrome.storage.local.set({
                        lecfPos: { right: finalRight, top: finalTop }
                    });
                } else {
                    // Treat as click (toggle panel)
                    this.togglePanel();
                }
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        // Touch handlers for mobile
        const handleTouchStart = (e) => {
            isDragging = false;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const computedStyle = getComputedStyle(this.floatingIcon);
            startRight = parseFloat(computedStyle.right) || 12;
            startTop = parseFloat(computedStyle.top) || window.innerHeight / 2;
            
            const handleTouchMove = (ev) => {
                ev.preventDefault();
                const touch = ev.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                
                if (!isDragging && Math.hypot(dx, dy) > 4) {
                    isDragging = true;
                }
                
                if (isDragging) {
                    const newRight = Math.max(8, startRight - dx);
                    const newTop = Math.max(8, Math.min(window.innerHeight - 44, startTop + dy));
                    
                    this.floatingIcon.style.right = `${newRight}px`;
                    this.floatingIcon.style.top = `${newTop}px`;
                    this.floatingIcon.style.transform = 'translateY(0)';
                }
            };
            
            const handleTouchEnd = (ev) => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                
                if (isDragging) {
                    // Persist position
                    const finalRight = parseFloat(this.floatingIcon.style.right);
                    const finalTop = parseFloat(this.floatingIcon.style.top);
                    chrome.storage.local.set({
                        lecfPos: { right: finalRight, top: finalTop }
                    });
                } else {
                    // Treat as click (toggle panel)
                    this.togglePanel();
                }
            };
            
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        };

        this.floatingIcon.addEventListener('mousedown', handleMouseDown);
        this.floatingIcon.addEventListener('touchstart', handleTouchStart);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'leetcode-company-finder-panel';
        this.panel.className = 'lecf-panel';
        this.panel.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title">Loading...</h3>
                <button class="panel-close" aria-label="Close panel">×</button>
            </div>
            <div class="panel-content">
                <div class="loading">Loading company data...</div>
            </div>
            <div class="panel-footer">
                <button class="refresh-btn">Refresh Data</button>
                <button class="open-site-btn">Open on Company-wise Site</button>
                <button class="reset-position-btn">Reset Position</button>
            </div>
        `;
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Company information panel');
        
        document.body.appendChild(this.panel);
    }

    addEventListeners() {
        // Panel close button
        const closeBtn = this.panel.querySelector('.panel-close');
        closeBtn.addEventListener('click', () => this.closePanel());

        // Refresh button
        const refreshBtn = this.panel.querySelector('.refresh-btn');
        refreshBtn.addEventListener('click', () => this.refreshData());

        // Open site button
        const openSiteBtn = this.panel.querySelector('.open-site-btn');
        openSiteBtn.addEventListener('click', () => this.openCompanySite());

        // Reset position button
        const resetPositionBtn = this.panel.querySelector('.reset-position-btn');
        resetPositionBtn.addEventListener('click', () => this.resetIconPosition());

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && 
                !this.panel.contains(e.target) && 
                !this.floatingIcon.contains(e.target)) {
                this.closePanel();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        this.isPanelOpen = true;
        this.panel.classList.add('open');
        this.floatingIcon.classList.add('active');
        this.updatePanel();
        
        // Focus management
        this.panel.focus();
    }

    closePanel() {
        this.isPanelOpen = false;
        this.panel.classList.remove('open');
        this.floatingIcon.classList.remove('active');
        
        // Return focus to icon
        this.floatingIcon.focus();
    }

    async updatePanel() {
        const problemSlug = this.extractProblemSlug();
        if (!problemSlug) {
            this.showError('Could not identify problem');
            return;
        }

        const titleElement = this.panel.querySelector('.panel-title');
        const contentElement = this.panel.querySelector('.panel-content');

        // Update title
        titleElement.textContent = `Problem: ${problemSlug}`;

        if (!this.companiesData || !this.problemData) {
            contentElement.innerHTML = `
                <div class="error">
                    <p>No data available. Please check your connection and try refreshing.</p>
                </div>
            `;
            return;
        }

        // Find problem data
        let problemInfo = null;
        let companies = null;

        // Try to find by slug first
        for (const [id, data] of Object.entries(this.companiesData)) {
            if (data.title && this.slugify(data.title) === problemSlug) {
                problemInfo = data;
                companies = data.companies;
                break;
            }
        }

        // If not found by slug, try to find by problem ID in problem_data.json
        if (!problemInfo) {
            for (const [id, data] of Object.entries(this.problemData)) {
                if (data.name && this.slugify(data.name) === problemSlug) {
                    // Look up companies by ID
                    if (this.companiesData[id]) {
                        problemInfo = this.companiesData[id];
                        companies = this.companiesData[id].companies;
                    }
                    break;
                }
            }
        }

        if (!problemInfo || !companies) {
            this.showNotFound(problemSlug);
            return;
        }

        // Update title with actual problem name
        titleElement.textContent = problemInfo.title || problemSlug;

        // Sort companies by frequency (alltime)
        const sortedCompanies = Object.entries(companies).sort((a, b) => {
            const aFreq = parseFloat(a[1].alltime || 0);
            const bFreq = parseFloat(b[1].alltime || 0);
            return bFreq - aFreq;
        });

        // Generate companies HTML
        const companiesHTML = sortedCompanies.map(([companyName, frequencies]) => {
            const alltime = parseFloat(frequencies.alltime || 0);
            const oneYear = parseFloat(frequencies['1year'] || 0);
            const twoYear = parseFloat(frequencies['2year'] || 0);
            const sixMonths = parseFloat(frequencies['6months'] || 0);

            let frequencyText = '';
            if (alltime > 0) {
                frequencyText = `${alltime.toFixed(2)} times (all time)`;
                if (oneYear > 0) {
                    frequencyText += `, ${oneYear.toFixed(2)} in last year`;
                }
            } else {
                frequencyText = 'No recent data';
            }

            const logoUrl = this.getCompanyLogoUrl(companyName);
            const avatar = logoUrl ? 
                `<img src="${logoUrl}" alt="${this.formatCompanyName(companyName)}" class="company-logo" onerror="this.parentElement.innerHTML='${this.generateCompanyAvatar(companyName)}'">` :
                this.generateCompanyAvatar(companyName);

            return `
                <div class="company-row" data-company="${companyName}" tabindex="0" role="button" aria-label="View ${this.formatCompanyName(companyName)} company page">
                    ${avatar}
                    <div class="company-info">
                        <span class="company-name">${this.formatCompanyName(companyName)}</span>
                        <span class="company-frequency">${frequencyText}</span>
                    </div>
                </div>
            `;
        }).join('');

        contentElement.innerHTML = `
            <div class="companies-list">
                ${companiesHTML}
            </div>
        `;

        // Add click handlers for company items
        const companyItems = contentElement.querySelectorAll('.company-item');
        companyItems.forEach(item => {
            item.addEventListener('click', () => {
                const companyName = item.dataset.company;
                this.openCompanyPage(companyName);
            });
        });
    }

    formatCompanyName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    showError(message) {
        const contentElement = this.panel.querySelector('.panel-content');
        contentElement.innerHTML = `
            <div class="error">
                <p>${message}</p>
                <button class="retry-btn">Retry</button>
            </div>
        `;

        const retryBtn = contentElement.querySelector('.retry-btn');
        retryBtn.addEventListener('click', () => this.refreshData());
    }

    showNotFound(problemSlug) {
        const contentElement = this.panel.querySelector('.panel-content');
        contentElement.innerHTML = `
            <div class="not-found">
                <p>Problem not found in dataset.</p>
                <p>This problem may not have been asked by companies yet, or the data may need to be updated.</p>
            </div>
        `;
    }

    async refreshData() {
        const contentElement = this.panel.querySelector('.panel-content');
        contentElement.innerHTML = '<div class="loading">Refreshing data...</div>';
        
        await this.loadFreshData();
        this.updatePanel();
    }

    openCompanySite() {
        const problemSlug = this.extractProblemSlug();
        if (problemSlug) {
            const url = `https://company-wise-leetcode-farneet.netlify.app/?q=${encodeURIComponent(problemSlug)}`;
            window.open(url, '_blank');
        }
    }

    openCompanyPage(companyName) {
        const url = `https://company-wise-leetcode-farneet.netlify.app/company/${companyName}`;
        window.open(url, '_blank');
    }

    resetIconPosition() {
        // Reset to default position
        this.floatingIcon.style.right = '12px';
        this.floatingIcon.style.top = '50%';
        this.floatingIcon.style.transform = 'translateY(-50%)';
        
        // Clear saved position
        chrome.storage.local.remove(['lecfPos']);
    }

    generateCompanyAvatar(companyName) {
        // Generate initials from company name
        const words = companyName.split('-');
        const initials = words.map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
        
        // Generate a consistent color based on company name
        const colors = [
            '#1f9fff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
        ];
        const hash = companyName.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const color = colors[Math.abs(hash) % colors.length];
        
        return `
            <div class="company-avatar" style="background-color: ${color}; color: white;">
                ${initials}
            </div>
        `;
    }

    getCompanyLogoUrl(companyName) {
        // Try to get logo from company_data.json if available
        // For now, return null to use initials avatar
        return null;
    }
}

// Initialize the extension
new LeetCodeCompanyFinder();
