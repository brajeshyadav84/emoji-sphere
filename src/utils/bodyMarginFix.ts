/**
 * Utility to prevent body margin-right from being added by UI libraries
 * This addresses the issue where dropdown menus and modals add margin-right to body
 */

let observer: MutationObserver | null = null;

export const initBodyMarginFix = () => {
  // Remove any existing observer
  if (observer) {
    observer.disconnect();
  }

  const removeBodyMargin = () => {
    const body = document.body;
    if (body) {
      // Remove margin-right and padding-right styles
      body.style.marginRight = '0';
      body.style.paddingRight = '0';
      
      // Remove the style attribute if it only contains margin/padding right
      const style = body.getAttribute('style');
      if (style) {
        const cleanedStyle = style
          .replace(/margin-right\s*:\s*[^;]*;?/gi, '')
          .replace(/padding-right\s*:\s*[^;]*;?/gi, '')
          .trim();
        
        if (cleanedStyle) {
          body.setAttribute('style', cleanedStyle);
        } else {
          body.removeAttribute('style');
        }
      }
    }
  };

  // Initial fix
  removeBodyMargin();

  // Watch for attribute changes on body
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'style' || mutation.attributeName === 'data-scroll-locked')) {
        // Small delay to let the library apply its changes, then override
        setTimeout(removeBodyMargin, 0);
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'data-scroll-locked', 'class']
  });

  // Also watch for any direct style changes
  const originalSetAttribute = document.body.setAttribute;
  document.body.setAttribute = function(name: string, value: string) {
    originalSetAttribute.call(this, name, value);
    if (name === 'style') {
      setTimeout(removeBodyMargin, 0);
    }
  };
};

export const cleanupBodyMarginFix = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};