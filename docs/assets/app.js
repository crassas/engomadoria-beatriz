(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  html.classList.add('js');

  const intro = document.querySelector('[data-intro]');
  if (intro && !reduzirMovimento) {
    // A carrinha entra primeiro. Quando atravessa o centro, as portas começam a abrir.
    window.setTimeout(() => body.classList.add('intro-carrinha-run'), 180);
    window.setTimeout(() => body.classList.add('intro-abrir'), 930);
    window.setTimeout(() => body.classList.add('intro-fim'), 2420);
    window.setTimeout(() => {
      window.requestAnimationFrame(() => body.classList.add('pagina-visivel'));
    }, 2550);
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

  // Escolhas rápidas do primeiro ecrã: levam directamente ao ponto certo.
  document.querySelectorAll('[data-ir]').forEach(botao => {
    botao.addEventListener('click', () => {
      const destino = document.querySelector(botao.dataset.ir || '');
      if (!destino) return;

      destino.scrollIntoView({
        behavior: reduzirMovimento ? 'auto' : 'smooth',
        block: 'start'
      });

      const destacar = botao.dataset.destacar;
      if (destacar) {
        const pack = document.getElementById(destacar);
        if (pack) {
          window.setTimeout(() => {
            pack.classList.add('pack-pulso');
            window.setTimeout(() => pack.classList.remove('pack-pulso'), 1500);
          }, reduzirMovimento ? 0 : 620);
        }
      }
    });
  });

  // CTA móvel aparece depois do hero para não competir com a abertura.
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(([entrada]) => {
      body.classList.toggle('mostrar-cta', !entrada.isIntersecting);
    }, { threshold: 0.12 });
    ctaObserver.observe(hero);
  } else {
    body.classList.add('mostrar-cta');
  }

  // Pequena resposta física nos botões e cartões, sem exagerar.
  if (!reduzirMovimento && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.pack,.servico,.botao').forEach(el => {
      el.addEventListener('pointerdown', () => el.style.transform = 'scale(.985)');
      const limpar = () => el.style.removeProperty('transform');
      el.addEventListener('pointerup', limpar);
      el.addEventListener('pointerleave', limpar);
    });
  }

  document.querySelectorAll('[data-ano]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();