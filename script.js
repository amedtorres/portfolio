/**
 * Portfolio — Amed Torres
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
     UTILIDADES
  ───────────────────────────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Detectar soporte de prefers-reduced-motion */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;



  /* ─────────────────────────────────────────────────────────────────────
     1. PARTÍCULAS CANVAS — SUTILES, OSCURAS, LENTAS
  ───────────────────────────────────────────────────────────────────── */
  function initParticles() {
    if (prefersReducedMotion) return;
    const canvas = $('#particles-canvas');
    if (!canvas) return;



    const ctx = canvas.getContext('2d', { alpha: true });
    let rafId;
    let particles = [];
    let W, H;
    let mouseX = -999, mouseY = -999;

    /* Configuración */
    const isMobile = window.innerWidth <= 640;
    const CONFIG = {
      count: isMobile ? 14 : 38,
      minR: isMobile ? 1 : 1.5,
      maxR: isMobile ? 2.5 : 4,
      speedY: -0.18,   /* flotan hacia arriba */
      speedXRange: 0.12,
      mouseRadius: 120,
      mouseForce: 0.9,
      colors: [
        '15,  23,  42',   /* slate-950  — máximo contraste */
        '30,  41,  59',   /* slate-800 */
        '51,  65,  85',   /* slate-700 */
        '37,  99, 235',   /* blue-600 */
        '79,  70, 229',   /* indigo-600 */
        '99,  60, 180',   /* violet-600 */
      ],
      opacityMin: 0.18,  /* mínimo subido: visibles desde el inicio */
      opacityMax: 0.45,  /* máximo: presencia clara, no intrusiva */
    };

    class Particle {
      constructor(initial = false) {
        this.init(initial);
      }

      init(initial = false) {
        this.x = Math.random() * W;
        this.y = initial
          ? Math.random() * H                 /* arranque: distribuidas */
          : H + Math.random() * 20;           /* reaparece por abajo */

        this.r = CONFIG.minR + Math.random() * (CONFIG.maxR - CONFIG.minR);
        this.speedX = (Math.random() - 0.5) * CONFIG.speedXRange;
        this.speedY = CONFIG.speedY * (0.7 + Math.random() * 0.6);
        this.alpha = CONFIG.opacityMin + Math.random() * (CONFIG.opacityMax - CONFIG.opacityMin);
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        this.ox = 0;
        this.oy = 0;
      }

      update() {
        /* Movimiento base */
        this.x += this.speedX + this.ox;
        this.y += this.speedY + this.oy;

        this.ox *= 0.90;
        this.oy *= 0.90;

        /* movimiento suave del ratón */
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < CONFIG.mouseRadius && dist > 0) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          const angle = Math.atan2(dy, dx);
          this.ox += Math.cos(angle) * force * CONFIG.mouseForce;
          this.oy += Math.sin(angle) * force * CONFIG.mouseForce;
        }

        /* Reiniciar si sale de pantalla */
        if (this.y < -10 || this.x < -10 || this.x > W + 10) {
          this.init();
        }
      }

      draw() {
        /* estilo difuminao */
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.r * 3
        );
        grad.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
        grad.addColorStop(0.6, `rgba(${this.color}, ${this.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${this.color}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = Array.from({ length: CONFIG.count }, () => new Particle(true));
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      rafId = requestAnimationFrame(animate);
    }

    /* Pausar cuando la pestaña no está visible */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate(); // reanuada
      }
    });

    let mouseTick = 0;
    document.addEventListener('mousemove', (e) => {
      if (Date.now() - mouseTick < 32) return;
      mouseTick = Date.now();
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      mouseX = -999;
      mouseY = -999;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resize();
        animate();
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────────
     2. NAVEGACIÓN 
  ───────────────────────────────────────────────────────────────────── */
  function initNav() {
    const pill = $('#nav-pill');
    const links = $$('.nav-link');
    const navLinks = $('#nav-menu');
    const toggle = $('#nav-toggle');
    const isMobile = () => window.innerWidth <= 640;

    if (!links.length || !navLinks) return;

    /* ─── Desktop: Pill deslizante ─── */
    function movePill(el) {
      if (!pill || !el) return;
      const elRect = el.getBoundingClientRect();
      const navRect = navLinks.getBoundingClientRect();
      const offsetX = elRect.left - navRect.left;

      pill.style.width = `${elRect.width}px`;
      pill.style.height = `${elRect.height}px`;
      pill.style.transform = `translateX(${offsetX}px)`;
    }

    if (!isMobile()) {
      const initialActive = $('.nav-link.active');
      if (initialActive) {
        requestAnimationFrame(() => movePill(initialActive));
      }
    }

    /* ─── Detectar sección actual ─── */
    const sections = $$('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const match = $(`.nav-link[href="#${id}"]`);
          if (!match) return;

          links.forEach((l) => l.classList.remove('active'));
          match.classList.add('active');

          if (!isMobile() && pill) movePill(match);
        }
      });
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0,
    });

    sections.forEach((s) => observer.observe(s));

    /* ─── Click en links: Scroll suave + cerrar menú ─── */
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Cerrar menú en móvil
          if (isMobile() && toggle && navLinks) {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
          }
        }
      });
    });

    /* ─── Móvil hamburguesa ─── */
    if (isMobile() && toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Cerrar menú al clickear fuera de la cápsula
      document.addEventListener('click', (e) => {
        const clickedCapsule = e.target.closest('.nav-capsule');
        if (!clickedCapsule && navLinks.classList.contains('active')) {
          toggle.classList.remove('active');
          navLinks.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ─── Resize ─── */
    window.addEventListener('resize', () => {
      if (!isMobile() && pill) movePill($('.nav-link.active'));
    }, { passive: true });
  }
  /* ─────────────────────────────────────────────────────────────────────
     3. SCROLL REVEAL 
  ───────────────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const elements = $$('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* no re-observar una vez visible */
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach((el) => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────────────
     4. CARRUSEL DE CERTIFICACIONES
  ───────────────────────────────────────────────────────────────────── */
  function initCertsSlider() {
    const track = $('#certs-track');
    const prevBtn = $('#certs-prev');
    const nextBtn = $('#certs-next');
    const dots = $$('.certs-dot', $('#certs-dots'));
    const counterEl = $('#certs-counter-current');
    if (!track) return;

    const pages = $$('.certs-page', track);
    const total = pages.length;
    let current = 0;

    function lockTrackHeight() {
      pages.forEach(p => p.removeAttribute('hidden'));
      let maxH = 0;
      pages.forEach(p => {
        const h = p.getBoundingClientRect().height;
        if (h > maxH) maxH = h;
      });
      track.style.minHeight = maxH + 'px';
      // Volver a ocultar todas excepto la actual
      pages.forEach((p, i) => {
        if (i !== current) p.setAttribute('hidden', '');
      });
    }

    function updateButtons() {
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
    }

    function show(index) {
      /* Ocultar todas las páginas y mostrar la activa */
      pages.forEach((p, i) => {
        if (i === index) {
          p.removeAttribute('hidden');
          /* Forzar animación */
          p.style.animation = 'none';
          void p.offsetWidth;
          p.style.animation = '';
        } else {
          p.setAttribute('hidden', '');
        }
      });

      /* Actualizar dots */
      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });

      /* Actualizar contador */
      if (counterEl) {
        counterEl.textContent = String(index + 1);
      }

      current = index;
      updateButtons();
    }

    nextBtn.addEventListener('click', () => {
      if (current < total - 1) show(current + 1);
    });

    prevBtn.addEventListener('click', () => {
      if (current > 0) show(current - 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(parseInt(dot.dataset.page, 10));
      });
    });

    /* Init */
    show(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lockTrackHeight();
      });
    });

    /* Recalcular en resize */
    window.addEventListener('resize', lockTrackHeight, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────────
     5. PROYECTOS CLICKEABLES
  ───────────────────────────────────────────────────────────────────── */
  function initClickableCards() {
    const cards = $$('.project-card');

    cards.forEach((card) => {
      const link = card.querySelector('.project-title a');
      if (!link) return;

      const href = link.getAttribute('href');
      const target = link.getAttribute('target') || '_blank';
      const rel = link.getAttribute('rel') || 'noopener noreferrer';

      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;

        // En cualquier otra parte de la card, abrimos el link
        window.open(href, target, rel === 'noopener noreferrer' ? 'noopener,noreferrer' : '');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();       /* Partículas canvas */
    initNav();             /* Navegación pill animada */
    initScrollReveal();    /* Reveal en scroll con IntersectionObserver */
    initCertsSlider();     /* Carrusel certificaciones */
    initClickableCards();  /* Cards de proyectos clickeables al completo */
  });

})();
