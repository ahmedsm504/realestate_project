/**
 * Premium Real Estate Website JavaScript
 * Simplified and focused on essential features
 */

// ===== DOM ELEMENTS =====
const navbar = document.querySelector('.navbar');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const heroSlides = document.querySelectorAll('.hero-slide');

// ===== MOBILE NAVIGATION =====
let mobileMenuOpen = false;

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  
  if (mobileMenuOpen) {
    mobileMenu.classList.add('show');
    mobileMenuButton.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    mobileMenu.classList.remove('show');
    mobileMenuButton.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ===== NAVBAR SCROLL EFFECT =====
function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// ===== HERO SLIDESHOW =====
let currentSlide = 0;

function nextSlide() {
  heroSlides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % heroSlides.length;
  heroSlides[currentSlide].classList.add('active');
}

function startSlideshow() {
  setInterval(nextSlide, 10000); // Change every 10 seconds
}

// ===== SMOOTH SCROLLING =====
function smoothScroll(target) {
  const element = document.querySelector(target);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

// ===== MESSAGE AUTO HIDE =====
function hideMessages() {
  const messages = document.querySelectorAll('.message-item');
  messages.forEach(message => {
    setTimeout(() => {
      message.style.transform = 'translateX(100%)';
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 5000);
  });
}

// ===== SEARCH FORM ENHANCEMENT =====
function handleSearchForm() {
  const searchForm = document.querySelector('.search-form');
  const resetButton = searchForm.querySelector('button[type="reset"]');
  
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      searchForm.reset();
      // Add visual feedback
      const inputs = searchForm.querySelectorAll('.search-input');
      inputs.forEach(input => {
        input.style.transform = 'scale(0.98)';
        setTimeout(() => {
          input.style.transform = 'scale(1)';
        }, 100);
      });
    });
  }
}

// ===== SCROLL ANIMATIONS =====
function handleScrollAnimations() {
  const searchSection = document.querySelector('.search-section');
  const featureCards = document.querySelectorAll('.feature-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  if (searchSection) observer.observe(searchSection);
  featureCards.forEach(card => observer.observe(card));
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }

  // Navbar scroll effect
  window.addEventListener('scroll', handleNavbarScroll);

  // Start hero slideshow
  if (heroSlides.length > 1) {
    startSlideshow();
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      smoothScroll(target);
      
      // Close mobile menu if open
      if (mobileMenuOpen) {
        toggleMobileMenu();
      }
    });
  });

  // Auto-hide messages
  hideMessages();

  // Setup search form
  handleSearchForm();

  // Setup scroll animations
  handleScrollAnimations();

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenuOpen && !navbar.contains(e.target)) {
      toggleMobileMenu();
    }
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      toggleMobileMenu();
    }
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && mobileMenuOpen) {
      toggleMobileMenu();
    }
  });
});

// ===== SIMPLE ANIMATIONS CSS =====
const animationStyles = `
  .search-section {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }
  
  .search-section.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .feature-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }
  
  .feature-card.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .search-input:focus {
    transform: scale(1.02);
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);/**
 * Premium Real Estate Website JavaScript
 * Handles navigation, animations, and interactive features
 */

// ===== UTILITY FUNCTIONS =====
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== DOM ELEMENTS =====
const elements = {
  navbar: document.querySelector('.navbar'),
  mobileMenuButton: document.getElementById('mobile-menu-button'),
  mobileMenu: document.getElementById('mobile-menu'),
  messagesContainer: document.querySelector('.messages-container'),
  heroSection: document.querySelector('.hero-section'),
  featureCards: document.querySelectorAll('.feature-card'),
  navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
  buttons: document.querySelectorAll('.btn, .nav-button')
};

// ===== MOBILE NAVIGATION =====
class MobileNavigation {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    if (elements.mobileMenuButton && elements.mobileMenu) {
      elements.mobileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!elements.navbar.contains(e.target) && this.isOpen) {
          this.close();
        }
      });

      // Close menu when pressing Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Close menu when clicking on mobile nav links
      const mobileNavLinks = elements.mobileMenu.querySelectorAll('.mobile-nav-link');
      mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.close();
        });
      });
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    elements.mobileMenu.classList.add('show');
    elements.mobileMenuButton.classList.add('active');
    elements.mobileMenuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    elements.mobileMenu.classList.remove('show');
    elements.mobileMenuButton.classList.remove('active');
    elements.mobileMenuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// ===== NAVBAR SCROLL EFFECTS =====
class NavbarScroll {
  constructor() {
    this.lastScrollY = window.scrollY;
    this.scrollThreshold = 100;
    this.init();
  }

  init() {
    if (elements.navbar) {
      this.handleScroll = throttle(this.handleScroll.bind(this), 16);
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;

    // Add scrolled class when scrolling down
    if (currentScrollY > this.scrollThreshold) {
      elements.navbar.classList.add('scrolled');
    } else {
      elements.navbar.classList.remove('scrolled');
    }

    this.lastScrollY = currentScrollY;
  }
}

// ===== MESSAGE SYSTEM =====
class MessageSystem {
  constructor() {
    this.init();
  }

  init() {
    this.autoHideMessages();
    this.setupCloseButtons();
  }

  autoHideMessages() {
    const messages = document.querySelectorAll('.message-item');
    messages.forEach(message => {
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideMessage(message);
      }, 5000);
    });
  }

  setupCloseButtons() {
    const closeButtons = document.querySelectorAll('.message-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const message = button.closest('.message-item');
        this.hideMessage(message);
      });
    });
  }

  hideMessage(message) {
    if (message) {
      message.style.transform = 'translateX(100%)';
      message.style.opacity = '0';
      setTimeout(() => {
        message.remove();
      }, 300);
    }
  }

  showMessage(text, type = 'info') {
    const messageHtml = `
      <div class="message-item message-${type}" role="alert">
        <div class="message-content">
          <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${this.getMessageIcon(type)}
          </svg>
          <span>${text}</span>
        </div>
        <button class="message-close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    if (elements.messagesContainer) {
      elements.messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
      const newMessage = elements.messagesContainer.lastElementChild;
      
      // Setup close button for new message
      const closeButton = newMessage.querySelector('.message-close');
      closeButton.addEventListener('click', () => {
        this.hideMessage(newMessage);
      });

      // Auto-hide new message
      setTimeout(() => {
        this.hideMessage(newMessage);
      }, 5000);
    }
  }

  getMessageIcon(type) {
    const icons = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
      error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
      info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };
    return icons[type] || icons.info;
  }
}

// ===== ANIMATIONS =====
class AnimationController {
  constructor() {
    this.observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallaxEffect();
    this.setupHoverEffects();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, this.observerOptions);

      // Observe feature cards
      elements.featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
      });

      // Add CSS for animation
      const style = document.createElement('style');
      style.textContent = `
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupParallaxEffect() {
    if (elements.heroSection && window.innerWidth > 768) {
      const parallaxHandler = throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        elements.heroSection.style.transform = `translateY(${rate}px)`;
      }, 16);

      window.addEventListener('scroll', parallaxHandler);
    }
  }

  setupHoverEffects() {
    // Add ripple effect to buttons
    elements.buttons.forEach(button => {
      button.addEventListener('click', this.createRipple);
    });
  }

  createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    // Add ripple animation CSS if not already present
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', this.handleClick.bind(this));
    });
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href === '#' || href === '#!') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }
}

// ===== FORM ENHANCEMENT =====
class FormEnhancement {
  constructor() {
    this.init();
  }

  init() {
    this.setupFormValidation();
    this.setupLoadingStates();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    });
  }

  setupLoadingStates() {
    const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
    submitButtons.forEach(button => {
      button.addEventListener('click', this.showLoadingState);
    });
  }

  handleFormSubmit(e) {
    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    
    if (submitButton) {
      this.showLoadingState.call(submitButton);
    }
  }

  showLoadingState() {
    const button = this;
    const originalText = button.textContent;
    
    button.disabled = true;
    button.style.opacity = '0.7';
    button.textContent = 'جاري المعالجة...';
    
    // Restore button state after 10 seconds (fallback)
    setTimeout(() => {
      button.disabled = false;
      button.style.opacity = '1';
      button.textContent = originalText;
    }, 10000);
  }
}

// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.lazyLoadImages();
    this.preloadCriticalResources();
  }

  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  preloadCriticalResources() {
    const criticalImages = [
      '/static/img/logo.png',
      '/static/img/realestate.jfif'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  const mobileNav = new MobileNavigation();
  const navbarScroll = new NavbarScroll();
  const messageSystem = new MessageSystem();
  const animationController = new AnimationController();
  const smoothScroll = new SmoothScroll();
  const formEnhancement = new FormEnhancement();
  const performanceOptimizer = new PerformanceOptimizer();

  // Global error handling
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });

  // Handle window resize
  const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 1024 && mobileNav.isOpen) {
      mobileNav.close();
    }
  }, 250);

  window.addEventListener('resize', handleResize);

  // Expose messageSystem globally for Django messages
  window.showMessage = messageSystem.showMessage.bind(messageSystem);
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/js/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}



/************************/




// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenuButton.classList.toggle('active');
            mobileMenu.classList.toggle('show');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuButton.classList.remove('active');
                mobileMenu.classList.remove('show');
            }
        });
    }

    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // Active link highlighting based on current URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            if (link.classList.contains('nav-link')) {
                link.classList.add('active');
            }
        }
    });
});


/*****register */


document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // File input functionality (for registration)
    const fileInput = document.getElementById('profile_picture');
    const fileLabel = document.querySelector('.file-text');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                fileLabel.textContent = fileName;
                
                // Add success styling
                const wrapper = this.closest('.file-input-wrapper');
                wrapper.querySelector('.file-input-label').style.borderColor = '#48bb78';
                wrapper.querySelector('.file-input-label').style.background = 'rgba(72, 187, 120, 0.1)';
            } else {
                fileLabel.textContent = 'اختر صورة شخصية';
            }
        });
    }

    // Form validation
    const forms = document.querySelectorAll('.auth-form, .registration-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('.input-field');
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearValidation);
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            // Don't prevent default - let Django handle submission
            
            // Basic client-side validation
            let isFormValid = true;
            inputs.forEach(input => {
                const isValid = validateField({ target: input }, false);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            
            // Check required checkboxes (for registration)
            const termsCheckbox = document.getElementById('terms');
            if (termsCheckbox && !termsCheckbox.checked) {
                isFormValid = false;
                showNotification('يجب الموافقة على الشروط والأحكام', 'error');
                e.preventDefault();
                return;
            }
            
            if (!isFormValid) {
                showNotification('يرجى تصحيح الأخطاء في النموذج', 'error');
                e.preventDefault();
                smoothScrollToError();
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            
            if (this.classList.contains('auth-form')) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
            }
        });
    });

    function validateField(e, showFeedback = true) {
        const field = e.target;
        const value = field.value.trim();
        
        // Clear previous validation
        field.classList.remove('success', 'error');
        
        // Basic validation rules
        let isValid = true;
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }
        
        if (field.name === 'password1' && value) {
            // Password strength validation
            isValid = value.length >= 8;
        }
        
        if (field.name === 'password2' && value) {
            const password1 = document.getElementById('password1');
            if (password1) {
                isValid = value === password1.value;
            }
        }
        
        if (field.type === 'tel' && value) {
            // Basic phone number validation
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            isValid = phoneRegex.test(value) && value.length >= 10;
        }
        
        // Apply validation styling
        if (showFeedback && value) {
            field.classList.add(isValid ? 'success' : 'error');
        }
        
        return isValid;
    }

    function clearValidation(e) {
        const field = e.target;
        field.classList.remove('success', 'error');
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add notification styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border-left: 4px solid;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                }
                
                .notification-success {
                    border-left-color: #48bb78;
                }
                
                .notification-error {
                    border-left-color: #f56565;
                }
                
                .notification-info {
                    border-left-color: #667eea;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .notification-content i:first-child {
                    color: inherit;
                }
                
                .notification-success .notification-content i:first-child {
                    color: #48bb78;
                }
                
                .notification-error .notification-content i:first-child {
                    color: #f56565;
                }
                
                .notification-info .notification-content i:first-child {
                    color: #667eea;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #a0aec0;
                    margin-right: auto;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }
                
                .notification-close:hover {
                    color: #4a5568;
                    background: rgba(0, 0, 0, 0.1);
                }
                
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
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Username availability check (for registration)
    const usernameField = document.getElementById('username');
    let usernameTimeout;
    
    if (usernameField) {
        usernameField.addEventListener('input', function() {
            const username = this.value.trim();
            
            // Clear previous timeout
            clearTimeout(usernameTimeout);
            
            if (username.length >= 3) {
                // Add loading indicator
                this.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23667eea\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4\' class=\'animate-spin\'/%3E%3C/svg%3E")';
                this.style.backgroundRepeat = 'no-repeat';
                this.style.backgroundPosition = 'left 16px center';
                this.style.backgroundSize = '20px';
                
                // Simulate API call
                usernameTimeout = setTimeout(() => {
                    // Mock availability check
                    const isAvailable = Math.random() > 0.3; // 70% chance of being available
                    
                    if (isAvailable) {
                        this.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2348bb78\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E")';
                        this.classList.add('success');
                        this.classList.remove('error');
                    } else {
                        this.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23f56565\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cline x1=\'18\' y1=\'6\' x2=\'6\' y2=\'18\'%3E%3C/line%3E%3Cline x1=\'6\' y1=\'6\' x2=\'18\' y2=\'18\'%3E%3C/line%3E%3C/svg%3E")';
                        this.classList.add('error');
                        this.classList.remove('success');
                    }
                }, 1000);
            } else {
                this.style.backgroundImage = '';
                this.classList.remove('success', 'error');
            }
        });
    }

    // Smooth scrolling for mobile
    function smoothScrollToError() {
        const errorField = document.querySelector('.input-field.error');
        if (errorField) {
            errorField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            errorField.focus();
        }
    }

    // Password strength indicator (for registration)
    const password1Field = document.getElementById('password1');
    if (password1Field) {
        // Create password strength indicator
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">قوة كلمة المرور</div>
        `;
        
        // Add strength indicator styles
        const strengthStyle = document.createElement('style');
        strengthStyle.textContent = `
            .password-strength {
                margin-top: 8px;
            }
            
            .strength-bar {
                width: 100%;
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .strength-fill {
                height: 100%;
                width: 0%;
                transition: all 0.3s ease;
                border-radius: 2px;
            }
            
            .strength-text {
                font-size: 0.8rem;
                margin-top: 4px;
                color: #718096;
            }
            
            .strength-weak .strength-fill {
                width: 25%;
                background: #f56565;
            }
            
            .strength-fair .strength-fill {
                width: 50%;
                background: #ed8936;
            }
            
            .strength-good .strength-fill {
                width: 75%;
                background: #38b2ac;
            }
            
            .strength-strong .strength-fill {
                width: 100%;
                background: #48bb78;
            }
        `;
        
        document.head.appendChild(strengthStyle);
        password1Field.parentNode.appendChild(strengthIndicator);
        
        password1Field.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Remove existing strength classes
            strengthIndicator.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');
            
            if (password.length > 0) {
                strengthIndicator.classList.add(`strength-${strength.level}`);
                strengthIndicator.querySelector('.strength-text').textContent = strength.text;
            } else {
                strengthIndicator.querySelector('.strength-text').textContent = 'قوة كلمة المرور';
            }
        });
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        let level = 'weak';
        let text = 'ضعيفة';
        
        if (password.length >= 8) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        switch (score) {
            case 0:
            case 1:
                level = 'weak';
                text = 'ضعيفة جداً';
                break;
            case 2:
                level = 'fair';
                text = 'ضعيفة';
                break;
            case 3:
            case 4:
                level = 'good';
                text = 'جيدة';
                break;
            case 5:
                level = 'strong';
                text = 'قوية';
                break;
        }
        
        return { level, text };
    }

    // Keyboard navigation enhancement
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.target.matches('button, [type="submit"]')) {
            e.preventDefault();
            const inputs = Array.from(document.querySelectorAll('.input-field, .checkbox-input'));
            const currentIndex = inputs.indexOf(e.target);
            
            if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            } else if (currentIndex === inputs.length - 1) {
                document.querySelector('.submit-btn').focus();
            }
        }
    });

    // Touch and accessibility improvements
    const interactiveElements = document.querySelectorAll('button, input, label[for], a');
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });

    // Social login loading states
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        });
    });

    console.log('Authentication form initialized successfully! 🚀');
});