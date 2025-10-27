

document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'theme';
  const btn = document.getElementById('themeToggle');
  const darkCard = document.querySelector('.dark-card');

  if (!btn) {
    console.warn('toggle-theme: no se encontró #themeToggle');
    return;
  }

  // Aplica o quita la clase 'dark' en <body>
  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    btn.setAttribute('aria-pressed', String(isDark));
    btn.title = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    // aria-hidden debe ser "true"/"false" (string)
    if (darkCard) darkCard.setAttribute('aria-hidden', isDark ? 'false' : 'true');
    console.log('toggle-theme: applyTheme ->', isDark ? 'dark' : 'light');
  }

  // Inicial: leer guardado o preferencia del sistema
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved === 'dark');
    console.log('toggle-theme: preferencia guardada:', saved);
  } else {
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemDark);
    console.log('toggle-theme: preferencia sistema:', systemDark ? 'dark' : 'light');
  }

  // Clase temporal para transiciones suaves
  function flashTransition() {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }

  // Toggle simple al click
  btn.addEventListener('click', function () {
    const isNowDark = !document.body.classList.contains('dark');
    flashTransition();
    applyTheme(isNowDark);
    try {
      localStorage.setItem(STORAGE_KEY, isNowDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('toggle-theme: LocalStorage no disponible', e);
    }
  });
});