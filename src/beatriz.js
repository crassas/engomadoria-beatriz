import {animate,inView} from 'motion';
import {business,wa,packMessage} from './data.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
const intro=document.querySelector('.intro');
const introVideo=document.querySelector('#intro-video');const introEnter=document.querySelector('#intro-enter');const pageParts=Array.from(document.body.children).filter(e=>e!==intro);
let leaving=false;let introAutoTimer=null;
const finishIntro=()=>{if(leaving)return;leaving=true;if(introAutoTimer)clearTimeout(introAutoTimer);introVideo?.pause();intro?.classList.add('intro-leaving');const reveal=()=>{document.body.classList.add('intro-done');document.body.classList.remove('intro-active');pageParts.forEach(e=>e.inert=false);intro?.remove();if(!reduced){animate('.hero-copy',{opacity:[.9,1],y:[4,0]},{duration:.3,ease:[.22,.61,.36,1]});document.querySelector('main')?.setAttribute('tabindex','-1');document.querySelector('main')?.focus({preventScroll:true})}};if(reduced)reveal();else setTimeout(reveal,550)};
const readyIntro=(fallback=false)=>{if(leaving||!intro)return;intro.classList.add('intro-ready');if(fallback)intro.classList.add('intro-fallback');introEnter.hidden=false;intro.querySelector('.intro-enter-hint').hidden=false;if(introAutoTimer)clearTimeout(introAutoTimer);introAutoTimer=setTimeout(finishIntro,fallback?700:1400)};
introEnter?.addEventListener('click',finishIntro);
intro?.addEventListener('keydown',event=>{if(event.key==='Escape'){finishIntro();return}if(event.key==='Tab'){const controls=[introEnter].filter(e=>e&&!e.hidden);const current=controls.indexOf(document.activeElement);event.preventDefault();controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus()}});
if(reduced)finishIntro();else if(intro){document.body.classList.add('intro-active');pageParts.forEach(e=>e.inert=true);intro.focus({preventScroll:true});introVideo?.addEventListener('timeupdate',()=>{if(introVideo.currentTime>=3.7)intro.classList.add('intro-delivered');if(introVideo.currentTime>=5.5)readyIntro()});introVideo?.addEventListener('ended',()=>readyIntro());introVideo?.addEventListener('error',()=>readyIntro(true));introVideo?.play().catch(()=>readyIntro(true));setTimeout(()=>{if(!leaving&&!intro.classList.contains('intro-ready'))readyIntro(true)},8500)}

const menu=document.querySelector('.menu-toggle');const mobile=document.querySelector('#mobile-menu');
const closeMenu=()=>{if(!menu||!mobile)return;mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');document.body.classList.remove('menu-open')};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');mobile.hidden=!open;document.body.classList.toggle('menu-open',open)});
mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu?.focus()}});matchMedia('(min-width: 901px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
const select=document.querySelector('#service-select');const packSelect=document.querySelector('#request-pack');const quantity=document.querySelector('#request-quantity');const notes=document.querySelector('#request-notes');
let selectedPack=business.packs.find(p=>p.pieces===60);
const updateMessage=()=>{if(!select)return;const type=select.value;document.querySelector('#request-pack-field').hidden=type!=='pack';document.querySelector('#request-al-field').hidden=type!=='al';let message;
if(type==='pack'){const pack=business.packs.find(p=>p.pieces===Number(packSelect.value));message=packMessage(pack)}
else if(type==='al'){message='Olá, Beatriz! Gostaria de informações sobre roupa branca para Alojamento Local a 2 €/kg.';const kilos=Number(quantity.value);if(Number.isFinite(kilos)&&kilos>0&&kilos<=10000)message+=` Tenho aproximadamente ${kilos.toLocaleString('pt-PT')} kg de roupa branca.`;message+=' Pode confirmar as condições, a disponibilidade e o prazo?'}
else if(type==='outro')message='Olá, Beatriz! Gostaria de esclarecer uma dúvida sobre os vossos serviços.';
else message=`Olá, Beatriz! Gostaria de informações sobre ${type.toLocaleLowerCase('pt-PT')}. Pode confirmar a disponibilidade e o orçamento?`;
if(notes.value.trim())message+='\n\n'+notes.value.trim().slice(0,500);
document.querySelector('#message-preview').textContent=message;document.querySelector('#request-whatsapp').href=wa(message)};
[select,packSelect,quantity,notes].forEach(el=>{el?.addEventListener('input',updateMessage);el?.addEventListener('change',updateMessage)});
document.querySelector('#request-form')?.addEventListener('submit',e=>{e.preventDefault();updateMessage();document.querySelector('#request-whatsapp').click()});
document.querySelectorAll('.pack-option').forEach(button=>button.addEventListener('click',()=>{selectedPack=business.packs.find(p=>p.pieces===Number(button.dataset.pieces));document.querySelectorAll('.pack-option').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});const summary=`${selectedPack.pieces} peças · ${selectedPack.price} €`;document.querySelector('#pack-summary').textContent=summary;document.querySelector('#pack-status').textContent=`Pack seleccionado: ${summary}`;document.querySelector('#pack-whatsapp').href=wa(packMessage(selectedPack));packSelect.value=String(selectedPack.pieces);select.value='pack';updateMessage();if(!reduced)animate('#pack-summary',{opacity:[.3,1],y:[5,0]},{duration:.3})}));
document.querySelectorAll('[data-intent]').forEach(link=>link.addEventListener('click',()=>{select.value=link.dataset.intent;updateMessage()}));
if(!reduced){inView('.section-heading,.story-copy,.al-copy,.request-grid>div,.faq>div:first-child,.contact-grid>div:first-child',el=>{animate(el,{opacity:[.25,1],y:[20,0]},{duration:.7,ease:[.2,.8,.2,1]})},{amount:.12})}
// Transição experimental Beatriz -> Grupo Elite Limpeza.
const partnerPanel=document.querySelector('.partner-elite-panel');
let partnerTransitionActive=false;
const ensurePartnerTransitionStyles=()=>{
  if(document.querySelector('#partner-transition-styles'))return;
  const style=document.createElement('style');
  style.id='partner-transition-styles';
  style.textContent=[
    '.partner-transition{position:fixed;inset:0;z-index:2147483000;overflow:hidden;isolation:isolate;background:#e6edf1;cursor:progress}',
    '.partner-transition__page{position:absolute;inset:-2%;width:104%;height:104%;border:0;background:#f7fbfd;opacity:.55;filter:blur(18px) saturate(.78);transform:scale(1.035);transition:filter 1.35s cubic-bezier(.22,.61,.36,1),transform 1.35s cubic-bezier(.22,.61,.36,1),opacity .9s ease}',
    '.partner-transition__fog{position:absolute;inset:-3%;background:radial-gradient(circle at 18% 22%,rgba(255,255,255,.8) 0 1px,transparent 2px),radial-gradient(circle at 72% 36%,rgba(255,255,255,.65) 0 1.5px,transparent 2.5px),linear-gradient(145deg,rgba(232,240,244,.86),rgba(198,211,219,.7));background-size:29px 31px,43px 47px,100% 100%;backdrop-filter:blur(16px) saturate(.8);-webkit-backdrop-filter:blur(16px) saturate(.8);opacity:.96;transform:scale(1.03)}',
    '.partner-transition__fog:after{content:"";position:absolute;inset:0;background:linear-gradient(125deg,transparent 20%,rgba(255,255,255,.44) 45%,transparent 70%);opacity:.55}',
    '.partner-transition__film{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.94;filter:saturate(.78) contrast(.9) brightness(1.03);pointer-events:none}',
    '.partner-transition.is-running .partner-transition__page{opacity:1;filter:blur(0) saturate(1);transform:scale(1)}',
    '.partner-transition.is-running .partner-transition__fog{animation:partnerFogWipe 1.58s cubic-bezier(.3,.7,.2,1) forwards}',
    '.partner-transition.is-running .partner-transition__film{animation:partnerFilmFade 1.72s linear forwards}',
    '.partner-transition.no-film .partner-transition__film{display:none}',
    '@keyframes partnerFogWipe{0%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%);opacity:.96}34%{clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);opacity:.91}72%{clip-path:polygon(0 0,60% 0,0 62%);opacity:.72}100%{clip-path:polygon(0 0,0 0,0 0);opacity:0}}',
    '@keyframes partnerFilmFade{0%,15%{opacity:.94}58%{opacity:.7}82%{opacity:.32}100%{opacity:0}}',
    '@media (min-width:901px){.partner-transition__film{display:none}.partner-transition__fog{background-size:34px 37px,51px 57px,100% 100%}}'
  ].join('');
  document.head.append(style);
};
if(partnerPanel){
  const prefetch=document.createElement('link');prefetch.rel='prefetch';prefetch.href=partnerPanel.href;document.head.append(prefetch);
  partnerPanel.addEventListener('click',event=>{
    if(reduced||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0||partnerTransitionActive)return;
    event.preventDefault();partnerTransitionActive=true;ensurePartnerTransitionStyles();
    const href=partnerPanel.href;
    const overlay=document.createElement('div');overlay.className='partner-transition';overlay.setAttribute('aria-hidden','true');
    const frame=document.createElement('iframe');frame.className='partner-transition__page';frame.src=href;frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');
    const fog=document.createElement('div');fog.className='partner-transition__fog';
    const film=document.createElement('img');film.className='partner-transition__film';film.src='assets/partner-cleaning-mobile.webp';film.alt='';film.decoding='async';
    overlay.append(frame,fog,film);document.body.append(overlay);
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    let started=false;let finished=false;
    const start=()=>{if(started)return;started=true;requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('is-running')))};
    const finish=()=>{if(finished)return;finished=true;document.body.style.overflow=previousOverflow;location.assign(href)};
    const startFallback=setTimeout(start,420);
    frame.addEventListener('load',()=>{clearTimeout(startFallback);setTimeout(start,70)},{once:true});
    film.addEventListener('error',()=>overlay.classList.add('no-film'),{once:true});
    setTimeout(finish,2100);
  });
}

updateMessage();
