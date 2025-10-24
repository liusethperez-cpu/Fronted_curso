
document.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const navLinks = document.querySelectorAll('nav a');
  const fadeEls = document.querySelectorAll('.fade-in');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lbImage = document.getElementById('lightboxImage');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbDesc = document.getElementById('lightboxDescription');

  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const secretCard = document.getElementById('secretCard');
  const closeSecretBtn = document.getElementById('closeSecret');

  const postsListEl = document.getElementById('postsList');
  const postForm = document.getElementById('postForm');
  const clearPostsBtn = document.getElementById('clearPosts');
  const formMsg = document.getElementById('formMessage');

  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));

  // projects filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectItems.forEach(item => {
        const cat = item.dataset.category;
        item.style.display = (filter === 'all' || filter === cat) ? 'block' : 'none';
      });
    });
  });

  // lightbox
  const projects = [
    { emoji: '🛍️', title: 'Campaña E-commerce Moda', description: 'Estrategia digital, SEO y campañas pagas para aumentar ventas.' },
    { emoji: '💻', title: 'Portfolio Responsivo', description: 'Diseño y desarrollo del portfolio, mobile first.' },
    { emoji: '📱', title: 'Estrategia Social Media', description: 'Calendarios, contenido y análisis de métricas.' },
    { emoji: '🌐', title: 'App de Gestión de Tareas', description: 'App simple para seguimiento de tareas con JS vanilla.' }
  ];
  projectItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(projects[parseInt(item.dataset.index,10)]));
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(projects[parseInt(item.dataset.index,10)]); });
  });
  function openLightbox(data){
    lbImage.innerText = data.emoji;
    lbTitle.innerText = data.title;
    lbDesc.innerText = data.description;
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox(); });

  // THEME toggle + SECRET: persist in localStorage, reveal/hide secret with class
  const THEME_KEY = 'portfolio_theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    if (secretCard) secretCard.classList.add('visible-secret');
  }
  updateThemeButton();

  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateThemeButton();
    if (isDark) revealSecret();
    else hideSecret();
    // ensure control is still reachable: focus the toggle (accessibility)
    try { themeToggle.focus(); } catch(e){}
  });

  function updateThemeButton(){
    const pressed = body.classList.contains('dark-theme');
    themeToggle.setAttribute('aria-pressed', String(pressed));
    themeToggle.title = pressed ? 'Tema: Oscuro (clic para claro)' : 'Tema: Claro (clic para oscuro)';
  }

  let secretTimeout = null;
  function revealSecret(){
    if (!secretCard) return;
    secretCard.setAttribute('aria-hidden','false');
    secretCard.classList.add('visible-secret');
    if (secretTimeout) clearTimeout(secretTimeout);
    secretTimeout = setTimeout(() => {
      // auto-hide after some seconds but only if user didn't switch theme back
      if (!body.classList.contains('dark-theme')) { hideSecret(); return; }
      hideSecret(); // still hide after 12s even if dark
    }, 12000);
  }
  function hideSecret(){
    if (!secretCard) return;
    secretCard.setAttribute('aria-hidden','true');
    secretCard.classList.remove('visible-secret');
    if (secretTimeout) { clearTimeout(secretTimeout); secretTimeout = null; }
  }
  if (closeSecretBtn) closeSecretBtn.addEventListener('click', hideSecret);

  document.addEventListener('click', (e) => {
    if (!secretCard) return;
    // if secret is visible and click outside it (and not on toggle), hide
    if (secretCard.classList.contains('visible-secret')) {
      if (!secretCard.contains(e.target) && e.target !== themeToggle) {
        hideSecret();
      }
    }
  });

  // BLOG (localStorage)
  const POSTS_KEY = 'portfolio_posts';
  function loadPosts(){ try { const raw = localStorage.getItem(POSTS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
  function savePosts(posts){ localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); }

  function renderPosts(){
    const posts = loadPosts();
    postsListEl.innerHTML = '';
    if (!posts.length) { postsListEl.innerHTML = `<p class="muted">Aún no hay publicaciones. Usa el formulario para crear la primera.</p>`; return; }
    posts.slice().reverse().forEach((post) => {
      const card = document.createElement('article');
      card.className = 'post-card enter';
      card.setAttribute('tabindex','0');

      const meta = document.createElement('div');
      meta.className = 'post-meta';
      meta.innerHTML = `<span>${new Date(post.date).toLocaleString()}</span><span class="muted">${post.category}</span>`;

      const title = document.createElement('h4'); title.className = 'post-title'; title.textContent = post.title;
      const content = document.createElement('div'); content.className = 'post-content'; content.textContent = post.content;
      const actions = document.createElement('div'); actions.style.marginTop = '10px';
      const deleteBtn = document.createElement('button'); deleteBtn.className = 'btn ghost'; deleteBtn.textContent = 'Eliminar';
      deleteBtn.addEventListener('click', () => { if (!confirm('¿Eliminar esta publicación?')) return; deletePost(post.id); });

      actions.appendChild(deleteBtn);
      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(content);
      card.appendChild(actions);
      postsListEl.appendChild(card);
    });
  }

  function addPost({ title, content, category }){
    const posts = loadPosts();
    const newPost = { id: Date.now().toString(), title: title.trim(), content: content.trim(), category: category || 'general', date: new Date().toISOString() };
    posts.push(newPost);
    savePosts(posts);
    renderPosts();
    showFormMessage('Publicación creada ✔', true);
  }

  function deletePost(id){
    const posts = loadPosts().filter(p => p.id !== id);
    savePosts(posts);
    renderPosts();
    showFormMessage('Publicación eliminada', true);
  }

  function clearAllPosts(){
    if (!confirm('¿Eliminar todas las publicaciones? Esta acción no se puede deshacer.')) return;
    localStorage.removeItem(POSTS_KEY);
    renderPosts();
    showFormMessage('Todas las publicaciones fueron eliminadas', true);
  }

  function showFormMessage(text, success = true){
    formMsg.textContent = text;
    formMsg.style.color = success ? 'var(--accent-2)' : 'crimson';
    formMsg.setAttribute('aria-hidden','false');
    setTimeout(()=> { formMsg.textContent = ''; formMsg.setAttribute('aria-hidden','true'); }, 3500);
  }

  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    if (!title.trim() || !content.trim()) { showFormMessage('Completa título y contenido.', false); return; }
    addPost({ title, content, category });
    postForm.reset();
  });

  if (clearPostsBtn) clearPostsBtn.addEventListener('click', clearAllPosts);

  renderPosts();

  // Accessibility: only show focus outlines when using Tab
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('user-is-tabbing'); });
});
document.addEventListener('mousedown', () => { document.body.classList.remove('user-is-tabbing'); });