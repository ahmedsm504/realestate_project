// static/js/property_list.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize all functionalities ---
    initFilterToggle();
    initViewToggle();
    initScrollToTop();
    initFormSubmissionLoader();
});

/**
 * Handles the logic for showing and hiding the advanced filters section.
 */
function initFilterToggle() {
    const toggleBtn = document.getElementById('toggle-filters-btn');
    const filtersContent = document.getElementById('filters-content');

    if (!toggleBtn || !filtersContent) return;

    // Check if any filters are active on page load to show the filters by default
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeys = ['city_search', 'property_type', 'status', 'bedrooms', 'min_price', 'max_price', 'min_area', 'max_area'];
    const hasActiveFilters = filterKeys.some(key => urlParams.has(key) && urlParams.get(key) !== '');

    if (hasActiveFilters) {
        toggleFilters(true);
    }
    
    toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleFilters(!isExpanded);
    });

    function toggleFilters(show) {
        if (show) {
            filtersContent.classList.add('is-open');
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.querySelector('span').textContent = 'إخفاء الفلاتر';
        } else {
            filtersContent.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.querySelector('span').textContent = 'إظهار الفلاتر';
        }
    }
}

/**
 * Handles switching between grid and list view for properties.
 * Saves the user's preference in localStorage.
 */
function initViewToggle() {
    const viewToggleContainer = document.querySelector('.view-toggle');
    const resultsContainer = document.getElementById('property-results');
    
    if (!viewToggleContainer || !resultsContainer) return;
    
    const viewButtons = viewToggleContainer.querySelectorAll('.view-btn');
    const savedView = localStorage.getItem('property_view') || 'grid';

    function setView(view) {
        if (view === 'list') {
            resultsContainer.classList.remove('property-grid');
            resultsContainer.classList.add('property-list');
        } else {
            resultsContainer.classList.remove('property-list');
            resultsContainer.classList.add('property-grid');
        }

        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        localStorage.setItem('property_view', view);
    }

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            setView(button.dataset.view);
        });
    });

    // Set initial view on page load
    setView(savedView);
}

/**
 * Handles the "scroll to top" button visibility and functionality.
 */
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-to-top');

    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('is-visible');
        } else {
            scrollTopBtn.classList.remove('is-visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Shows a loading overlay whenever the filter form is submitted.
 */
function initFormSubmissionLoader() {
    const form = document.getElementById('filters-form');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (!form || !loadingOverlay) return;

    form.addEventListener('submit', () => {
        loadingOverlay.classList.add('is-visible');
    });
    
    // Hide loader if user navigates back using browser buttons
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
             loadingOverlay.classList.remove('is-visible');
        }
    });
}