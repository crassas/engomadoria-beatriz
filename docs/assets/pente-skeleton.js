(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro=document.querySelector('.intro');
  if(intro&&!reduced){document.documentElement.classList.add('lock');setTimeout(()=>intro.classList.add('leave'),900);setTimeout(()=>{intro.remove();document.documentElement.classList.remove('lock')},2100)} else {intro?.remove()}
  const menu=document.querySelector('.menu'),mobile=document.querySelector('.mobile-nav');
  if(menu&&mobile){menu.addEventListener('click',()=>{const o=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(o))});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menu.setAttribute('aria-expanded','false')}))}
  const track=document.querySelector('.gallery-track');
  document.querySelector('.arrow.prev')?.addEventListener('click',()=>track?.scrollBy({left:-track.clientWidth*.82,behavior:'smooth'}));
  document.querySelector('.arrow.next')?.addEventListener('click',()=>track?.scrollBy({left:track.clientWidth*.82,behavior:'smooth'}));
  if(!reduced&&'IntersectionObserver'in window){
    const cards=[...document.querySelectorAll('.price-item,.local-card,.gallery-card,.service')];
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-active');setTimeout(()=>e.target.classList.remove('motion-active'),900);io.unobserve(e.target)}}),{threshold:.35});
    cards.forEach(x=>io.observe(x));
  }
})();