// v2-personal.js - Interactividad mejorada y correcciones
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elements
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  const secretToggle = document.getElementById('secret-toggle');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const likeBtn = document.getElementById('like-btn');
  const likeCountEl = document.getElementById('like-count');
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  // Mobile nav toggle (toggling class instead of inline styles)
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
      // Animation of hamburger
      navToggle.querySelector('.hamburger')?.animate(
        expanded ? [{ transform: 'rotate(90deg)' }, { transform: 'rotate(0)' }] : [{ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' }],
        { duration: 180, fill: 'forwards' }
      );
    });

    // Close nav with Escape for accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // Secret toggle (místico) -> toggles body.dark and persists
  const body = document.body;
  const SECRET_KEY = 'portfolio_mystic_mode_v1';
  try {
    if (localStorage.getItem(SECRET_KEY) === '1') {
      body.classList.add('dark');
      if (secretToggle) secretToggle.setAttribute('aria-pressed', 'true');
    }
  } catch (err) {
    // ignore if storage not available
  }

  if (secretToggle) {
    secretToggle.addEventListener('click', () => {
      const enabled = body.classList.toggle('dark');
      secretToggle.setAttribute('aria-pressed', String(enabled));
      try {
        localStorage.setItem(SECRET_KEY, enabled ? '1' : '0');
      } catch (err) { /* ignore */ }
      secretToggle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 250 });
    });
  }

  // Modal helpers
  function openModal({src, title, desc}) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    if (modalImg) { modalImg.src = src || ''; modalImg.alt = title || ''; }
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalDesc) modalDesc.textContent = desc || '';
    document.body.style.overflow = 'hidden';
    // Move focus to close button
    modalClose?.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    if (modalImg) modalImg.src = '';
    document.body.style.overflow = '';
  }

  // Projects: open modal unless the click was on a link (so links navigate to folder)
  document.querySelectorAll('.project').forEach(proj => {
    proj.addEventListener('click', (e) => {
      // If the click originated inside an anchor (<a>), allow navigation
      if (e.target.closest('a')) return;
      const src = proj.getAttribute('data-src') || proj.querySelector('img')?.src || '';
      const title = proj.getAttribute('data-title') || proj.querySelector('.project-info h4')?.textContent || '';
      const desc = proj.getAttribute('data-desc') || proj.querySelector('.project-info p')?.textContent || '';
      openModal({src, title, desc});
    });

    proj.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // mimic click but avoid opening if focused element is a link
        if (document.activeElement && document.activeElement.tagName.toLowerCase() === 'a') return;
        proj.click();
      }
    });
  });

  // Cert botones (si existen)
  document.querySelectorAll('.view-cert').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cert');
      const certMap = {
        'google-ads': { src: 'https://images.unsplash.com/photo-1581092580490-3df4c3a8d7f9?q=80&w=1200&auto=format&fit=crop', title: 'Cert. Google Ads', desc: 'Certificado oficial de Google Ads.' },
        'analytics': { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop', title: 'Cert. Analytics', desc: 'Certificado de analítica y GA4.' },
        'astro-1': { src: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1200&auto=format&fit=crop', title: 'Cert. Astrología Creativa', desc: 'Certificado oculto (modo místico).' },
        'astro-2': { src: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1200&auto=format&fit=crop', title: 'Cert. Cartografía Astral', desc: 'Certificado oculto (modo místico).' },
      };
      openModal(certMap[id] || {src:'', title:'Certificado', desc:''});
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // Focus trap minimal (keep focus inside modal)
  document.addEventListener('focusin', (e) => {
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      if (!modal.contains(e.target)) {
        e.preventDefault();
        modalClose?.focus();
      }
    }
  });

  // Like counter (persistente)
  const LIKE_KEY = 'video_like_count_v1';
  let likes = 0;
  try {
    likes = parseInt(localStorage.getItem(LIKE_KEY) || '0', 10);
    if (isNaN(likes)) likes = 0;
  } catch (err) { likes = 0; }
  if (likeCountEl) likeCountEl.textContent = String(likes);
  if (likeBtn) {
    likeBtn.setAttribute('aria-pressed', likes > 0 ? 'true' : 'false');
    likeBtn.addEventListener('click', () => {
      likes++;
      try { localStorage.setItem(LIKE_KEY, String(likes)); } catch (err) { /* ignore */ }
      if (likeCountEl) likeCountEl.textContent = String(likes);
      likeBtn.setAttribute('aria-pressed', 'true');
      likeBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220 });
    });
  }

  // Contact form submit (simulado)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!formStatus) return;
      const nameInp = document.getElementById('name');
      const emailInp = document.getElementById('email');
      const messageInp = document.getElementById('message');
      const name = nameInp ? nameInp.value.trim() : '';
      const email = emailInp ? emailInp.value.trim() : '';
      const message = messageInp ? messageInp.value.trim() : '';

      if (!name || !email || !message) {
        formStatus.textContent = 'Por favor completa todos los campos.';
        return;
      }
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) {
        formStatus.textContent = 'Por favor ingresa un correo válido.';
        return;
      }
      formStatus.textContent = 'Enviando...';
      setTimeout(() => {
        formStatus.textContent = '¡Mensaje enviado! Te responderé pronto.';
        form.reset();
      }, 900);
    });
  }

  // Reveal on scroll (intersection observer)
  const ro = new IntersectionObserver((entries, observer) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('in-view');
        observer.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.section-title, .card, .project, .hero-copy').forEach(el => {
    el.setAttribute('data-reveal', '');
    ro.observe(el);
  });

  // Done initializing
  // (console logs removed for production readiness)
});