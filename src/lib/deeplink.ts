// src/lib/deeplink.ts
// ═══ DEEPLINK ENGINE v2 ═══
// Detects in-app browsers (Instagram, Facebook, TikTok, Snapchat, X, etc.)
// and forces the system browser (Chrome, Safari, Samsung Internet, etc.)
//
// Supports: Instagram, Facebook, TikTok, Snapchat, X/Twitter, LinkedIn,
//           Telegram, Line, Pinterest, Reddit, WeChat
// Platforms: iOS (Safari), Android (Chrome, Samsung Internet, any default)

export interface BrowserInfo {
  isInApp: boolean;
  isIG: boolean;
  isFB: boolean;
  isTT: boolean;
  isSN: boolean;
  isX: boolean;
  isLI: boolean;
  isTG: boolean;
  isLine: boolean;
  isPin: boolean;
  isReddit: boolean;
  isWeChat: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  appName: string | null;
}

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent || '';

  const isIG = /Instagram/i.test(ua);
  const isFB = /FBAN|FBAV/i.test(ua);
  const isTT = /BytedanceWebview|TikTok|musical_ly/i.test(ua);
  const isSN = /Snapchat/i.test(ua);
  const isX = /Twitter/i.test(ua); // X/Twitter in-app uses "Twitter" in UA
  const isLI = /LinkedInApp/i.test(ua);
  const isTG = /Telegram/i.test(ua);
  const isLine = /\bLine\//i.test(ua);
  const isPin = /Pinterest/i.test(ua);
  const isReddit = /Reddit/i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);

  const isInApp = isIG || isFB || isTT || isSN || isX || isLI || isTG || isLine || isPin || isReddit || isWeChat;

  return {
    isInApp,
    isIG, isFB, isTT, isSN, isX, isLI, isTG, isLine, isPin, isReddit, isWeChat,
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isAndroid: /Android/i.test(ua),
    appName: isIG ? 'Instagram' : isFB ? 'Facebook' : isTT ? 'TikTok'
      : isSN ? 'Snapchat' : isX ? 'X' : isLI ? 'LinkedIn' : isTG ? 'Telegram'
      : isLine ? 'Line' : isPin ? 'Pinterest' : isReddit ? 'Reddit'
      : isWeChat ? 'WeChat' : null,
  };
}

/**
 * Navigate to URL, breaking out of in-app browser if needed.
 *
 * Strategy per platform:
 * - Native browser → <a target="_blank"> click (clean, no redirect)
 * - Android in-app → intent:// with action VIEW (opens default browser, not just Chrome)
 * - iOS 17.4+ in-app → x-safari-https:// scheme
 * - iOS < 17.4 in-app → auto-copy + floating toast with instructions
 * - Unknown in-app → direct navigation with copy fallback
 */
export function deeplinkNavigate(url: string): boolean {
  // Special schemes — never bypass, always direct
  if (/^(tel:|mailto:|sms:|facetime:|geo:|maps:)/i.test(url)) {
    window.location.href = url;
    return true;
  }

  // Dangerous schemes — block entirely
  if (/^(javascript:|data:|vbscript:|blob:)/i.test(url)) {
    console.warn('[deeplink] blocked dangerous URL scheme:', url);
    return false;
  }

  // Ensure URL has a protocol
  const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  const b = detectBrowser();

  // ── Native browser → open in new tab ──
  if (!b.isInApp) {
    const a = document.createElement('a');
    a.href = safeUrl;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  // ── Android in-app → intent:// ──
  if (b.isAndroid) {
    const parsed = parseUrl(safeUrl);
    // Use action VIEW without package — opens default browser (Chrome, Samsung, Firefox, etc.)
    // S.browser_fallback_url ensures the URL opens even if intent fails
    const intentUrl = `intent://${parsed.hostAndPath}#Intent;scheme=${parsed.scheme};action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(safeUrl)};end`;
    window.location.href = intentUrl;

    // Fallback: if intent doesn't trigger after 1.5s, try direct
    setTimeout(() => {
      window.location.href = safeUrl;
    }, 1500);
    return true;
  }

  // ── iOS in-app → multi-strategy ──
  if (b.isIOS) {
    // Strategy 1: x-safari-https scheme (iOS 17.4+, works in IG/FB/TT)
    if (safeUrl.startsWith('https://')) {
      const safariUrl = safeUrl.replace(/^https:\/\//, 'x-safari-https://');
      window.location.href = safariUrl;
    } else if (safeUrl.startsWith('http://')) {
      const safariUrl = safeUrl.replace(/^http:\/\//, 'x-safari-http://');
      window.location.href = safariUrl;
    }

    // Strategy 2: after 1s, if still here (older iOS or scheme blocked) → copy + toast
    setTimeout(() => {
      copyToClipboard(safeUrl).then(copied => {
        showCopyToast(safeUrl, b.appName, copied);
      });
    }, 1000);

    return true;
  }

  // ── Unknown platform in-app → direct + copy fallback ──
  window.location.href = safeUrl;
  setTimeout(() => {
    copyToClipboard(safeUrl).then(copied => {
      if (document.hasFocus()) { // Still on page = didn't navigate
        showCopyToast(safeUrl, b.appName, copied);
      }
    });
  }, 1200);
  return true;
}

// ── Helpers ──

function parseUrl(url: string): { scheme: string; hostAndPath: string } {
  try {
    const u = new URL(url);
    return {
      scheme: u.protocol.replace(':', ''),
      hostAndPath: url.replace(/^https?:\/\//, ''),
    };
  } catch {
    return { scheme: 'https', hostAndPath: url };
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Clipboard API (may be blocked in in-app browsers)
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}

  // Method 2: execCommand fallback (works in more in-app browsers)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Floating toast with copy status and clear instructions.
 * Honest about whether copy succeeded.
 */
function showCopyToast(url: string, appName: string | null, copied: boolean) {
  if (document.getElementById('deeplink-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'deeplink-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;left:16px;right:16px;z-index:99999;
    background:#111;color:#fff;border-radius:20px;padding:18px 20px;
    display:flex;flex-direction:column;gap:10px;
    box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.06);
    animation:deeplink-slide-up 0.35s cubic-bezier(0.16,1,0.3,1);
    font-family:-apple-system,system-ui,'Public Sans',sans-serif;
    max-width:400px;margin:0 auto;
  `;

  const appLabel = appName || 'Cette app';
  const icon = copied ? '📋' : '🔗';
  const title = copied ? 'Lien copié' : 'Ouvre dans Safari';
  const subtitle = `${appLabel} bloque l'ouverture directe`;
  const instruction = copied
    ? 'Colle le lien dans Safari ou ton navigateur'
    : 'Copie ce lien et ouvre-le dans Safari';

  toast.innerHTML = `
    <style>
      @keyframes deeplink-slide-up{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}
      #deeplink-toast button{-webkit-tap-highlight-color:transparent}
    </style>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:22px;line-height:1">${icon}</span>
      <div style="flex:1;min-width:0">
        <p style="font-weight:700;font-size:15px;margin:0;letter-spacing:-0.01em">${title}</p>
        <p style="font-size:12px;color:rgba(255,255,255,0.4);margin:3px 0 0">${subtitle}</p>
      </div>
    </div>
    <p style="font-size:13px;color:rgba(255,255,255,0.55);margin:0;line-height:1.4">${instruction}</p>
    <div style="display:flex;gap:8px">
      ${!copied ? `
        <button id="deeplink-copy-btn" style="flex:1;background:#fff;color:#000;border:none;border-radius:12px;padding:12px;font-weight:600;font-size:14px;cursor:pointer">
          Copier le lien
        </button>
      ` : `
        <button id="deeplink-open-btn" style="flex:1;background:#fff;color:#000;border:none;border-radius:12px;padding:12px;font-weight:600;font-size:14px;cursor:pointer">
          J'ai compris ✓
        </button>
      `}
      <button id="deeplink-dismiss" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);border:none;border-radius:12px;padding:12px 16px;font-size:13px;cursor:pointer">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // Copy button (shown when auto-copy failed)
  document.getElementById('deeplink-copy-btn')?.addEventListener('click', async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      const btn = document.getElementById('deeplink-copy-btn');
      if (btn) {
        btn.textContent = 'Copié ✓';
        btn.style.background = '#22c55e';
        btn.style.color = '#fff';
      }
    }
  });

  // Dismiss buttons
  document.getElementById('deeplink-open-btn')?.addEventListener('click', () => toast.remove());
  document.getElementById('deeplink-dismiss')?.addEventListener('click', () => toast.remove());

  // Auto-dismiss after 10s
  setTimeout(() => toast.remove(), 10000);
}
