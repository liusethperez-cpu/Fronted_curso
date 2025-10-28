// landing.js - Tema + contador de likes + envío de formulario simple
document.addEventListener('DOMContentLoaded', function () {
  /* ---------------------------
     THEME TOGGLE (guardado en localStorage)
     --------------------------- */
  const STORAGE_KEY = 'theme';
  const btn = document.getElementById('themeToggle');
  const darkCard = document.querySelector('.dark-card');

  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
    if (btn) btn.title = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    if (darkCard) darkCard.setAttribute('aria-hidden', isDark ? 'false' : 'true');
  }

  // inicial
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved === 'dark');
    } else {
      const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark);
    }
  } catch (e) {
    // si localStorage está bloqueado, simplemente aplicar preferencia de sistema
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemDark);
  }

  function flashTransition() {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
  }

  if (btn) {
    btn.addEventListener('click', function () {
      const isNowDark = !document.body.classList.contains('dark');
      flashTransition();
      applyTheme(isNowDark);
      try {
        localStorage.setItem(STORAGE_KEY, isNowDark ? 'dark' : 'light');
      } catch (e) { /* ignore */ }
    });
  }

  /* ---------------------------
     LIKE BUTTONS (almacena contador en localStorage)
     --------------------------- */
  var likeButtons = document.querySelectorAll('.like-btn');
  likeButtons.forEach(function (btn) {
    var actions = btn.closest('.video-actions');
    if (!actions) return;
    var countEl = actions.querySelector('.like-count');
    if (!countEl) return;
    var id = btn.dataset.videoId || 'default';
    var countKey = 'likes_count_' + id;
    var stateKey = 'likes_state_' + id;

    var count = parseInt(localStorage.getItem(countKey), 10);
    if (isNaN(count)) count = parseInt(countEl.textContent, 10) || 0;
    var liked = localStorage.getItem(stateKey) === 'true';

    updateUI();

    btn.addEventListener('click', function () {
      liked = !liked;
      count = liked ? count + 1 : Math.max(0, count - 1);
      try {
        localStorage.setItem(countKey, String(count));
        localStorage.setItem(stateKey, String(liked));
      } catch (e) { /* localStorage no disponible */ }
      updateUI();
    });

    function updateUI() {
      countEl.textContent = String(count);
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      var textSpan = btn.querySelector('.like-text');
      if (textSpan) textSpan.textContent = liked ? '¡Gracias!' : 'Me gusta';
      btn.classList.toggle('liked', liked);
    }
  });

  /* ---------------------------
     CONTACT FORM (simulación sencilla)
     --------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Validaciones muy simples
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      if (!name || !email || !message) {
        if (status) status.textContent = 'Por favor completa todos los campos.';
        return;
      }
      // Simular "envío"
      if (status) status.textContent = 'Enviando...';
      setTimeout(function () {
        if (status) status.textContent = 'Mensaje enviado. ¡Gracias! (simulación)';
        form.reset();
      }, 700);
    });
  }
});