(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  html.classList.add('js');

  const intro = document.querySelector('[data-intro]');
  if (intro && !reduzirMovimento) {
    window.setTimeout(() => body.classList.add('intro-abrir'), 760);
    window.setTimeout(() => body.classList.add('intro-fim'), 1640);
    window.setTimeout(() => {
      window.requestAnimationFrame(() => body.classList.add('pagina-visivel'));
    }, 1760);
  } else {
    body.classList.add('intro-fim', 'pagina-visivel');
  }

  const header = document.querySelector('[data-header]');
  const botaoMenu = document.querySelector('[data-menu]');
  const menuMobile = document.querySelector('[data-menu-mobile]');

  const atualizarHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 18);
  };
  atualizarHeader();
  window.addEventListener('scroll', atualizarHeader, { passive: true });

  if (botaoMenu && menuMobile) {
    const fecharMenu = () => {
      botaoMenu.setAttribute('aria-expanded', 'false');
      menuMobile.classList.remove('aberto');
      body.classList.remove('menu-aberto');
    };

    botaoMenu.addEventListener('click', () => {
      const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
      botaoMenu.setAttribute('aria-expanded', String(!aberto));
      menuMobile.classList.toggle('aberto', !aberto);
      body.classList.toggle('menu-aberto', !aberto);
    });

    menuMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', fecharMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') fecharMenu();
    });
  }

  const elementos = [...document.querySelectorAll('[data-reveal], .reveal')];
  elementos.forEach(el => {
    const atraso = Number(el.dataset.atraso || 0);
    if (atraso) el.style.setProperty('--atraso', atraso + 'ms');
  });

  if (reduzirMovimento || !('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visivel'));
  } else {
    const observador = new IntersectionObserver(entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    elementos.forEach(el => observador.observe(el));
  }

  document.querySelectorAll('[data-ano]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();