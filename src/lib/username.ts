// src/lib/username.ts
// Shared username validation — used by landing, CreatePageDialog, onboarding

import { supabase } from '@/integrations/supabase/client';

// All routes that would conflict with /:username
const RESERVED_WORDS = new Set([
  'admin', 'api', 'app', 'auth', 'dashboard', 'legal', 'login',
  'onboarding', 'reset-password', 'safe', 'set-username', 'settings',
  'signup', 'support', 'help', 'about', 'pricing', 'blog', 'docs',
  'terms', 'privacy', 'contact', 'status', 'www', 'mail', 'ftp',
  'cdn', 'static', 'assets', 'images', 'media', 'public', 'private',
  'null', 'undefined', 'true', 'false', 'test', 'demo', 'example',
  'mytaptap', 'taptap', 'webhook', 'stripe', 'sitemap', 'robots',
  'favicon', '404', '500', 'error', 'health', 'ping',
]);

export function cleanUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

export function isReserved(username: string): boolean {
  return RESERVED_WORDS.has(username.toLowerCase());
}

export async function checkUsernameAvailability(
  username: string
): Promise<'available' | 'taken' | 'reserved'> {
  if (isReserved(username)) return 'reserved';

  // Check both tables — profiles (legacy) and creator_pages (new)
  const [profileRes, pageRes] = await Promise.all([
    supabase.from('profiles').select('username').eq('username', username).maybeSingle(),
    supabase.from('creator_pages').select('username').eq('username', username).maybeSingle(),
  ]);

  if (profileRes.data || pageRes.data) return 'taken';
  return 'available';
}
