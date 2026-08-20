export const THEME_STORAGE_KEY = "lead-finder:theme";

/**
 * Runs synchronously in <head> so `data-theme` is on <html> before first paint.
 * Light is the product default; an explicit stored choice may switch it.
 *
 * Lives outside the "use client" boundary: values exported from a client module
 * become client references and cannot be read while rendering on the server.
 */
export const themeBootstrapScript = `
(function () {
  var mode = 'light';
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'light' || stored === 'dark') mode = stored;
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', mode);
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.style.colorScheme = mode;
})();
`;
