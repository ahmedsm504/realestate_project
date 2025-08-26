/**
 * Premium Real Estate Website JavaScript
 * Clean, consolidated version without conflicts - FIXED VERSION
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

// ===== SAFE DOM ELEMENT GETTER =====
const safeGetElement = (selector) => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Error selecting element: ${selector}`, error);
    return null;
  }
};

const safeGetElements = (selector) => {
  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Error selecting elements: ${selector}`, error);
    return [];
  }
};

// ===== DOM ELEMENTS WITH SAFE SELECTION =====
const elements = {
  get navbar() { return safeGetElement('.navbar'); },
  get mobileMenuButton() { return safeGetElement('#mobile-menu-button'); },
  get mobileMenu() { return safeGetElement('#mobile-menu'); },
  get messagesContainer() { return safeGetElement('.messages-container'); },
  get heroSection() { return safeGetElement('.hero-section'); },
  get featureCards() { return safeGetElements('.feature-card'); },
  get navLinks() { return safeGetElements('.nav-link, .mobile-nav-link'); },
  get buttons() { return safeGetElements('.btn, .nav-button'); }
};

// ===== MOBILE NAVIGATION =====
class MobileNavigation {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    try {
      if (elements.mobileMenuButton && elements.mobileMenu) {
        elements.mobileMenuButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
          if (elements.navbar && !elements.navbar.contains(e.target) && this.isOpen) {
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
    } catch (error) {
      console.error('Error initializing mobile navigation:', error);
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    try {
      this.isOpen = true;
      elements.mobileMenu?.classList.add('show');
      elements.mobileMenuButton?.classList.add('active');
      elements.mobileMenuButton?.setAttribute('aria-expanded', 'true');
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    } catch (error) {
      console.error('Error opening mobile menu:', error);
    }
  }

  close() {
    try {
      this.isOpen = false;
      elements.mobileMenu?.classList.remove('show');
      elements.mobileMenuButton?.classList.remove('active');
      elements.mobileMenuButton?.setAttribute('aria-expanded', 'false');
      if (document.body) {
        document.body.style.overflow = '';
      }
    } catch (error) {
      console.error('Error closing mobile menu:', error);
    }
  }
}

// ===== NAVBAR SCROLL EFFECTS =====
class NavbarScroll {
  constructor() {
    this.lastScrollY = window.scrollY || 0;
    this.scrollThreshold = 100;
    this.init();
  }

  init() {
    try {
      if (elements.navbar) {
        this.handleScroll = throttle(this.handleScroll.bind(this), 16);
        window.addEventListener('scroll', this.handleScroll);
      }
    } catch (error) {
      console.error('Error initializing navbar scroll:', error);
    }
  }

  handleScroll() {
    try {
      const currentScrollY = window.scrollY || 0;

      // Add scrolled class when scrolling down
      if (currentScrollY > this.scrollThreshold) {
        elements.navbar?.classList.add('scrolled');
      } else {
        elements.navbar?.classList.remove('scrolled');
      }

      this.lastScrollY = currentScrollY;
    } catch (error) {
      console.error('Error handling scroll:', error);
    }
  }
}

// ===== MESSAGE SYSTEM =====
class MessageSystem {
  constructor() {
    this.init();
  }

  init() {
    try {
      this.autoHideMessages();
      this.setupCloseButtons();
    } catch (error) {
      console.error('Error initializing message system:', error);
    }
  }

  autoHideMessages() {
    try {
      const messages = safeGetElements('.message-item');
      messages.forEach(message => {
        // Auto-hide after 5 seconds
        setTimeout(() => {
          this.hideMessage(message);
        }, 5000);
      });
    } catch (error) {
      console.error('Error auto-hiding messages:', error);
    }
  }

  setupCloseButtons() {
    try {
      const closeButtons = safeGetElements('.message-close');
      closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const message = button.closest('.message-item');
          this.hideMessage(message);
        });
      });
    } catch (error) {
      console.error('Error setting up close buttons:', error);
    }
  }

  hideMessage(message) {
    try {
      if (message && message.style) {
        message.style.transform = 'translateX(100%)';
        message.style.opacity = '0';
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error hiding message:', error);
    }
  }

  showMessage(text, type = 'info') {
    try {
      const messageHtml = `
        <div class="message-item message-${type}" role="alert">
          <div class="message-content">
            <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${this.getMessageIcon(type)}
            </svg>
            <span>${text}</span>
          </div>
          <button class="message-close" type="button">
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
        const closeButton = newMessage?.querySelector('.message-close');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.hideMessage(newMessage);
          });
        }

        // Auto-hide new message
        setTimeout(() => {
          this.hideMessage(newMessage);
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing message:', error);
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
    try {
      this.setupIntersectionObserver();
      this.setupParallaxEffect();
      this.setupHoverEffects();
    } catch (error) {
      console.error('Error initializing animations:', error);
    }
  }

  setupIntersectionObserver() {
    try {
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
          if (card && card.style) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
          }
        });

        // Add CSS for animation
        if (!document.querySelector('#animate-styles')) {
          const style = document.createElement('style');
          style.id = 'animate-styles';
          style.textContent = `
            .animate-in {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    } catch (error) {
      console.error('Error setting up intersection observer:', error);
    }
  }

  setupParallaxEffect() {
    try {
      if (elements.heroSection && window.innerWidth > 768) {
        const parallaxHandler = throttle(() => {
          const scrolled = window.pageYOffset || 0;
          const rate = scrolled * -0.5;
          if (elements.heroSection && elements.heroSection.style) {
            elements.heroSection.style.transform = `translateY(${rate}px)`;
          }
        }, 16);

        window.addEventListener('scroll', parallaxHandler);
      }
    } catch (error) {
      console.error('Error setting up parallax effect:', error);
    }
  }

  setupHoverEffects() {
    try {
      // Add ripple effect to buttons
      elements.buttons.forEach(button => {
        if (button && typeof button.addEventListener === 'function') {
          button.addEventListener('click', this.createRipple);
        }
      });
    } catch (error) {
      console.error('Error setting up hover effects:', error);
    }
  }

  createRipple(e) {
    try {
      const button = e.currentTarget;
      if (!button) return;

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
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    } catch (error) {
      console.error('Error creating ripple effect:', error);
    }
  }
}

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    try {
      const links = safeGetElements('a[href^="#"]');
      links.forEach(link => {
        if (link && typeof link.addEventListener === 'function') {
          link.addEventListener('click', this.handleClick.bind(this));
        }
      });
    } catch (error) {
      console.error('Error initializing smooth scroll:', error);
    }
  }

  handleClick(e) {
    try {
      const href = e.currentTarget?.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const target = safeGetElement(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + (window.pageYOffset || 0) - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error handling smooth scroll:', error);
    }
  }
}

// ===== FORM ENHANCEMENT - FIXED VERSION =====
class FormEnhancement {
  constructor() {
    this.init();
  }

  init() {
    try {
      this.setupFormValidation();
      this.setupLoadingStates();
      this.setupPasswordToggles();
      this.setupFileInputs();
    } catch (error) {
      console.error('Error initializing form enhancement:', error);
    }
  }

  setupFormValidation() {
    try {
      const forms = safeGetElements('form');
      if (!forms || forms.length === 0) return;

      forms.forEach(form => {
        if (form && typeof form.addEventListener === 'function') {
          form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
      });
    } catch (error) {
      console.error('Error setting up form validation:', error);
    }
  }

  handleFormSubmit(event) {
    try {
      const form = event.target;
      if (!form) return;

      // Add your form validation logic here
      console.log('Form submitted:', form);
      
      // Example validation
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          field.focus();
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        event.preventDefault();
        this.showValidationError();
      }
    } catch (error) {
      console.error('Error handling form submit:', error);
    }
  }

  showValidationError() {
    try {
      if (window.showMessage && typeof window.showMessage === 'function') {
        window.showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
      }
    } catch (error) {
      console.error('Error showing validation error:', error);
    }
  }

  setupLoadingStates() {
    try {
      const submitButtons = safeGetElements('button[type="submit"], input[type="submit"]');
      submitButtons.forEach(button => {
        if (button && typeof button.addEventListener === 'function') {
          button.addEventListener('click', this.showLoadingState.bind(this));
        }
      });
    } catch (error) {
      console.error('Error setting up loading states:', error);
    }
  }

  showLoadingState(event) {
    try {
      const button = event.currentTarget;
      if (!button) return;

      const originalText = button.textContent || button.value;
      button.disabled = true;
      
      if (button.textContent !== undefined) {
        button.textContent = 'جاري التحميل...';
      } else if (button.value !== undefined) {
        button.value = 'جاري التحميل...';
      }

      // Reset button after 5 seconds if form doesn't redirect
      setTimeout(() => {
        button.disabled = false;
        if (button.textContent !== undefined) {
          button.textContent = originalText;
        } else if (button.value !== undefined) {
          button.value = originalText;
        }
      }, 5000);
    } catch (error) {
      console.error('Error showing loading state:', error);
    }
  }

  setupPasswordToggles() {
    try {
      const passwordToggles = safeGetElements('.password-toggle');
      passwordToggles.forEach(toggle => {
        if (toggle && typeof toggle.addEventListener === 'function') {
          toggle.addEventListener('click', function() {
            try {
              const targetId = this.getAttribute('data-target');
              if (!targetId) return;

              const passwordField = safeGetElement(`#${targetId}`);
              const icon = this.querySelector('i');
              
              if (passwordField && icon) {
                if (passwordField.type === 'password') {
                  passwordField.type = 'text';
                  icon.classList.remove('fa-eye');
                  icon.classList.add('fa-eye-slash');
                } else {
                  passwordField.type = 'password';
                  icon.classList.remove('fa-eye-slash');
                  icon.classList.add('fa-eye');
                }
              }
            } catch (error) {
              console.error('Error toggling password visibility:', error);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error setting up password toggles:', error);
    }
  }

  setupFileInputs() {
    try {
      const fileInput = safeGetElement('#profile_picture');
      const fileLabel = safeGetElement('.file-text');
      
      if (fileInput && fileLabel && typeof fileInput.addEventListener === 'function') {
        fileInput.addEventListener('change', function() {
          try {
            if (this.files && this.files.length > 0) {
              const fileName = this.files[0].name;
              fileLabel.textContent = fileName;
              
              // Add success styling
              const wrapper = this.closest('.file-input-wrapper');
              if (wrapper) {
                const label = wrapper.querySelector('.file-input-label');
                if (label && label.style) {
                  label.style.borderColor = '#48bb78';
                  label.style.background = 'rgba(72, 187, 120, 0.1)';
                }
              }
            } else {
              fileLabel.textContent = 'اختر صورة شخصية';
            }
          } catch (error) {
            console.error('Error handling file input change:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error setting up file inputs:', error);
    }
  }
}

// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    try {
      this.lazyLoadImages();
      this.preloadCriticalResources();
    } catch (error) {
      console.error('Error initializing performance optimizer:', error);
    }
  }

  lazyLoadImages() {
    try {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        const lazyImages = safeGetElements('img[data-src]');
        lazyImages.forEach(img => {
          if (img) {
            imageObserver.observe(img);
          }
        });
      }
    } catch (error) {
      console.error('Error setting up lazy loading:', error);
    }
  }

  preloadCriticalResources() {
    try {
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
    } catch (error) {
      console.error('Error preloading critical resources:', error);
    }
  }
}

// ===== INITIALIZATION WITH ERROR HANDLING =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Real Estate Website...');

    // Initialize all components with error handling
    let mobileNav, navbarScroll, messageSystem, animationController, 
        smoothScroll, formEnhancement, performanceOptimizer;

    try {
      mobileNav = new MobileNavigation();
    } catch (error) {
      console.error('Failed to initialize mobile navigation:', error);
    }

    try {
      navbarScroll = new NavbarScroll();
    } catch (error) {
      console.error('Failed to initialize navbar scroll:', error);
    }

    try {
      messageSystem = new MessageSystem();
    } catch (error) {
      console.error('Failed to initialize message system:', error);
    }

    try {
      animationController = new AnimationController();
    } catch (error) {
      console.error('Failed to initialize animation controller:', error);
    }

    try {
      smoothScroll = new SmoothScroll();
    } catch (error) {
      console.error('Failed to initialize smooth scroll:', error);
    }

    try {
      formEnhancement = new FormEnhancement();
    } catch (error) {
      console.error('Failed to initialize form enhancement:', error);
    }

    try {
      performanceOptimizer = new PerformanceOptimizer();
    } catch (error) {
      console.error('Failed to initialize performance optimizer:', error);
    }

    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });

    // Handle window resize
    const handleResize = debounce(() => {
      try {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 1024 && mobileNav && mobileNav.isOpen) {
          mobileNav.close();
        }
      } catch (error) {
        console.error('Error handling window resize:', error);
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    // Expose messageSystem globally for Django messages
    if (messageSystem && typeof messageSystem.showMessage === 'function') {
      window.showMessage = messageSystem.showMessage.bind(messageSystem);
    }

    // Active link highlighting based on current URL
    try {
      const currentPath = window.location.pathname;
      elements.navLinks.forEach(link => {
        if (link && link.getAttribute && link.getAttribute('href') === currentPath) {
          if (link.classList && link.classList.contains('nav-link')) {
            link.classList.add('active');
          }
        }
      });
    } catch (error) {
      console.error('Error highlighting active links:', error);
    }

    console.log('Real Estate Website initialized successfully! 🚀');

  } catch (error) {
    console.error('Critical error during initialization:', error);
  }
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