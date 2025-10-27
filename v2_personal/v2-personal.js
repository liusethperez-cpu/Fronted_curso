// script.js - correcciones hechas y persistencia de modo oscuro
document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js cargado');

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        nav.style.display = 'block';
        navToggle.querySelector('.hamburger').style.transform = 'rotate(90deg)';
      } else {
        nav.style.display = '';
        navToggle.querySelector('.hamburger').style.transform = '';
      }
    });
  }

  // Secret toggle (místico) -> toggles body.dark and persists
  const secretToggle = document.getElementById('secret-toggle');
  const body = document.body;
  const SECRET_KEY = 'portfolio_mystic_mode_v1';
  try {
    if (localStorage.getItem(SECRET_KEY) === '1') {
      body.classList.add('dark');
      if (secretToggle) secretToggle.setAttribute('aria-pressed', 'true');
    }
  } catch (err) {
    console.warn('localStorage no accesible para secret mode', err);
  }

  if (secretToggle) {
    secretToggle.addEventListener('click', () => {
      const enabled = body.classList.toggle('dark');
      secretToggle.setAttribute('aria-pressed', String(enabled));
      try {
        localStorage.setItem(SECRET_KEY, enabled ? '1' : '0');
      } catch (err) {
        console.warn('no se pudo guardar secret mode en localStorage', err);
      }
      secretToggle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 250 });
    });
  }

  // Modal (projects & certs)
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');

  function openModal({src, title, desc}) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    if (modalImg) { modalImg.src = src || ''; modalImg.alt = title || ''; }
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalDesc) modalDesc.textContent = desc || '';
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    if (modalImg) modalImg.src = '';
    document.body.style.overflow = '';
  }

  // Open project modal
  document.querySelectorAll('.project').forEach(proj => {
    proj.addEventListener('click', () => {
      const src = proj.getAttribute('data-src') || proj.querySelector('img')?.src || '';
      const title = proj.getAttribute('data-title') || '';
      const desc = proj.getAttribute('data-desc') || '';
      openModal({src, title, desc});
    });
    proj.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proj.click();
    });
  });

  // Cert buttons
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

  // Video like counter
  const likeBtn = document.getElementById('like-btn');
  const likeCountEl = document.getElementById('like-count');
  const LIKE_KEY = 'video_like_count_v1';
  let likes = 0;
  try {
    likes = parseInt(localStorage.getItem(LIKE_KEY) || '0', 10);
    if (isNaN(likes)) likes = 0;
  } catch (err) { likes = 0; }
  if (likeCountEl) likeCountEl.textContent = String(likes);

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likes++;
      try { localStorage.setItem(LIKE_KEY, String(likes)); } catch (err) { console.warn('localStorage no disponible para likes'); }
      if (likeCountEl) likeCountEl.textContent = String(likes);
      likeBtn.setAttribute('aria-pressed', 'true');
      likeBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220 });
    });
  }

  // Contact form submit
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
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

  // Reveal on scroll (simple)
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('in-view');
        ro.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.section-title, .card, .project, .hero-copy').forEach(el => {
    el.setAttribute('data-reveal', '');
    ro.observe(el);
  });

  // focus trap basic
  document.addEventListener('focusin', (e) => {
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      if (!modal.contains(e.target)) {
        e.preventDefault();
        modalClose?.focus();
      }
    }
  });

  console.log('Interactividad inicializada');
});