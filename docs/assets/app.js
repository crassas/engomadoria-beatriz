(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealItems = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealItems.forEach((el) => el.classList.add('will-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  const card = document.querySelector('[data-pack-card]');
  const pieces = document.querySelector('[data-pack-pieces]');
  const price = document.querySelector('[data-pack-price]');
  const dots = [...document.querySelectorAll('.pack-dots i')];
  const packs = [
    ['20 peças', '20,00 €'],
    ['40 peças', '35,00 €'],
    ['60 peças', '45,00 €'],
    ['80 peças', '55,00 €'],
    ['100 peças', '65,00 €']
  ];

  if (card && pieces && price && !reduceMotion) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % packs.length;
      card.classList.remove('pack-switch');
      void card.offsetWidth;
      card.classList.add('pack-switch');
      window.setTimeout(() => {
        pieces.textContent = packs[index][0];
        price.textContent = packs[index][1];
        dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
      }, 180);
    }, 2400);
  }
})();

/* HOME V2 motion layer */
(() => {
  const header = document.querySelector('[data-v2-header]');
  const heroPhoto = document.querySelector('[data-v2-parallax] img');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (header) {
    const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 34);
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  if (heroPhoto && !reduce && window.matchMedia('(pointer:fine)').matches) {
    const hero = document.querySelector('.v2-hero');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const draw = () => {
      cx += (tx - cx) * .055;
      cy += (ty - cy) * .055;
      heroPhoto.style.transform = 'scale(1.055) translate3d(' + cx + 'px,' + cy + 'px,0)';
      if (Math.abs(tx-cx) > .05 || Math.abs(ty-cy) > .05) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    if (hero) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * -10;
        ty = ((e.clientY - r.top) / r.height - .5) * -7;
        if (!raf) raf = requestAnimationFrame(draw);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(draw);
      }, { passive: true });
    }
  }

  const packs = document.querySelectorAll('.v2-pack');
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    packs.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY-r.top)/r.height-.5) * -2.8;
        const ry = ((e.clientX-r.left)/r.width-.5) * 3.6;
        card.style.transform = 'translateY(-9px) perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();
