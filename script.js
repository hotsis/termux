class BookApp {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 8;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateNavigation();
        this.loadCheckboxStates();
        this.addKeyboardNavigation();
        this.addSwipeSupport();
        this.preloadImages();
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        
        // Page dots
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const pageNumber = parseInt(e.target.dataset.page);
                this.goToPage(pageNumber);
            });
        });
        
        // Checkbox states
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.saveCheckboxStates());
        });
        
        // Page links with analytics
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackLinkClick(e.target.href, this.currentPage);
            });
        });
        
        // Auto-save checkbox states
        setInterval(() => this.saveCheckboxStates(), 5000);
    }
    
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'h':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                case 'l':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.totalPages);
                    break;
                case 'Escape':
                    this.showPageOverview();
                    break;
            }
            
            // Number keys for direct navigation
            if (e.key >= '1' && e.key <= '8') {
                e.preventDefault();
                this.goToPage(parseInt(e.key));
            }
        });
    }
    
    addSwipeSupport() {
        let startX = 0;
        let endX = 0;
        const minSwipeDistance = 50;
        
        const bookElement = document.querySelector('.book');
        
        bookElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        bookElement.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const swipeDistance = Math.abs(endX - startX);
            
            if (swipeDistance > minSwipeDistance && !this.isAnimating) {
                if (endX < startX) {
                    // Swipe left - next page
                    this.nextPage();
                } else {
                    // Swipe right - previous page
                    this.previousPage();
                }
            }
        }, { passive: true });
    }
    
    preloadImages() {
        const imageUrls = [
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages && !this.isAnimating) {
            this.goToPage(this.currentPage + 1, 'next');
        }
    }
    
    previousPage() {
        if (this.currentPage > 1 && !this.isAnimating) {
            this.goToPage(this.currentPage - 1, 'prev');
        }
    }
    
    goToPage(pageNumber, direction = null) {
        if (pageNumber === this.currentPage || this.isAnimating) return;
        if (pageNumber < 1 || pageNumber > this.totalPages) return;
        
        this.isAnimating = true;
        
        const currentPageElement = document.querySelector('.page.active');
        const nextPageElement = document.querySelector(`[data-page="${pageNumber}"]`);
        
        // Determine animation direction if not specified
        if (!direction) {
            direction = pageNumber > this.currentPage ? 'next' : 'prev';
        }
        
        // Add exit animation to current page
        if (direction === 'next') {
            currentPageElement.classList.add('slide-out-left');
            nextPageElement.classList.add('slide-in-right');
        } else {
            currentPageElement.classList.add('slide-out-right');
            nextPageElement.classList.add('slide-in-left');
        }
        
        // Remove active class from current page
        currentPageElement.classList.remove('active');
        
        // Add active class to next page
        nextPageElement.classList.add('active');
        
        // Update current page number
        this.currentPage = pageNumber;
        
        // Update UI
        this.updateNavigation();
        this.updatePageDots();
        this.updatePageIndicator();
        
        // Add page view tracking
        this.trackPageView(pageNumber);
        
        // Reset page elements after animation
        setTimeout(() => {
            this.resetPageAnimations();
            this.isAnimating = false;
            this.restartPageAnimations();
        }, 600);
    }
    
    resetPageAnimations() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove(
                'slide-in-left', 'slide-in-right', 
                'slide-out-left', 'slide-out-right'
            );
        });
    }
    
    restartPageAnimations() {
        const activePage = document.querySelector('.page.active');
        const elements = activePage.querySelectorAll('.title, .subtitle, .image-container, .links, .task-list');
        
        elements.forEach((element, index) => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = null;
        });
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;
        
        // Add visual feedback
        if (this.currentPage === 1) {
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.style.opacity = '1';
        }
        
        if (this.currentPage === this.totalPages) {
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.style.opacity = '1';
        }
    }
    
    updatePageDots() {
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('active');
        });
        
        const activeDot = document.querySelector(`[data-page="${this.currentPage}"].dot`);
        if (activeDot) {
            activeDot.classList.add('active');
        }
    }
    
    updatePageIndicator() {
        const currentPageSpan = document.querySelector('.current-page');
        currentPageSpan.textContent = this.currentPage;
        
        // Add a small animation to the page indicator
        currentPageSpan.style.transform = 'scale(1.2)';
        setTimeout(() => {
            currentPageSpan.style.transform = 'scale(1)';
        }, 200);
    }
    
    saveCheckboxStates() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const states = {};
        
        checkboxes.forEach(checkbox => {
            states[checkbox.id] = checkbox.checked;
        });
        
        localStorage.setItem('bookapp_checkbox_states', JSON.stringify(states));
    }
    
    loadCheckboxStates() {
        const savedStates = localStorage.getItem('bookapp_checkbox_states');
        
        if (savedStates) {
            const states = JSON.parse(savedStates);
            
            Object.keys(states).forEach(checkboxId => {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.checked = states[checkboxId];
                }
            });
        }
    }
    
    trackPageView(pageNumber) {
        // Simple analytics tracking
        const pageData = {
            page: pageNumber,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.log('Page view:', pageData);
        
        // Store in localStorage for demo purposes
        const views = JSON.parse(localStorage.getItem('bookapp_page_views') || '[]');
        views.push(pageData);
        localStorage.setItem('bookapp_page_views', JSON.stringify(views));
    }
    
    trackLinkClick(url, currentPage) {
        const linkData = {
            url: url,
            fromPage: currentPage,
            timestamp: new Date().toISOString()
        };
        
        console.log('Link click:', linkData);
        
        // Store in localStorage for demo purposes
        const clicks = JSON.parse(localStorage.getItem('bookapp_link_clicks') || '[]');
        clicks.push(linkData);
        localStorage.setItem('bookapp_link_clicks', JSON.stringify(clicks));
    }
    
    showPageOverview() {
        // Create and show a modal with all pages overview
        const modal = document.createElement('div');
        modal.className = 'page-overview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Book Overview</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generatePageOverview()}
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = `
            .page-overview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease-out;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideInDown 0.3s ease-out;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #eee;
                padding-bottom: 15px;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            .overview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }
            .overview-item {
                padding: 15px;
                border: 2px solid #eee;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .overview-item:hover {
                border-color: #3498db;
                transform: translateY(-5px);
            }
            .overview-item.current {
                border-color: #e74c3c;
                background: #f8f9fa;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
        
        document.body.appendChild(modal);
        
        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(styleElement);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(styleElement);
            }
        });
        
        // Bind page navigation
        modal.querySelectorAll('.overview-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageNumber = parseInt(item.dataset.page);
                this.goToPage(pageNumber);
                document.body.removeChild(modal);
                document.head.removeChild(styleElement);
            });
        });
    }
    
    generatePageOverview() {
        const pages = [
            { title: 'Introduction to Web Development', subtitle: 'Building the Foundation' },
            { title: 'HTML Fundamentals', subtitle: 'Structure and Semantics' },
            { title: 'CSS Styling', subtitle: 'Design and Layout' },
            { title: 'JavaScript Basics', subtitle: 'Programming Fundamentals' },
            { title: 'Responsive Design', subtitle: 'Mobile-First Approach' },
            { title: 'Modern JavaScript', subtitle: 'ES6+ Features' },
            { title: 'Web APIs', subtitle: 'Connecting to Services' },
            { title: 'Project Deployment', subtitle: 'Going Live' }
        ];
        
        return `
            <div class="overview-grid">
                ${pages.map((page, index) => `
                    <div class="overview-item ${index + 1 === this.currentPage ? 'current' : ''}" data-page="${index + 1}">
                        <div style="font-size: 12px; color: #999; margin-bottom: 5px;">Page ${String(index + 1).padStart(2, '0')}</div>
                        <h4 style="color: #2c3e50; margin-bottom: 5px;">${page.title}</h4>
                        <p style="color: #7f8c8d; font-size: 14px;">${page.subtitle}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getProgress() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
        return {
            completed: checkedBoxes.length,
            total: checkboxes.length,
            percentage: Math.round((checkedBoxes.length / checkboxes.length) * 100)
        };
    }
    
    showProgressStats() {
        const progress = this.getProgress();
        alert(`Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%)`);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookApp = new BookApp();
    
    // Add progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        cursor: pointer;
    `;
    
    const updateProgress = () => {
        const progress = window.bookApp.getProgress();
        progressIndicator.textContent = `${progress.completed}/${progress.total} tasks`;
    };
    
    progressIndicator.addEventListener('click', () => {
        window.bookApp.showProgressStats();
    });
    
    document.body.appendChild(progressIndicator);
    updateProgress();
    
    // Update progress when checkboxes change
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            updateProgress();
        }
    });
    
    // Add Easter egg - Konami code
    let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let userInput = [];
    
    document.addEventListener('keydown', (e) => {
        userInput.push(e.keyCode);
        if (userInput.length > konamiCode.length) {
            userInput.shift();
        }
        
        if (userInput.length === konamiCode.length && 
            userInput.every((key, index) => key === konamiCode[index])) {
            // Easter egg activated!
            document.body.style.animation = 'rainbow 2s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            
            // Add rainbow animation
            const rainbowStyle = document.createElement('style');
            rainbowStyle.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(rainbowStyle);
            
            setTimeout(() => {
                document.head.removeChild(rainbowStyle);
            }, 5000);
        }
    });
});

// Service Worker for offline functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}