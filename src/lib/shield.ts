// src/lib/shield.ts
// ═══ ANTI-SCRAPING SHIELD ═══
// Protects creator content on public profile pages.
// Not foolproof (determined scrapers bypass everything) but raises the bar.

/**
 * Initialize anti-scraping protections on public pages.
 * Call once when the profile page mounts.
 */
export function initShield() {
  // 1. Disable right-click on images (cover photos, avatars)
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' || target.closest('img')) {
      e.preventDefault();
    }
  });

  // 2. Disable image dragging
  document.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  // 3. Disable long-press save on mobile (iOS/Android)
  const style = document.createElement('style');
  style.textContent = `
    img {
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      pointer-events: none;
    }
    /* Re-enable pointer events on clickable images (inside buttons/links) */
    button img, a img, [role="button"] img {
      pointer-events: auto;
    }
    /* Disable text selection on profile info to prevent easy copy-paste scraping */
    [data-shield] {
      -webkit-user-select: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  // 4. Detect headless browsers / automation
  const isHeadless = detectHeadless();
  if (isHeadless) {
    // Don't block — just flag for analytics. Real users on weird browsers exist.
    try {
      (window as any).__HEADLESS_DETECTED = true;
    } catch {}
  }
}

/**
 * Detect common headless browser signatures.
 * Returns true if likely automated.
 */
function detectHeadless(): boolean {
  const ua = navigator.userAgent;

  // PhantomJS
  if (/PhantomJS/i.test(ua)) return true;

  // Headless Chrome
  if (/HeadlessChrome/i.test(ua)) return true;

  // Missing plugins (headless browsers have 0 plugins)
  if (navigator.plugins && navigator.plugins.length === 0 && !/mobile|android|iphone/i.test(ua)) return true;

  // WebDriver flag (Selenium, Puppeteer)
  if ((navigator as any).webdriver) return true;

  // Chrome without chrome runtime (headless)
  if ((window as any).chrome && !(window as any).chrome.runtime && !/mobile|android/i.test(ua)) return true;

  return false;
}

/**
 * Fingerprint a visitor for bot detection.
 * Returns a lightweight fingerprint string.
 * Used by edge functions to correlate suspicious patterns.
 */
export function getVisitorFingerprint(): string {
  const parts = [
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ];
  return btoa(parts.join('|')).slice(0, 16);
}
