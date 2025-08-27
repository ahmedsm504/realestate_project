// Premium Real Estate Search UI - Enhanced JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSearchFunctionality();
    initLoadingStates();
    initImageLazyLoading();
    initSmoothScrolling();
    initFormEnhancements();
    initAccessibility();
    initPerformanceOptimizations();
});

// Main search functionality with scroll to results
function initSearchFunctionality() {
    const form = document.querySelector('form');
    const searchInput = document.getElementById('q');
    const propertyGrid = document.querySelector('.property-grid');
    const emptyState = document.querySelector('.empty-state');
    
    if (!form || !searchInput) return;
    
    // Auto-scroll to results when user types city name
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        // Add visual feedback
        this.style.borderColor = query.length > 0 ? 'var(--primary-color)' : 'var(--gray-200)';
        
        if (query.length >= 2) {
            // Show loading state
            showSearchSuggestions(query);
            
            searchTimeout = setTimeout(() => {
                // Smooth scroll to results section after typing
                scrollToResults();
                
                // Optional: Trigger search suggestions or auto-complete
                fetchSearchSuggestions(query);
            }, 800);
        }
    });
    
    // Form submission with enhanced UX
    form.addEventListener('submit', function(e) {
        const formData = new FormData(this);
        const hasSearchTerm = formData.get('q')?.trim();
        const hasFilters = formData.get('property_type') || formData.get('status') || formData.get('max_price');
        
        if (hasSearchTerm || hasFilters) {
            showLoadingOverlay();
            
            // Smooth scroll to results area after a short delay
            setTimeout(() => {
                scrollToResults();
            }, 300);
        }
    });
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    // Scroll to results function
    window.scrollToResults = function() {
        const resultsSection = document.querySelector('.property-grid') || 
                              document.querySelector('.empty-state');
        
        if (resultsSection) {
            const offsetTop = resultsSection.getBoundingClientRect().top + window.pageYOffset - 100;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Add highlight effect
            setTimeout(() => {
                resultsSection.classList.add('results-highlight');
                setTimeout(() => {
                    resultsSection.classList.remove('results-highlight');
                }, 1000);
            }, 500);
        }
    };
    
    // Enhance pagination links
    const paginationLinks = document.querySelectorAll('.pagination-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            showLoadingOverlay();
            
            // Scroll to top smoothly after navigation
            setTimeout(() => {
                window.scrollTo({ 
                    top: 0, 
                    behavior: 'smooth' 
                });
            }, 100);
        });
    });
}

// Loading states and overlays
function initLoadingStates() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Show loading overlay
    window.showLoadingOverlay = function() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Hide loading overlay
    window.hideLoadingOverlay = function() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Hide loading overlay on page load
    window.addEventListener('load', () => {
        setTimeout(hideLoadingOverlay, 500);
    });
    
    // Handle browser back/forward
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            hideLoadingOverlay();
        }
    });
}

// Enhanced image lazy loading with intersection observer
function initImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src || img.src;
                    
                    // Create new image to preload
                    const newImg = new Image();
                    newImg.onload = () => {
                        img.src = src;
                        img.classList.remove('loading-shimmer');
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.3s ease-in-out';
                        
                        // Fade in effect
                        setTimeout(() => {
                            img.style.opacity = '1';
                        }, 50);
                    };
                    
                    newImg.onerror = () => {
                        img.classList.remove('loading-shimmer');
                        img.style.opacity = '1';
                        // Set fallback image
                        img.src = 'data:image/svg+xml,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="#e2e8f0">
                                <rect width="400" height="300" fill="#f1f5f9"/>
                                <text x="200" y="150" text-anchor="middle" fill="#64748b" font-size="16" font-family="Cairo, sans-serif">🏠 صورة غير متاحة</text>
                            </svg>
                        `);
                    };
                    
                    newImg.src = src;
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        // Observe all property images
        document.querySelectorAll('.property-image').forEach(img => {
            img.classList.add('loading-shimmer');
            imageObserver.observe(img);
        });
    }
}

// Form enhancements and validation
function initFormEnhancements() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    
    inputs.forEach(input => {
        // Add floating label effect
        if (input.type !== 'select-one') {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
            
            // Check initial state
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        }
        
        // Add validation feedback
        input.addEventListener('invalid', function() {
            this.style.borderColor = 'var(--error-color)';
            this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        });
        
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = 'var(--success-color)';
                this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
    
    // Price input formatting
    const priceInput = document.getElementById('max_price');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            // Remove non-numeric characters
            let value = this.value.replace(/[^\d]/g, '');
            
            // Format with thousands separator
            if (value) {
                value = parseInt(value).toLocaleString('ar-EG');
                this.setAttribute('data-raw-value', this.value.replace(/[^\d]/g, ''));
            }
        });
        
        // Handle form submission - send raw numeric value
        priceInput.closest('form').addEventListener('submit', function() {
            const rawValue = priceInput.getAttribute('data-raw-value');
            if (rawValue) {
                priceInput.value = rawValue;
            }
        });
    }
}

// Search suggestions functionality
function fetchSearchSuggestions(query) {
    // This would typically fetch from your backend API
    // For now, we'll simulate with local suggestions
    const suggestions = [
        'القاهرة', 'الجيزة', 'الإسكندرية', 'أسوان', 'الأقصر',
        'المنصورة', 'طنطا', 'الزقازيق', 'أسيوط', 'بني سويف',
        'الفيوم', 'المنيا', 'قنا', 'سوهاج', 'البحر الأحمر'
    ];
    
    const filteredSuggestions = suggestions.filter(city => 
        city.includes(query) || query.includes(city)
    );
    
    showSearchSuggestions(query, filteredSuggestions);
}

function showSearchSuggestions(query, suggestions = []) {
    // Remove existing suggestions
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    if (suggestions.length === 0 || query.length < 2) return;
    
    const searchInput = document.getElementById('q');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.innerHTML = `
        <div class="suggestions-list">
            ${suggestions.slice(0, 5).map(suggestion => `
                <div class="suggestion-item" data-value="${suggestion}">
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${suggestion}
                </div>
            `).join('')}
        </div>
    `;
    
    // Position suggestions below input
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(suggestionsContainer);
    
    // Handle suggestion clicks
    suggestionsContainer.addEventListener('click', function(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            const value = suggestionItem.getAttribute('data-value');
            searchInput.value = value;
            suggestionsContainer.remove();
            
            // Trigger search after selection
            setTimeout(() => {
                searchInput.closest('form').submit();
            }, 300);
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.remove();
        }
    }, { once: true });
}

// Accessibility improvements
function initAccessibility() {
    // Add ARIA labels and roles
    const form = document.querySelector('form');
    if (form) {
        form.setAttribute('role', 'search');
        form.setAttribute('aria-label', 'البحث عن العقارات وفلترتها');
    }
    
    // Keyboard navigation for property cards
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `عقار ${index + 1}`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('.property-name');
                if (link) link.click();
            }
        });
    });
    
    // Announce search results to screen readers
    const announceResults = (count) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `تم العثور على ${count} عقار مطابق لبحثك`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 3000);
    };
    
    // Add screen reader only class
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

// Performance optimizations
function initPerformanceOptimizations() {
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            // Add scroll-based animations here
            handleScrollAnimations();
            scrollTimeout = null;
        }, 16); // ~60fps
    }, { passive: true });
    
    // Optimize form submissions
    const form = document.querySelector('form');
    if (form) {
        let submitTimeout;
        form.addEventListener('submit', function(e) {
            if (submitTimeout) {
                e.preventDefault();
                return false;
            }
            
            submitTimeout = setTimeout(() => {
                submitTimeout = null;
            }, 1000);
        });
    }
    
    // Preload critical images
    const criticalImages = document.querySelectorAll('.property-image[data-priority="high"]');
    criticalImages.forEach(img => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = img.src || img.dataset.src;
        document.head.appendChild(preloadLink);
    });
}

function handleScrollAnimations() {
    // Animate elements as they come into view
    const elements = document.querySelectorAll('.property-card:not(.animated)');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.classList.add('animated');
            }, Math.random() * 200);
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    // Hide loading overlay on error
    hideLoadingOverlay();
    
    // Show user-friendly error message
    showErrorMessage('حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.');
});

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        ">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

// Add keyframe animations
const animations = document.createElement('style');
animations.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--gray-200);
        border-top: none;
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: fadeInDown 0.3s ease-out;
    }
    
    .suggestion-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        border-bottom: 1px solid var(--gray-100);
    }
    
    .suggestion-item:hover {
        background-color: var(--gray-50);
    }
    
    .suggestion-item:last-child {
        border-bottom: none;
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
    
    .suggestion-item svg {
        color: var(--primary-color);
        width: 1rem;
        height: 1rem;
        margin-left: 0.5rem;
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animations);


