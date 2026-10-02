(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.add('js');

  const intro = document.querySelector('[data-intro]');
  if (intro && !reduzirMovimento) {
    window.setTimeout(() => body.classList.add('intro-abrir'), 900);
    window.setTimeout(() => body.classList.add('intro-fim'), 2320);
    window.setTimeout(() => requestAnimationFrame(() => body.classList.add('pagina-visivel')), 2440);
  } else {
    body.classList.add('intro-fim', 'pagina-visivel');
  }

  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const mobileMenu = document.querySelector('[data-menu-mobile]');

  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  syncHeader();
  window.addEventListener('scroll', syncHeader, {passive:true});

  if (menu && mobileMenu) {
    const closeMenu = () => {
      menu.setAttribute('aria-expanded','false');
      mobileMenu.classList.remove('aberto');
      body.classList.remove('menu-aberto');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('aberto', !open);
      body.classList.toggle('menu-aberto', !open);
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  const reveals = [...document.querySelectorAll('[data-reveal],.reveal')];
  reveals.forEach(el => {
    const delay = Number(el.dataset.atraso || 0);
    if (delay) el.style.setProperty('--atraso', delay + 'ms');
  });

  if (reduzirMovimento || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visivel'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visivel');
        observer.unobserve(entry.target);
      });
    }, {threshold:.12, rootMargin:'0px 0px -7% 0px'});
    reveals.forEach(el => observer.observe(el));
  }

  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(([entry]) => {
      body.classList.toggle('mostrar-cta', !entry.isIntersecting);
    }, {threshold:.08});
    ctaObserver.observe(hero);
  } else {
    body.classList.add('mostrar-cta');
  }

  document.querySelectorAll('[data-ano]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();