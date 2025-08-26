/**
 * Premium Real Estate Website JavaScript
 * Clean, consolidated version without conflicts
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
    this.setupPasswordToggles();
    this.setupFileInputs();
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

  setupPasswordToggles() {
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
  }

  setupFileInputs() {
    const fileInput = document.getElementById('profile_picture');
    const fileLabel = document.querySelector('.file-text');
    
    if (fileInput && fileLabel) {
      fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          const fileName = this.files[0].name;
          fileLabel.textContent = fileName;
          
          // Add success styling
          const wrapper = this.closest('.file-input-wrapper');
          if (wrapper) {
            const label = wrapper.querySelector('.file-input-label');
            if (label) {
              label.style.borderColor = '#48bb78';
              label.style.background = 'rgba(72, 187, 120, 0.1)';
            }
          }
        } else {
          fileLabel.textContent = 'اختر صورة شخصية';
        }
      });
    }
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

  // Active link highlighting based on current URL
  const currentPath = window.location.pathname;
  elements.navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      if (link.classList.contains('nav-link')) {
        link.classList.add('active');
      }
    }
  });

  console.log('Real Estate Website initialized successfully! 🚀');
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