(() => {
  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const intro = document.querySelector('[data-intro]');
  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem('beatriz-intro-seen') === '1'; } catch (_) {}
  if (intro) {
    if (reduceMotion || alreadySeen) {
      body.classList.add('intro-done');
    } else {
      window.setTimeout(() => body.classList.add('intro-ready'), 850);
      window.setTimeout(() => {
        body.classList.add('intro-done');
        try { sessionStorage.setItem('beatriz-intro-seen', '1'); } catch (_) {}
      }, 1780);
    }
  }

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  const syncHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('is-open', !open);
    });
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const reveals = [...document.querySelectorAll('[data-reveal], .reveal')];
  reveals.forEach(el => {
    const delay = Number(el.dataset.delay || 0);
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  const parallax = document.querySelector('[data-parallax]');
  if (parallax && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let ticking = false;
    const update = () => {
      const y = Math.max(-18, Math.min(22, window.scrollY * 0.032));
      parallax.style.setProperty('--hero-parallax', y + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.pack-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const r = card.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width - 0.5;
        const y = (event.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--mx', (x * 5) + 'px');
        card.style.setProperty('--my', (y * 5) + 'px');
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  doc.classList.add('js-ready');
})();