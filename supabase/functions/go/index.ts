import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// In-app browser redirect page
// Instead of client-side JS tricks (which Instagram blocks),
// this serves raw HTML with every known breakout technique.
// Called as: /functions/v1/go?url=https://onlyfans.com/...

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Validate URL
  let safeTarget: string;
  try {
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response("Invalid protocol", { status: 400 });
    }
    safeTarget = parsed.href;
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const ua = req.headers.get("user-agent") || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isInApp = /Instagram|FBAN|FBAV|TikTok|BytedanceWebview|Snapchat|Twitter|LinkedInApp|Telegram|Line\/|Pinterest|Reddit|MicroMessenger/i.test(ua);

  // Not in-app browser → direct 302 redirect
  if (!isInApp) {
    return new Response(null, {
      status: 302,
      headers: { "Location": safeTarget, "Cache-Control": "no-store" },
    });
  }

  // Android intent URL
  const stripped = safeTarget.replace(/^https?:\/\//, "");
  const scheme = safeTarget.startsWith("https") ? "https" : "http";
  const intentUrl = `intent://${stripped}#Intent;scheme=${scheme};action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(safeTarget)};end`;

  // iOS Safari scheme
  const safariUrl = safeTarget.startsWith("https://")
    ? safeTarget.replace(/^https:\/\//, "x-safari-https://")
    : safeTarget.replace(/^http:\/\//, "x-safari-http://");

  // Serve aggressive breakout HTML
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redirecting...</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    background:#0a0a0a; color:#fff;
    font-family:-apple-system,system-ui,sans-serif;
    min-height:100vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center; padding:24px;
    text-align:center;
  }
  .spinner {
    width:32px; height:32px; border:3px solid rgba(255,255,255,0.1);
    border-top-color:#fff; border-radius:50%;
    animation:spin 0.8s linear infinite; margin-bottom:24px;
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  h1 { font-size:18px; font-weight:700; margin-bottom:8px; }
  p { font-size:14px; color:rgba(255,255,255,0.5); margin-bottom:32px; line-height:1.5; }
  .btn {
    display:block; width:100%; max-width:320px;
    background:#fff; color:#000; border:none; border-radius:14px;
    padding:18px 24px; font-size:17px; font-weight:700;
    cursor:pointer; -webkit-tap-highlight-color:transparent;
    text-decoration:none; text-align:center;
  }
  .btn:active { transform:scale(0.97); }
  .hint {
    margin-top:16px; font-size:12px; color:rgba(255,255,255,0.25);
    line-height:1.5;
  }
  .hidden { display:none; }
</style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <h1>Ouverture en cours...</h1>
    <p>Redirection vers ton navigateur</p>
  </div>

  <div id="fallback" class="hidden">
    <h1>Ouvre dans ton navigateur</h1>
    <p>Appuie sur le bouton pour continuer</p>
    <a id="manual-btn" class="btn" href="${safeTarget}">
      Ouvrir dans le navigateur
    </a>
    <p class="hint">
      Ou appuie sur <strong>⋯</strong> en haut puis <strong>Ouvrir dans le navigateur</strong>
    </p>
  </div>

<script>
(function(){
  var target = ${JSON.stringify(safeTarget)};
  var isAndroid = ${isAndroid};
  var isIOS = ${isIOS};
  var tried = 0;

  function tryBreakout() {
    tried++;

    // Android: intent://
    if (isAndroid) {
      window.location.href = ${JSON.stringify(intentUrl)};
      setTimeout(function() {
        // If still here, try direct
        window.location.href = target;
      }, 1500);
      setTimeout(showFallback, 3000);
      return;
    }

    // iOS: multiple strategies
    if (isIOS) {
      // Strategy 1: x-safari scheme
      window.location.href = ${JSON.stringify(safariUrl)};

      // Strategy 2: after 1s, try window.open
      setTimeout(function() {
        if (!document.hasFocus || document.hasFocus()) {
          try { window.open(target, '_blank'); } catch(e) {}
        }
      }, 1000);

      // Strategy 3: after 2s, try direct
      setTimeout(function() {
        if (!document.hasFocus || document.hasFocus()) {
          window.location.href = target;
        }
      }, 2000);

      // Strategy 4: after 3s, show manual button
      setTimeout(showFallback, 3000);
      return;
    }

    // Unknown: direct + fallback
    window.location.href = target;
    setTimeout(showFallback, 2000);
  }

  function showFallback() {
    if (!document.hasFocus || document.hasFocus()) {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('fallback').classList.remove('hidden');

      // Manual button: try intent/safari on click
      var btn = document.getElementById('manual-btn');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (isAndroid) {
          window.location.href = ${JSON.stringify(intentUrl)};
          setTimeout(function() { window.location.href = target; }, 1000);
        } else if (isIOS) {
          window.location.href = ${JSON.stringify(safariUrl)};
          setTimeout(function() { window.location.href = target; }, 1000);
        } else {
          window.location.href = target;
        }
      });
    }
  }

  // Fire immediately
  tryBreakout();
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
});
