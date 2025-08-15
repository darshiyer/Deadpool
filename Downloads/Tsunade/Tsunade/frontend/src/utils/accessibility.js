// Accessibility utilities and configurations

// Screen reader announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.dispatchEvent(new CustomEvent('escape'));
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// High contrast mode detection
export const isHighContrastMode = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Reduced motion detection
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Color scheme detection
export const getPreferredColorScheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Keyboard navigation helpers
export const handleArrowNavigation = (items, currentIndex, direction) => {
  let newIndex;
  
  switch (direction) {
    case 'up':
    case 'left':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case 'down':
    case 'right':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
    case 'home':
      newIndex = 0;
      break;
    case 'end':
      newIndex = items.length - 1;
      break;
    default:
      return currentIndex;
  }
  
  return newIndex;
};

// ARIA live region manager
class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.createDefaultRegions();
  }
  
  createDefaultRegions() {
    // Polite announcements
    const politeRegion = document.createElement('div');
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    politeRegion.id = 'live-region-polite';
    document.body.appendChild(politeRegion);
    this.regions.set('polite', politeRegion);
    
    // Assertive announcements
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'live-region-assertive';
    document.body.appendChild(assertiveRegion);
    this.regions.set('assertive', assertiveRegion);
  }
  
  announce(message, priority = 'polite') {
    const region = this.regions.get(priority);
    if (region) {
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }
  
  clear(priority = 'polite') {
    const region = this.regions.get(priority);
    if (region) {
      region.textContent = '';
    }
  }
}

export const liveRegionManager = new LiveRegionManager();

// Touch and gesture accessibility
export const addTouchAccessibility = (element, callback) => {
  let touchStartTime = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  
  const handleTouchStart = (e) => {
    touchStartTime = Date.now();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e) => {
    const touchEndTime = Date.now();
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const duration = touchEndTime - touchStartTime;
    const deltaX = Math.abs(touchEndX - touchStartX);
    const deltaY = Math.abs(touchEndY - touchStartY);
    
    // Detect tap (short duration, minimal movement)
    if (duration < 300 && deltaX < 10 && deltaY < 10) {
      callback('tap', { x: touchEndX, y: touchEndY });
    }
    
    // Detect swipe
    if (duration < 500 && (deltaX > 50 || deltaY > 50)) {
      if (deltaX > deltaY) {
        callback('swipe', { direction: touchEndX > touchStartX ? 'right' : 'left' });
      } else {
        callback('swipe', { direction: touchEndY > touchStartY ? 'down' : 'up' });
      }
    }
    
    // Detect long press
    if (duration > 500 && deltaX < 10 && deltaY < 10) {
      callback('longpress', { x: touchEndX, y: touchEndY });
    }
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

// Voice control helpers
export const voiceCommands = {
  navigation: {
    'go to dashboard': 'dashboard',
    'open dashboard': 'dashboard',
    'go to chat': 'chat',
    'open chat': 'chat',
    'start conversation': 'chat',
    'go to profile': 'profile',
    'open profile': 'profile',
    'view profile': 'profile',
    'go to calendar': 'calendar',
    'open calendar': 'calendar',
    'view calendar': 'calendar',
    'go to planner': 'planner',
    'open planner': 'planner',
    'exercise planner': 'planner',
    'go to settings': 'settings',
    'open settings': 'settings'
  },
  actions: {
    'scroll up': 'scroll-up',
    'scroll down': 'scroll-down',
    'go back': 'back',
    'refresh': 'refresh',
    'reload': 'refresh',
    'help': 'help',
    'search': 'search',
    'save': 'save',
    'cancel': 'cancel',
    'submit': 'submit',
    'send': 'send'
  }
};

// Accessibility testing helpers
export const checkAccessibility = () => {
  const issues = [];
  
  // Check for images without alt text
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  // Check for buttons without accessible names
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent.trim());
  if (buttonsWithoutText.length > 0) {
    issues.push(`${buttonsWithoutText.length} buttons without accessible names`);
  }
  
  // Check for form inputs without labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const inputsWithoutLabels = Array.from(inputs).filter(input => {
    const id = input.id;
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  if (inputsWithoutLabels.length > 0) {
    issues.push(`${inputsWithoutLabels.length} form inputs without labels`);
  }
  
  // Check color contrast (basic check)
  const elements = document.querySelectorAll('*');
  let lowContrastElements = 0;
  
  Array.from(elements).forEach(el => {
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Basic contrast check (simplified)
    if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      // This is a simplified check - in production, use a proper contrast ratio calculator
      const colorLuminance = getLuminance(color);
      const bgLuminance = getLuminance(backgroundColor);
      const contrast = (Math.max(colorLuminance, bgLuminance) + 0.05) / (Math.min(colorLuminance, bgLuminance) + 0.05);
      
      if (contrast < 4.5) {
        lowContrastElements++;
      }
    }
  });
  
  if (lowContrastElements > 0) {
    issues.push(`${lowContrastElements} elements may have low color contrast`);
  }
  
  return issues;
};

// Simplified luminance calculation
const getLuminance = (color) => {
  // This is a very simplified version - use a proper color library in production
  const rgb = color.match(/\d+/g);
  if (!rgb || rgb.length < 3) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c = parseInt(c) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Export default configuration
export const accessibilityConfig = {
  announcePageChanges: true,
  announceFormErrors: true,
  announceLoadingStates: true,
  enableKeyboardNavigation: true,
  enableVoiceCommands: true,
  enableTouchGestures: true,
  respectReducedMotion: true,
  respectHighContrast: true,
  focusManagement: true
};