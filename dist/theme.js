// Apply appearance before the page paints. Theme preferences never touch the ledger.
(() => {
  const key = 'biztrack.theme.v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  const read = () => {
    try {
      const value = localStorage.getItem(key);
      return value === 'light' || value === 'dark' ? value : null;
    } catch { return null; }
  };
  const apply = () => {
    const theme = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101827' : '#1557e8');
    document.dispatchEvent(new Event('biztrack-themechange'));
  };
  preference = read();
  apply();
  document.addEventListener('biztrack-theme-set', event => {
    if (event.detail !== 'light' && event.detail !== 'dark') return;
    preference = event.detail;
    apply();
    try { localStorage.setItem(key, preference); } catch { /* Keep the choice for this visit. */ }
  });
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = read();
    apply();
  });
})();
