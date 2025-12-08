// Security configuration for the application
export const SECURITY_CONFIG = {
  // Prevent common developer tool shortcuts
  BLOCKED_SHORTCUTS: [
    'F12',
    'Ctrl+Shift+I',
    'Ctrl+Shift+J',
    'Ctrl+Shift+C',
    'Ctrl+U',
    'Ctrl+S', // Prevent save page
    'Ctrl+P', // Prevent print
  ],
  
  // Content validation rules
  CONTENT_RULES: {
    MAX_LENGTH: 500,
    MIN_LENGTH: 1,
    REQUIRE_APPROVAL: true,
  },
  
  // Security headers (for server-side implementation)
  SECURITY_HEADERS: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
};

// Disable common attack vectors
export const applySecurityMeasures = () => {
  // Disable drag and drop
  document.addEventListener('dragstart', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
  
  // Disable text selection in sensitive areas
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('no-select')) {
      e.preventDefault();
    }
  });
  
  // Clear console periodically (basic obfuscation)
  setInterval(() => {
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }
  }, 10000);
};

export default SECURITY_CONFIG;