
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ─────────────────────────────────────────────────────────────
     1. THEME TOGGLE — claro / oscuro (FAB fijo abajo-derecha)
  ───────────────────────────────────────────────────────────── */
  function initTheme() {
    const html = document.documentElement;
    const metaTheme = $('#meta-theme-color');
    const fab = $('#theme-toggle');

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(initial);

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#080808' : '#f8fafc');
      }
    }

    function toggle() {
      const current = html.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    if (fab) fab.addEventListener('click', toggle);
  }

  /* ─────────────────────────────────────────────────────────────
     2. NAVEGACIÓN — pill deslizante + hamburguesa móvil
  ───────────────────────────────────────────────────────────── */
  function initNav() {
    const pill = $('#nav-pill');
    const links = $$('.nav-link');
    const navLinks = $('#nav-menu');
    const toggle = $('#nav-toggle');

    const isMobile = () => window.innerWidth <= 640;

    if (!links.length) return;

    /* Desktop*/
    function movePill(el) {
      if (!pill || !el || isMobile()) return;
      const elRect = el.getBoundingClientRect();
      const navRect = navLinks.getBoundingClientRect();
      const offsetX = elRect.left - navRect.left;
      pill.style.width = `${elRect.width}px`;
      pill.style.height = `${elRect.height}px`;
      pill.style.transform = `translateX(${offsetX}px)`;
    }

    /* Init pill */
    if (!isMobile()) {
      const active = $('.nav-link.active');
      if (active) requestAnimationFrame(() => movePill(active));
    }

    /* Sección visible  */
    const sections = $$('section[id]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const match = $(`.nav-link[href="#${id}"]`);
          if (!match) return;
          links.forEach((l) => l.classList.remove('active'));
          match.classList.add('active');
          if (!isMobile()) movePill(match);
        }
      });
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0,
    });

    sections.forEach((s) => io.observe(s));

    /* Click en links → scroll suave + cerrar móvil */
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (isMobile() && toggle && navLinks) {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    /* Hamburguesa móvil */
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-capsule') && navLinks.classList.contains('active')) {
          toggle.classList.remove('active');
          navLinks.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    window.addEventListener('resize', () => {
      if (!isMobile()) movePill($('.nav-link.active'));
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     3. SCROLL REVEAL — solo en secciones (no en cada elemento)
  ───────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    if (prefersReducedMotion) {
      $$('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const elements = $$('.reveal');
    if (!elements.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach((el) => io.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────
     4. PROYECTOS CLICKEABLES — toda la fila abre el repositorio
  ───────────────────────────────────────────────────────────── */
  function initClickableProjects() {
    const cards = $$('.project-card');
    cards.forEach((card) => {
      const link = card.querySelector('.project-ext-link, .project-link');
      if (!link) return;
      const href = link.getAttribute('href');
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        window.open(href, '_blank', 'noopener,noreferrer');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. PARTICLES BACKGROUND
  ───────────────────────────────────────────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const numParticles = 20;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4 + 2, // tamaño de 2 a 6
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        colorIndex: Math.floor(Math.random() * 3),
        blur: Math.random() * 4 + 2 // nivel de desenfoque por partícula
      });
    }

    // Colores según tema
    const getColors = () => document.documentElement.getAttribute('data-theme') === 'light'
      ? ['rgba(37, 99, 235, 0.4)', 'rgba(79, 70, 229, 0.3)', 'rgba(99, 102, 241, 0.35)']
      : ['rgba(37, 99, 235, 0.6)', 'rgba(79, 70, 229, 0.5)', 'rgba(99, 102, 241, 0.5)'];

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[p.colorIndex];
        ctx.filter = `blur(${p.blur}px)`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initScrollReveal();
    initClickableProjects();
    initParticles();
  });

})();
