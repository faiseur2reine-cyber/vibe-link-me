// Preload lazy-loaded dashboard routes
// 1. On hover/touch: preload targeted route (instant feel)
// 2. On idle: preload ALL routes in background (zero flash ever)

const preloaders: Record<string, () => Promise<unknown>> = {
  '/dashboard/analytics': () => import('@/pages/DashboardAnalytics'),
  '/dashboard/profile': () => import('@/pages/DashboardProfile'),
  '/dashboard/settings': () => import('@/pages/DashboardSettings'),
  '/dashboard/affiliate': () => import('@/pages/DashboardAffiliate'),
};

const loaded = new Set<string>();

export function preloadRoute(path: string) {
  if (loaded.has(path)) return;
  const loader = preloaders[path];
  if (loader) { loaded.add(path); loader(); }
}

// Preload everything when browser is idle — called once from Dashboard mount
export function preloadAllOnIdle() {
  const load = () => {
    Object.entries(preloaders).forEach(([path, loader]) => {
      if (!loaded.has(path)) { loaded.add(path); loader(); }
    });
  };
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(load, { timeout: 3000 });
  } else {
    setTimeout(load, 2000);
  }
}
