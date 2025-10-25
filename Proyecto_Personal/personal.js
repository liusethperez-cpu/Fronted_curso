
document.addEventListener('DOMContentLoaded', () => {

  // --- DATA DE PROYECTOS ---
  const projects = [
    {
      emoji: '🛍️',
      title: 'Campaña E-commerce Moda',
      description: 'Estrategia digital completa para una marca de moda, enfocada en aumentar la visibilidad y las ventas online. Se implementaron campañas de SEO, SEM y redes sociales, logrando un notable incremento en ventas.'
    },
    {
      emoji: '💻',
      title: 'Portfolio Responsivo',
      description: 'Desarrollo de un portfolio personal desde cero utilizando HTML, CSS y JavaScript. El diseño es completamente responsivo, asegurando una experiencia de usuario óptima en cualquier dispositivo, desde móviles a ordenadores de escritorio.'
    },
    {
      emoji: '📱',
      title: 'Estrategia Social Media',
      description: 'Gestión integral de redes sociales para varias marcas. Creación de calendarios de contenido, community management y análisis de métricas para optimizar el engagement y el crecimiento de la comunidad online.'
    },
    {
      emoji: '🌐',
      title: 'App de Gestión de Tareas',
      description: 'Aplicación web simple para gestionar tareas diarias. Permite a los usuarios añadir, eliminar y marcar tareas como completadas. Desarrollada con JavaScript para practicar la manipulación del DOM y el estado local.'
    }
  ];

  // --- CAMBIO DE TEMA (CLARO/OSCURO) ---
  const themeToggle = document.getElementById('themeToggle');
  const secretCard = document.getElementById('secretCard');
  const closeSecret = document.getElementById('closeSecret');
  const htmlEl = document.documentElement;

  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') {
    secretCard.classList.add('visible');
  }

  themeToggle.addEventListener('click', () => {
    const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Mostrar/ocultar tarjeta secreta
    if (newTheme === 'dark') {
      secretCard.classList.add('visible');
    } else {
      secretCard.classList.remove('visible');
    }
  });
  
  closeSecret.addEventListener('click', () => {
      secretCard.classList.remove('visible');
  });


  // --- ANIMACIÓN FADE-IN EN SCROLL ---
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));


  // --- FILTRO DE PROYECTOS ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;

      projectItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });


  // --- LIGHTBOX MODAL DE PROYECTOS ---
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDescription = document.getElementById('lightboxDescription');

  projectItems.forEach(item => {
    item.addEventListener('click', () => {
      const projectIndex = item.dataset.index;
      const projectData = projects[projectIndex];

      lightboxImage.innerText = projectData.emoji;
      lightboxTitle.innerText = projectData.title;
      lightboxDescription.innerText = projectData.description;

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });


  // --- BLOG CON LOCALSTORAGE ---
  const postForm = document.getElementById('postForm');
  const postsList = document.getElementById('postsList');
  const clearPostsBtn = document.getElementById('clearPosts');
  const formMessage = document.getElementById('formMessage');

  let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

  const renderPosts = () => {
    postsList.innerHTML = '';
    if (posts.length === 0) {
        postsList.innerHTML = '<p class="muted">Aún no hay publicaciones. ¡Crea la primera!</p>';
        return;
    }
    posts.forEach(post => {
      const postEl = document.createElement('article');
      postEl.classList.add('blog-post');
      postEl.innerHTML = `
        <h4>${post.title}</h4>
        <p class="post-meta">${post.category}</p>
        <p>${post.content}</p>
      `;
      postsList.appendChild(postEl);
    });
  };

  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const content = e.target.content.value.trim();
    const category = e.target.category.value;

    if (!title || !content) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const newPost = { title, content, category, date: new Date().toISOString() };
    posts.unshift(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    renderPosts();
    postForm.reset();
    
    formMessage.textContent = '¡Publicación creada con éxito!';
    formMessage.classList.add('visible');
    setTimeout(() => {
        formMessage.classList.remove('visible');
    }, 3000);
  });
  
  clearPostsBtn.addEventListener('click', () => {
      if(confirm('¿Seguro que quieres borrar todas las publicaciones? Esta acción no se puede deshacer.')) {
          posts = [];
          localStorage.removeItem('blogPosts');
          renderPosts();
      }
  });

  // Renderizar posts al cargar la página
  renderPosts();
  
  // --- ACTUALIZAR AÑO EN FOOTER ---
  document.getElementById('year').textContent = new Date().getFullYear();

});