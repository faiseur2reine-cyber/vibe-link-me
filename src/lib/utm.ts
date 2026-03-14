// src/lib/utm.ts
// ═══ UTM PARAM BUILDER ═══
// Appends UTM parameters to outbound link URLs.

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
}

export function buildUtmString(params: UtmParams): string {
  const parts: string[] = [];
  if (params.source) parts.push(`utm_source=${encodeURIComponent(params.source)}`);
  if (params.medium) parts.push(`utm_medium=${encodeURIComponent(params.medium)}`);
  if (params.campaign) parts.push(`utm_campaign=${encodeURIComponent(params.campaign)}`);
  return parts.join('&');
}

export function appendUtm(url: string, params: UtmParams): string {
  const utmStr = buildUtmString(params);
  if (!utmStr) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${utmStr}`;
}
