(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro=document.querySelector('.intro');

  if(intro&&!reduced){
    document.documentElement.classList.add('lock');
    setTimeout(()=>intro.classList.add('leave'),900);
    setTimeout(()=>{
      intro.remove();
      document.documentElement.classList.remove('lock');
      document.body.classList.add('ready');
    },2100);
  } else {
    intro?.remove();
    document.body.classList.add('ready');
  }

  const menu=document.querySelector('.menu');
  const mobile=document.querySelector('.mobile-nav');
  if(menu&&mobile){
    const close=()=>{mobile.classList.remove('open');menu.setAttribute('aria-expanded','false')};
    menu.addEventListener('click',()=>{
      const open=mobile.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
    });
    mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  const track=document.querySelector('.gallery-track');
  document.querySelector('.arrow.prev')?.addEventListener('click',()=>track?.scrollBy({left:-track.clientWidth*.82,behavior:'smooth'}));
  document.querySelector('.arrow.next')?.addEventListener('click',()=>track?.scrollBy({left:track.clientWidth*.82,behavior:'smooth'}));

  if(track&&!reduced){
    let paused=false;
    const advance=()=>{
      if(paused||document.hidden)return;
      const max=track.scrollWidth-track.clientWidth;
      const next=track.scrollLeft+track.clientWidth*.55;
      track.scrollTo({left:next>=max-8?0:next,behavior:'smooth'});
    };
    const timer=setInterval(advance,5200);
    track.addEventListener('pointerenter',()=>paused=true);
    track.addEventListener('pointerleave',()=>paused=false);
    track.addEventListener('touchstart',()=>paused=true,{passive:true});
    track.addEventListener('touchend',()=>setTimeout(()=>paused=false,2400),{passive:true});
    window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  }

  const navLinks=[...document.querySelectorAll('.nav a[href^="#"],.mobile-nav a[href^="#"]')];
  const sections=[...document.querySelectorAll('#packs,#al,#galeria,#servicos,#contacto')];
  if('IntersectionObserver'in window&&sections.length){
    const spy=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));
      });
    },{rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(s=>spy.observe(s));
  }

  if(!reduced&&'IntersectionObserver'in window){
    const cards=[...document.querySelectorAll('.price-item,.local-card,.gallery-card,.service,.feature')];
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('motion-active');
        setTimeout(()=>e.target.classList.remove('motion-active'),900);
        io.unobserve(e.target);
      }
    }),{threshold:.35});
    cards.forEach(x=>io.observe(x));
  }
})();