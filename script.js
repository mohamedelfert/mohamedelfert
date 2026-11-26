(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Theme toggle (preference stored locally; falls back silently) */
  const themeBtn = $('.theme-toggle');
  const root = document.documentElement;
  const syncTheme = () => {
    const light = root.getAttribute('data-theme') === 'light';
    themeBtn?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    $('meta[name="theme-color"]')?.setAttribute('content', light ? '#f3f1ea' : '#080a0d');
  };
  themeBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* Cursor spotlight on cards (fine pointers only) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    $$('.arch, .facts div, .principles li, .skill, .role, .project-feature, .project-crm, .project-mnhna').forEach(el => {
      el.classList.add('spot');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* Mobile menu */
  const menuButton = $('.menu-button');
  const nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  menuButton?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuButton.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* Scroll reveal */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* Active section in nav */
  const links = new Map($$('.nav a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.remove('is-current'));
        links.get(en.target.id)?.classList.add('is-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* Scroll progress */
  const bar = $('.scroll-progress span');
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; } }, { passive: true });
  updateProgress();

  /* Hero request-path: step through the five stages while visible */
  const steps = $$('.arch-step');
  const arch = $('#arch');
  if (steps.length && arch && !reduceMotion) {
    let i = 0, timer = null;
    const show = n => steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
    const start = () => { if (!timer) timer = setInterval(() => { i = (i + 1) % steps.length; show(i); }, 1800); };
    const stop = () => { clearInterval(timer); timer = null; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(arch);
    } else start();
    steps.forEach((s, k) => s.addEventListener('mouseenter', () => { stop(); i = k; show(k); }));
    arch.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* Magnetic buttons: fine pointers only */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.1}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
