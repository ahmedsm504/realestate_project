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