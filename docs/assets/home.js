(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.querySelector('[data-intro]');
  const header = document.querySelector('[data-header]');

  if (intro && !reduce) {
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => intro.classList.add('is-leaving'), 1050);
    setTimeout(() => {
      intro.classList.add('is-gone');
      document.documentElement.style.overflow = '';
    }, 2200);
  } else if (intro) intro.classList.add('is-gone');

  const headerState = () => header && header.classList.toggle('scrolled', scrollY > 34);
  headerState(); addEventListener('scroll', headerState, {passive:true});

  const reveal = [...document.querySelectorAll('.reveal')];
  if (!reduce && 'IntersectionObserver' in window) {
    reveal.forEach(el => el.classList.add('pre'));
    const io = new IntersectionObserver((entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    }), {threshold:.13, rootMargin:'0px 0px -7%'});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('on'));

  const hero = document.querySelector('[data-parallax]');
  const img = hero?.querySelector('img');
  if (hero && img && !reduce && matchMedia('(pointer:fine)').matches) {
    let tx=0, ty=0, cx=0, cy=0, raf=0;
    const draw=()=>{cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;img.style.transform='scale(1.075) translate3d('+cx+'px,'+cy+'px,0)';if(Math.abs(tx-cx)>.05||Math.abs(ty-cy)>.05)raf=requestAnimationFrame(draw);else raf=0};
    document.querySelector('.hero')?.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*-9;ty=((e.clientY-r.top)/r.height-.5)*-6;if(!raf)raf=requestAnimationFrame(draw)},{passive:true});
    document.querySelector('.hero')?.addEventListener('pointerleave',()=>{tx=0;ty=0;if(!raf)raf=requestAnimationFrame(draw)},{passive:true});
  }

  if (!reduce && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.pack').forEach(card => {
      card.addEventListener('pointermove', e => {const r=card.getBoundingClientRect();const rx=((e.clientY-r.top)/r.height-.5)*-3;const ry=((e.clientX-r.left)/r.width-.5)*4;card.style.transform='translateY(-9px) perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg)'});
      card.addEventListener('pointerleave',()=> card.style.transform='');
    });
  }
})();