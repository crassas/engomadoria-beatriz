import {animate,inView} from 'motion';
import {business,wa,packMessage} from './data.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
const intro=document.querySelector('.intro');
const finishIntro=()=>{document.body.classList.add('intro-done');intro?.remove()};
if(reduced)finishIntro();else{setTimeout(finishIntro,7050);setTimeout(()=>{animate('.hero-copy',{opacity:[.9,1],y:[4,0]},{duration:.9,ease:[.22,.61,.36,1]})},5700)}
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
const video=document.querySelector('#care-video');const toggle=document.querySelector('#video-toggle');
const resetVideoButton=()=>{video?.closest('.film').classList.remove('playing');toggle?.setAttribute('aria-label','Reproduzir vídeo de apresentação');if(toggle)toggle.querySelector('span').textContent='Ver o cuidado'};
toggle?.addEventListener('click',async()=>{if(!video.paused){video.pause();return}try{await video.play();video.closest('.film').classList.add('playing');toggle.setAttribute('aria-label','Pausar vídeo de apresentação');toggle.querySelector('span').textContent='Pausar filme'}catch{document.querySelector('#video-status').textContent='Não foi possível reproduzir o vídeo. Pode consultar os serviços nesta página.';resetVideoButton()}});
video?.addEventListener('pause',resetVideoButton);video?.addEventListener('error',()=>{document.querySelector('#video-status').textContent='O vídeo não está disponível neste momento.'});
if(video&&'IntersectionObserver'in window){new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting&&!video.paused)video.pause()})},{threshold:.05}).observe(video)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)video?.pause()});
if(!reduced){inView('.section-heading,.story-copy,.al-copy,.request-grid>div,.faq>div:first-child,.contact-grid>div:first-child',el=>{animate(el,{opacity:[.25,1],y:[20,0]},{duration:.7,ease:[.2,.8,.2,1]})},{amount:.12})}
updateMessage();
