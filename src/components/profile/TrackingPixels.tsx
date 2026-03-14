// src/components/profile/TrackingPixels.tsx
// ═══ TRACKING PIXEL INJECTION ═══
// Injects Meta Pixel, GA4, TikTok Pixel into the page head.
// Also exports trackClick() to fire conversion events on link clicks.

import { Helmet } from 'react-helmet-async';

interface TrackingConfig {
  metaPixel?: string | null;
  ga4?: string | null;
  tiktokPixel?: string | null;
}

export function TrackingPixels({ metaPixel, ga4, tiktokPixel }: TrackingConfig) {
  const scripts: string[] = [];

  if (metaPixel) {
    scripts.push(`
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${metaPixel}');fbq('track','PageView');
    `);
  }

  if (ga4) {
    scripts.push(`
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments)}
      gtag('js',new Date());gtag('config','${ga4}');
    `);
  }

  if (tiktokPixel) {
    scripts.push(`
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready",
      "alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)
      ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
      o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${tiktokPixel}');ttq.page()}(window,document,'ttq');
    `);
  }

  if (scripts.length === 0) return null;

  return (
    <Helmet>
      {ga4 && <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />}
      {scripts.map((s, i) => <script key={i}>{s}</script>)}
    </Helmet>
  );
}

/**
 * Fire conversion events on all configured pixels.
 * Call this when a user clicks a link.
 */
export function trackPixelClick(linkName: string, config: TrackingConfig) {
  try {
    if (config.metaPixel && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', { content_name: linkName });
    }
  } catch {}
  try {
    if (config.ga4 && (window as any).gtag) {
      (window as any).gtag('event', 'link_click', { link_name: linkName });
    }
  } catch {}
  try {
    if (config.tiktokPixel && (window as any).ttq) {
      (window as any).ttq.track('ClickButton', { content_name: linkName });
    }
  } catch {}
}
