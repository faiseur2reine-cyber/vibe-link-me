// src/lib/clipboard.ts
// Safe clipboard write — never throws, works in insecure contexts

export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Clipboard API
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}

  // Method 2: execCommand fallback (insecure contexts, some webviews)
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
