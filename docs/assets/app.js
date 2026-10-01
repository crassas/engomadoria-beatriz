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