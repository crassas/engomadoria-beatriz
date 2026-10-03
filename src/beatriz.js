import {animate,inView} from 'motion';
import {business,wa,packMessage} from './data.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
const intro=document.querySelector('.intro');
const introVideo=document.querySelector('#intro-video');const introEnter=document.querySelector('#intro-enter');const pageParts=Array.from(document.body.children).filter(e=>e!==intro);
let leaving=false;
const finishIntro=()=>{if(leaving)return;leaving=true;introVideo?.pause();intro?.classList.add('intro-leaving');const reveal=()=>{document.body.classList.add('intro-done');document.body.classList.remove('intro-active');pageParts.forEach(e=>e.inert=false);intro?.remove();if(!reduced){animate('.hero-copy',{opacity:[.9,1],y:[4,0]},{duration:.3,ease:[.22,.61,.36,1]});document.querySelector('.header .brand')?.focus({preventScroll:true})}};if(reduced)reveal();else setTimeout(reveal,550)};
const readyIntro=(fallback=false)=>{if(leaving||!intro)return;intro.classList.add('intro-ready');if(fallback)intro.classList.add('intro-fallback');introEnter.hidden=false;if(document.activeElement===intro)introEnter.focus({preventScroll:true});intro.querySelector('.intro-enter-hint').hidden=false};
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
document.querySelectorAll('.motion-toggle').forEach(button=>button.addEventListener('click',()=>{const paused=button.closest('.motion-panel').classList.toggle('motion-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Retomar texto':'Pausar texto'}));
if(!reduced){inView('.section-heading,.story-copy,.al-copy,.request-grid>div,.faq>div:first-child,.contact-grid>div:first-child',el=>{animate(el,{opacity:[.25,1],y:[20,0]},{duration:.7,ease:[.2,.8,.2,1]})},{amount:.12})}
updateMessage();
