import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {business as b,wa,generalMessage,packMessage} from '../src/data.mjs';
const revision=createHash('sha256').update(fs.readFileSync('src/beatriz.css')).update(fs.readFileSync('src/beatriz.js')).update(fs.readFileSync('src/data.mjs')).update(fs.readFileSync('docs/assets/photos/beatriz-logo.webp')).digest('hex').slice(0,12);
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const icon = (name,cls='') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const icons = `<svg class="icon-sprite" xmlns="http://www.w3.org/2000/svg"><defs>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
<symbol id="i-shirt" viewBox="0 0 24 24"><path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="m5 3 4 4-2 3c2 3 4 5 7 7l3-2 4 4c-1 3-4 3-6 2C8 18 4 14 2 7 1 5 2 3 5 3Z"/></symbol>
<symbol id="i-wa" viewBox="0 0 24 24"><path d="M21 11.5A9 9 0 0 1 7 19L2 21l1.5-5A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 2-1 2 3 3 2-1 2 2c-1 3-7 0-9-4-1-2 0-3 1-4Z"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="m8 5 12 7-12 7Z"/></symbol>
</defs></svg>`;
const mapsUrl='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(b.streetAddress+', '+b.city);
const brand=(prefix='')=>`<a class="brand" href="${prefix||'#inicio'}" aria-label="Engomadoria Beatriz — início"><img src="${prefix}assets/photos/beatriz-logo.webp?v=${revision}" width="1536" height="630" alt="Engomadoria Beatriz Lavandaria"></a>`;
const schema={ '@context':'https://schema.org','@graph':[
 {'@type':'DryCleaningOrLaundry','@id':b.url+'#negocio',name:b.fullName,description:'Engomadoria e lavandaria na Praça das Flores, Porto, com cerca de 20 anos de experiência. Packs mensais de engomadoria, recolha e entrega no Grande Porto a partir de 25 peças e lavandaria para Alojamento Local a 2 €/kg.',url:b.url,telephone:b.phone,priceRange:'€29–€89',image:b.url+'assets/photos/beatriz-editorial.webp',address:{'@type':'PostalAddress',streetAddress:b.streetAddress,addressLocality:b.city,addressRegion:'Porto',addressCountry:'PT'},areaServed:'Grande Porto',paymentAccepted:'Dinheiro, MB WAY',openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'10:00',closes:'12:30'},{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'14:00',closes:'19:00'},{'@type':'OpeningHoursSpecification',dayOfWeek:'Saturday',opens:'10:00',closes:'15:00'}],hasOfferCatalog:{'@type':'OfferCatalog',name:'Packs mensais de engomadoria e limpeza têxtil',itemListElement:[...b.packs.map(p=>({'@type':'Offer',price:String(p.price),priceCurrency:'EUR',itemOffered:{'@type':'Service',name:`Pack mensal de engomadoria — ${p.pieces} peças`}})),{'@type':'Offer',price:'2',priceCurrency:'EUR',itemOffered:{'@type':'Service',name:'Lavandaria para Alojamento Local — serviço completo por kg'}},...b.services.map(name=>({'@type':'Offer',itemOffered:{'@type':'Service',name}}))]}},
 {'@type':'WebSite','@id':b.url+'#website',url:b.url,name:b.name,inLanguage:'pt-PT',publisher:{'@id':b.url+'#negocio'}},
 {'@type':'FAQPage','@id':b.url+'#faq',mainEntity:b.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
]};
// Describe only content that is visible on this particular page.
const schemaForPage=(title,description,route='')=>{
  const pageUrl=b.url+route;
  const hasFaq=route===''||route==='perguntas-frequentes/';
  const graph=schema['@graph'].filter(node=>hasFaq||node['@type']!=='FAQPage').map(node=>{
    if(node['@type']==='FAQPage')return {...node,'@id':pageUrl+'#faq'};
    if(node['@type']==='DryCleaningOrLaundry'&&route!==''&&route!=='precos/'){
      const {hasOfferCatalog,...entity}=node;
      return entity;
    }
    return node;
  });
  graph.push({'@type':'WebPage','@id':pageUrl+'#webpage',url:pageUrl,name:title,description,
    inLanguage:'pt-PT',isPartOf:{'@id':b.url+'#website'},about:{'@id':b.url+'#negocio'},
    mainEntity:{'@id':pageUrl+(hasFaq?'#faq':'#negocio')}});
  // Service and contact pages refer to the one canonical business entity.
  if(!hasFaq)graph.at(-1).mainEntity={'@id':b.url+'#negocio'};
  if(route==='recolha-entrega-engomadoria-porto/'){
    const serviceId=pageUrl+'#servico';
    graph.at(-1).mainEntity={'@id':serviceId};
    graph.push({'@type':'Service','@id':serviceId,name:'Engomadoria com recolha e entrega no Grande Porto',serviceType:'Recolha e entrega de roupa para engomadoria',url:pageUrl,provider:{'@id':b.url+'#negocio'},areaServed:{'@type':'AdministrativeArea',name:'Grande Porto'},description:'Serviço de recolha e entrega para engomadoria a partir de 25 peças, sujeito a confirmação de zona, disponibilidade e prazo.'});
  }
  return {'@context':'https://schema.org','@graph':graph};
};
const head=(title,description,route='')=>`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#fff4f7"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${b.url+route}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_PT"><meta property="og:site_name" content="${b.name}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${b.url+route}"><meta property="og:image" content="${b.url}assets/photos/beatriz-editorial.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${route?'../':''}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${route?'../':''}assets/beatriz.css?v=${revision}"><script type="application/ld+json">${JSON.stringify(schemaForPage(title,description,route))}</script>${route?'':`<link rel="preload" href="assets/photos/beatriz-editorial.webp" as="image" fetchpriority="high"><script src="assets/beatriz.js?v=${revision}" defer></script>`}</head>`;
const footer=(prefix='')=>`<footer class="footer"><div class="wrap footer-top">${brand(prefix)}<p>Roupa cuidada.<br>Mais tempo para si.</p><a class="footer-phone" href="tel:${b.phone}">${b.displayPhone}</a></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Engomadoria Beatriz Lavandaria</span><nav aria-label="Informação"><a href="${prefix}precos/">Preços</a><a href="${prefix}recolha-entrega-engomadoria-porto/">Recolha e entrega</a><a href="${prefix}perguntas-frequentes/">Perguntas frequentes</a><a href="${prefix}contactos/">Contactos</a></nav></div></footer>`;
const faqs=b.faq.map(([q,a])=>`<details><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('');
const logoPieces=[{x:0,y:0,w:460,h:630},...[[460,0,1076,220,11],[460,220,1076,236,7],[460,456,1076,174,10]].flatMap(([x,y,w,h,n])=>Array.from({length:n},(_,i)=>({x:x+i*w/n,y,w:w/n,h})))];
const assembledLogo=`<svg class="logo-assembly" viewBox="0 0 1536 630" aria-hidden="true"><defs>${logoPieces.map((p,i)=>`<clipPath id="logo-piece-${i}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/></clipPath>`).join('')}</defs>${logoPieces.map((p,i)=>`<g class="logo-piece" style="--delay:${(i===0?0:i*.025).toFixed(3)}s;--dx:${(i%2?1:-1)*(8+(i%5)*2)}px;--dy:${(i%3-1)*8}px;--turn:${(i%2?1:-1)*0}deg;transform-origin:${p.x+p.w/2}px ${p.y+p.h/2}px"><image href="assets/photos/beatriz-logo.webp?v=${revision}" width="1536" height="630" clip-path="url(#logo-piece-${i})"/></g>`).join('')}</svg>`;
const html=head('Engomadoria no Porto | Praça das Flores e recolha | Beatriz','Engomadoria na Praça das Flores 42, Porto. Packs de engomar e recolha no Grande Porto a partir de 25 peças. Lavandaria para Alojamento Local a 2 €/kg.')+`<body>${icons}<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<div class="intro intro-flow" tabindex="-1" role="dialog" aria-modal="true" aria-label="Bem-vindo à Engomadoria Beatriz"><div class="intro-stage"><video id="intro-video" muted playsinline preload="auto" poster="assets/photos/beatriz-flow-poster.webp" aria-hidden="true"><source src="assets/beatriz-intro-flow.mp4" type="video/mp4"></video><div class="intro-signature">${assembledLogo}</div><button class="intro-enter" id="intro-enter" type="button" aria-describedby="intro-enter-hint" hidden>ENTRAR</button><p class="intro-enter-hint" id="intro-enter-hint" hidden>A entrar automaticamente · toque para entrar já ↗</p></div></div>
<script>(function(){try{var p=new URLSearchParams(location.search);if(p.get('retorno')==='1'){document.querySelector('.intro')?.remove();history.replaceState(null,'',location.pathname+location.hash)}}catch(e){}})();</script>
<div class="announcement"><span class="announcement-steam" role="img" aria-label="Engomadoria até 72 horas. Recolha e entrega no Grande Porto."><span aria-hidden="true">Engomadoria até 72 horas.</span><span aria-hidden="true">Recolha e entrega · Grande Porto.</span></span><a href="${wa(generalMessage)}">Fale directamente com a Beatriz ${icon('wa')}</a></div>
<header class="header" id="inicio"><div class="wrap header-inner">${brand()}<nav class="desktop-nav" aria-label="Principal"><a href="#packs">Packs mensais</a><a href="#al">Alojamento Local</a><a href="#servicos">Serviços</a><a href="#parceiros">Parceiros</a><a href="#contacto">Contactos</a></nav><a class="button button-dark header-cta" href="${wa(generalMessage)}">Pedir no WhatsApp ${icon('wa')}</a><button class="menu-toggle" aria-controls="mobile-menu" aria-expanded="false" aria-label="Abrir menu"><span></span><span></span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Navegação móvel" hidden><a href="#packs">Packs mensais</a><a href="#al">Alojamento Local</a><a href="#servicos">Outros serviços</a><a href="#parceiros">Parceiros</a><a href="#contacto">Contactos e horário</a></nav></header>
<main id="conteudo">
<section class="hero" aria-labelledby="hero-title"><div class="hero-image"><img src="assets/photos/beatriz-editorial.webp" width="1536" height="1024" alt="Camisas cuidadas em tons claros e roupa dobrada" fetchpriority="high"></div><div class="wrap hero-inner"><div class="hero-copy"><p class="eyebrow">ENGOMADORIA & LAVANDARIA · 20 ANOS DE EXPERIÊNCIA</p><div class="hero-brand-motion motion-panel"><h1 id="hero-title" class="hero-steam-title" aria-label="A sua roupa. O nosso cuidado. Engomadoria até 72 horas."><span aria-hidden="true">A sua roupa.<br><em>O nosso cuidado.</em></span><span aria-hidden="true">Engomadoria até<br><em>72 horas.</em></span></h1></div><p class="hero-description">Tire a roupa da lista de tarefas.<br>Escolha o seu pack e fale com a Beatriz.</p><div class="hero-actions"><a class="button button-pink" href="#packs">Encontrar o meu pack ${icon('arrow')}</a><a class="text-link" href="${wa(generalMessage)}">Só tenho uma dúvida ${icon('wa')}</a></div><div class="hero-note">${icon('check')} Recolha e entrega no Grande Porto <span>·</span> mínimo 25 peças</div><a class="hero-al-link" href="#al"><span>Alojamento Local</span><strong>Serviço completo · 2 €/kg</strong>${icon('arrow')}</a><div class="hero-hours motion-panel"><p class="hero-hours-title">O seu dia, com mais tempo.</p><div class="hours-window"><div class="hours-track"><span>Segunda a sexta · 10:00–12:30 e 14:00–19:00 <b>✦</b> Sábado · 10:00–15:00 <b>✦</b> Domingos e feriados · Encerrado <b>✦</b> Roupa branca de Alojamento Local · 2 €/kg <b>✦</b> </span><span aria-hidden="true">Segunda a sexta · 10:00–12:30 e 14:00–19:00 <b>✦</b> Sábado · 10:00–15:00 <b>✦</b> Domingos e feriados · Encerrado <b>✦</b> Roupa branca de Alojamento Local · 2 €/kg <b>✦</b> </span></div></div></div></div><div class="hero-seal"><span>Um toque</span><strong>Beatriz</strong><span>em cada peça</span></div><span class="hero-caption">Vapor. Tempo. Cuidado.</span></div></section>
<div class="care-strip"><div class="wrap" tabindex="0" role="region" aria-label="Destaques dos serviços"><span>${icon('shirt')} Packs mensais para a sua rotina</span><span>${icon('spark')} Limpeza têxtil</span><span>${icon('wa')} Pedidos por WhatsApp</span></div></div>
<section class="packs section wrap" id="packs" aria-labelledby="packs-title"><div class="section-heading"><div><p class="eyebrow">PACKS MENSAIS DE ENGOMADORIA</p><h2 id="packs-title">Escolha o pack.<br><em>Nós tratamos do resto.</em></h2></div><p>Os preços são fixos. Para recolha e entrega ao domicílio, o serviço abrange o Grande Porto a partir de 25 peças.</p></div><div class="pack-options" role="group" aria-label="Escolher pack de engomadoria">${b.packs.map((p,i)=>`<button class="pack-option ${i===2?'selected':''}" type="button" data-pieces="${p.pieces}" data-price="${p.price}" aria-pressed="${i===2}">${i===2?'<span class="pack-tag">RECOMENDADO</span>':''}<span class="pack-count">${p.pieces}<small>peças</small></span><span class="pack-price">${p.price}<small> €</small></span><span class="pack-unit">${(Math.round(p.price*100/p.pieces)/100).toFixed(2).replace('.',',')} € / peça</span><span class="pack-check">${icon('check')}</span></button>`).join('')}</div>
<div class="pack-order"><div><span class="eyebrow">O SEU PACK</span><h3 id="pack-summary">60 peças · 69 €</h3><p>Escolha o pack e indique se pretende recolha e entrega. A Beatriz confirma consigo a disponibilidade e o prazo.</p></div><a class="button button-dark" id="pack-whatsapp" href="${wa(packMessage(b.packs[2]))}">Pedir este pack ${icon('wa')}</a></div><div class="pack-rules" aria-label="Condições dos packs"><span><strong>25 peças</strong>Mínimo para recolha e entrega no Grande Porto</span><span><strong>Até 72h</strong>Prazo habitual da engomadoria</span><span><strong>Peças grandes</strong>Contam como duas peças</span><span><strong>Pré-pagamento</strong>Dinheiro ou MB WAY</span></div><p class="pack-disclaimer">Alterações ou cancelamentos: até 24 horas antes. Tratamento de manchas tem preço próprio e pode aumentar o prazo.</p><p><a class="text-link" href="recolha-entrega-engomadoria-porto/">Como funciona a recolha e entrega no Grande Porto ${icon('arrow')}</a></p><p id="pack-status" class="sr-only" aria-live="polite"></p><noscript><div class="nojs-packs">${b.packs.map(p=>`<a href="${wa(packMessage(p))}">Pedir ${p.pieces} peças — ${p.price} €</a>`).join('')}</div></noscript>
</section>
<section class="beatriz-facts" aria-label="Como funciona"><div class="wrap beatriz-facts-grid"><div><small>RECOLHA & ENTREGA</small><strong>Grande Porto</strong><span>A partir de 25 peças.</span></div><div><small>ENGOMADORIA</small><strong>Até 72 horas</strong><span>Prazo habitual da engomadoria.</span></div><div><small>PAGAMENTO</small><strong>Pré-pagamento</strong><span>Dinheiro ou MB WAY.</span></div><div><small>ALTERAÇÕES</small><strong>24 horas</strong><span>Antecedência para alterar ou cancelar.</span></div></div></section>
<section class="partners-showcase" id="parceiros" aria-labelledby="partners-title"><div class="wrap partner-stage"><div class="partner-intro"><div class="partner-intro-main"><p class="eyebrow">PARCERIA LOCAL · PORTO E ARREDORES</p><h2 id="partners-title">Roupa tratada.<br><em>Casa impecável.</em></h2><span class="partner-bridge">DOIS CUIDADOS · CADA UM NA SUA ESPECIALIDADE</span></div><p class="partner-intro-copy">Enquanto a Beatriz cuida da sua roupa, o Grupo Elite Limpeza cuida do espaço. Uma parceria pensada para quem quer recuperar tempo sem baixar o nível de cuidado.</p></div><a class="partner-elite-panel partner-elite-v2" href="grupo-elite-limpeza/" aria-label="Conhecer os serviços do Grupo Elite Limpeza"><div class="partner-elite-media"><img src="https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?auto=format&fit=crop&fm=jpg&q=82&w=1600" alt="Serviço de limpeza profissional num espaço cuidado" loading="lazy"><span class="partner-elite-badge">PARCEIRO LOCAL</span><div class="partner-elite-logo-card partner-elite-wordmark"><small>GRUPO</small><strong>ELITE</strong><b>LIMPEZA</b></div></div><div class="partner-elite-v2-copy"><div class="partner-elite-v2-head"><span>GRUPO ELITE LIMPEZA</span><small>01 / PARCEIRO</small></div><h3>Limpeza pós-obra?<br><em>Peça orçamento.</em></h3><p class="partner-elite-adline"><strong>Terminou uma obra?</strong> Peça orçamento para a limpeza final. Também para Alojamento Local, comércio, casas e apartamentos no Porto e arredores.</p><p class="partner-elite-v2-line">Pós-obras · Alojamento Local · Comércio · Casas</p><div class="partner-elite-v2-footer"><div><small>CONTACTO DIRECTO</small><strong>928 402 547</strong></div><span>Ver serviços e pedir orçamento ${icon('arrow')}</span></div></div></a></div></section>
<section class="story section" id="galeria"><div class="wrap story-grid"><div class="story-copy"><img class="brand-reminder" src="assets/photos/beatriz-logo.webp?v=${revision}" width="1536" height="630" alt="Engomadoria Beatriz Lavandaria" loading="lazy"><p class="eyebrow">20 ANOS DE EXPERIÊNCIA</p><h2>Começou numa<br>brincadeira.<br><em>Ficou o gosto de servir.</em></h2><p>A Engomadoria Beatriz nasceu de forma simples: uma brincadeira tornou-se hobby e, com o tempo, trabalho do dia a dia. Há cerca de 20 anos que a D. Beatriz cuida da roupa de quem lhe confia cada peça.</p><a class="text-link" href="${wa(generalMessage)}">Falar com a Beatriz ${icon('arrow')}</a></div><div class="care-type motion-panel story-experience"><p class="eyebrow">EXPERIÊNCIA QUE SE NOTA NO CUIDADO</p><strong class="experience-number">20</strong><span class="experience-years">anos</span><p class="care-type-note">Preferências, tecidos e detalhes tratados caso a caso.</p></div></div></section>
<section class="al section" id="al"><div class="wrap al-grid"><div class="al-image"><img src="assets/photos/linen.webp" alt="Toalhas brancas dobradas para acolher hóspedes" width="1000" height="667" loading="lazy"><span>ALOJAMENTO LOCAL / SERVIÇO RECORRENTE</span></div><div class="al-copy"><p class="eyebrow">LAVANDARIA PARA ALOJAMENTO LOCAL</p><h2>Um preço por quilo.<br><em>O serviço completo.</em></h2><p>Para Alojamento Local, o serviço pode ser recorrente e é calculado ao quilo. O prazo é combinado conforme o volume e o serviço, em vez de assumir automaticamente as 72 horas da engomadoria.</p><div class="al-rate"><strong>2<span> €/kg</span></strong><span>Lavar · Secar<br>Dobrar · Engomar</span></div><div class="al-includes" aria-label="Incluído no serviço de Alojamento Local"><span>${icon('check')} Lavar</span><span>${icon('check')} Secar</span><span>${icon('check')} Dobrar</span><span>${icon('check')} Engomar</span></div><p class="al-example"><strong>Serviço recorrente disponível</strong><span>Também para cabeleireiros e outros negócios adequados ao serviço. Condições e prazo confirmados caso a caso.</span></p><a class="button button-pink" href="#pedido" data-intent="al">Pedir serviço para o meu Alojamento Local ${icon('arrow')}</a></div></div></section>
<section class="services section wrap" id="servicos"><div class="section-heading"><div><p class="eyebrow">MAIS DO QUE ENGOMAR</p><h2>Há mais roupa<br><em>que merece cuidado.</em></h2></div><p>Tratamento de manchas, peças especiais e limpeza têxtil são confirmados caso a caso. Alguns serviços recorrem a parceiro especializado e podem ter prazo e preço próprios.</p></div><div class="services-list">${b.services.map((name,i)=>`<a href="#pedido" class="service-row" data-intent="${escape(name)}"><h3>${name}</h3><span class="service-action">Consultar ${icon('arrow')}</span></a>`).join('')}</div><p class="service-footnote">Precisa de outro serviço? <a href="${wa('Olá, Beatriz! Gostaria de saber se fazem o seguinte serviço: ')}">Pergunte à Beatriz.</a></p></section>
<section class="request section" id="pedido"><div class="wrap request-grid"><div><p class="eyebrow">VAMOS TRATAR DISSO?</p><h2>O primeiro passo<br>é só uma<br><em>mensagem.</em></h2><p>Escolha o serviço. Acrescente o que precisa.<br>O seu pedido fica pronto para o WhatsApp.</p><p class="request-note">${icon('check')} Pedido pelo WhatsApp · serviço pré-pago em dinheiro ou MB WAY.</p></div><form class="request-card" id="request-form"><label for="service-select">De que precisa?</label><select id="service-select" name="service"><option value="pack">Pack mensal de engomadoria</option><option value="al">Roupa branca · Alojamento Local</option>${b.services.map(n=>`<option value="${escape(n)}">${n}</option>`).join('')}<option value="outro">Outro serviço / uma dúvida</option></select><div id="request-pack-field"><label for="request-pack">Escolha o seu pack mensal</label><select id="request-pack" name="pack">${b.packs.map(p=>`<option value="${p.pieces}" ${p.pieces===60?'selected':''}>${p.pieces} peças — ${p.price} €</option>`).join('')}</select></div><div id="request-al-field" hidden><label for="request-quantity">Quantidade aproximada (kg, opcional)</label><input id="request-quantity" name="quantity" type="number" min="0.5" max="10000" step="0.5" inputmode="decimal" placeholder="Ex.: 15"></div><label for="request-notes">Quer acrescentar alguma coisa? <span>(opcional)</span></label><textarea id="request-notes" name="notes" rows="2" maxlength="500" placeholder="A data pretendida, o tipo de roupa ou uma dúvida…"></textarea><div class="message-preview"><span>A SUA MENSAGEM</span><p id="message-preview">${packMessage(b.packs[2])}</p></div><a class="button button-pink request-submit" id="request-whatsapp" href="${wa(packMessage(b.packs[2]))}">Abrir o meu pedido no WhatsApp ${icon('wa')}</a><p class="form-note">Só envia a mensagem quando confirmar no WhatsApp.</p><noscript><p><a href="${wa(generalMessage)}">Contactar a Beatriz directamente no WhatsApp</a></p></noscript></form></div></section>
<section class="faq section wrap" id="faq"><div><p class="eyebrow">ANTES DE FALAR CONNOSCO</p><h2>As suas dúvidas.<br><em>Sem rodeios.</em></h2><a class="text-link" href="${wa('Olá, Beatriz! Tenho uma dúvida sobre os vossos serviços.')}">Perguntar à Beatriz ${icon('wa')}</a></div><div class="faq-list">${faqs}</div></section>
<section class="contact section" id="contacto"><div class="wrap contact-grid"><div><p class="eyebrow">O SEU CONTACTO DIRECTO</p><h2>Fale com<br><em>a Beatriz.</em></h2><a class="contact-phone" href="tel:${b.phone}">${b.displayPhone}</a><p class="contact-preference">Chamadas e novos pedidos: dias úteis até às 18:00.</p><div class="contact-actions"><a class="button button-pink" href="${wa(generalMessage)}">WhatsApp ${icon('wa')}</a><a class="button button-outline" href="tel:${b.phone}">Telefonar ${icon('phone')}</a></div></div><div class="hours"><h3>${icon('clock')} Quando nos encontra</h3><div><span>Segunda a sexta-feira</span><b>10:00–12:30<br>14:00–19:00</b></div><div><span>Sábado · loja</span><b>10:00–15:00</b></div><div><span>Domingos e feriados</span><b>Encerrado</b></div><p class="contact-address"><strong>Morada da loja:</strong> ${b.streetAddress}, ${b.city}.</p><a class="text-link" href="${escape(mapsUrl)}" target="_blank" rel="noopener noreferrer">Ver percurso no Google Maps ${icon('arrow')}</a></div></div></section>
</main>${footer()}<div class="mobile-dock"><a href="#packs">${icon('shirt')}<span>Ver packs</span></a><a href="${wa(generalMessage)}">${icon('wa')}<span>Falar com a Beatriz</span></a></div></body></html>`;
fs.writeFileSync('docs/index.html',html);
const subpages=[
 ['recolha-entrega-engomadoria-porto/',
 'Engomadoria com recolha e entrega no Porto | Beatriz',
 'Recolha e entrega de roupa para engomadoria no Grande Porto, a partir de 25 peças. Consulte os packs mensais e confirme a disponibilidade por WhatsApp.',
 `<p class="eyebrow">RECOLHA E ENTREGA DE ROUPA · GRANDE PORTO</p>
 <h1>Engomadoria com recolha e entrega<br><em>no Grande Porto.</em></h1>
 <p>Se precisa de passar roupa a ferro, pode escolher um pack mensal da Engomadoria Beatriz e pedir a recolha e entrega ao domicílio. O serviço abrange zonas do Grande Porto, mediante confirmação da morada e da disponibilidade.</p>
 <h2>Como funciona a recolha e entrega?</h2>
 <div class="hours"><div><span>1. Escolher o serviço</span><b>Veja os packs mensais de engomadoria.</b></div><div><span>2. Confirmar a morada</span><b>A recolha e entrega exige pelo menos 25 peças.</b></div><div><span>3. Combinar os detalhes</span><b>A Beatriz confirma o dia, a disponibilidade e o prazo.</b></div><div><span>4. Preparar o pedido</span><b>Pagamento antecipado em dinheiro ou MB WAY.</b></div></div>
 <h2>Preços, quantidades e prazos</h2>
 <p>Os packs mensais incluem 20 peças por 29 €, 40 peças por 49 €, 60 peças por 69 € e 80 peças por 89 €. O pack de 20 peças não atinge, por si só, o mínimo de 25 peças para recolha e entrega. As peças de maior dimensão contam como duas. Consulte todas as opções na <a href="../precos/">página de preços</a>.</p>
 <p>O prazo habitual da engomadoria é de até 72 horas; as condições específicas de recolha, entrega e serviços especiais devem ser confirmadas antes do pedido. Alterações ou cancelamentos devem ser comunicados com pelo menos 24 horas de antecedência.</p>
 <h2>Onde fica a loja?</h2>
 <p>A Engomadoria Beatriz recebe clientes na <strong>Praça das Flores 42, Porto</strong>. Também pode deixar e levantar a roupa diretamente na loja, dentro do <a href="../contactos/">horário publicado</a>.</p>
 <h2>Confirme a recolha e entrega para a sua zona</h2>
 <p>Indique o local da recolha, a quantidade aproximada de peças e a data pretendida. A confirmação do serviço é feita diretamente pela Beatriz.</p>
 <a class="button button-pink" href="${wa('Olá, Beatriz! Preciso de engomadoria com recolha e entrega. A minha zona é: [indicar zona]. Tenho cerca de [indicar quantidade] peças. Podem confirmar disponibilidade e condições?')}">Pedir confirmação no WhatsApp ${icon('wa')}</a>`],
 ['precos/','Preços dos packs mensais | Engomadoria Beatriz','Packs mensais de 20, 40, 60 e 80 peças. Recolha e entrega no Grande Porto a partir de 25 peças. Consulte preços e condições.',`<p class="eyebrow">PACKS MENSAIS</p><h1>Um pack mensal para<br><em>a sua rotina.</em></h1><p>Preços fixos: escolha a quantidade de roupa e fale com a Beatriz. A recolha e entrega está disponível no Grande Porto a partir de 25 peças.</p><div class="sub-prices">${b.packs.map(p=>`<a href="${wa(packMessage(p))}"><strong>${p.pieces} peças</strong><b>${p.price} €</b><span>Pedir no WhatsApp ${icon('wa')}</span></a>`).join('')}</div><p><strong>Como contamos:</strong> peças de maior dimensão contam como duas peças. Engomadoria: prazo habitual até 72 horas. Pagamento antecipado em dinheiro ou MB WAY.</p><h2>Alojamento Local</h2><p>Serviço completo a <strong>2 €/kg</strong>: lavar, secar, dobrar e engomar. Pode ser recorrente; o prazo é confirmado conforme o volume e o serviço.</p><a class="button button-pink" href="${wa('Olá, Beatriz! Gostaria de informações sobre o serviço completo para Alojamento Local a 2 €/kg.')}">Consultar condições ${icon('wa')}</a>`],
 ['perguntas-frequentes/','Perguntas frequentes | Engomadoria Beatriz','Respostas sobre packs de engomadoria, roupa branca para Alojamento Local, limpeza têxtil, horário e pedidos por WhatsApp.',`<p class="eyebrow">INFORMAÇÃO DIRECTA</p><h1>As suas dúvidas.<br><em>Sem rodeios.</em></h1><div class="faq-list">${faqs}</div>`],
 ['contactos/','Engomadoria na Praça das Flores, Porto | Contactos','Loja de engomadoria na Praça das Flores 42, Porto. Consulte morada, horário, telefone e WhatsApp da Engomadoria Beatriz.',`<p class="eyebrow">ENGOMADORIA BEATRIZ</p><h1>Fale com<br><em>a Beatriz.</em></h1><p class="contact-phone"><a href="tel:${b.phone}">${b.displayPhone}</a></p><a class="button button-pink" href="${wa(generalMessage)}">Abrir WhatsApp ${icon('wa')}</a><div class="hours"><h2>Horário</h2><div><span>Segunda a sexta-feira</span><b>10:00–12:30 e 14:00–19:00</b></div><div><span>Sábado · loja</span><b>10:00–15:00</b></div><div><span>Domingos e feriados</span><b>Encerrado</b></div></div><p><strong>Chamadas e novos pedidos:</strong> prefira dias úteis até às 18:00.</p><h2>Morada da loja no Porto</h2><p>Visite a Engomadoria Beatriz em <strong>${b.streetAddress}, ${b.city}</strong>. Consulte o horário antes de se deslocar.</p><p class="contact-address"><strong>Morada da loja:</strong> ${b.streetAddress}, ${b.city}.</p><a class="text-link" href="${escape(mapsUrl)}" target="_blank" rel="noopener noreferrer">Ver percurso no Google Maps ${icon('arrow')}</a>`]
];
for(const [route,title,desc,body] of subpages){fs.mkdirSync('docs/'+route,{recursive:true});fs.writeFileSync('docs/'+route+'index.html',head(title,desc,route)+`<body class="subpage">${icons}<header class="header"><div class="wrap header-inner">${brand('../')}<a class="text-link" href="../">Voltar ao início ${icon('arrow')}</a><a class="button button-dark header-cta" href="${wa(generalMessage)}">WhatsApp ${icon('wa')}</a></div></header><main class="wrap sub-content">${body}</main>${footer('../')}<script>
(function(){
  var bar=document.querySelector('.el15-mobile-cta');
  var hero=document.querySelector('.el9-hero');
  var contact=document.querySelector('#contactos');
  if(!bar||!hero||!contact||!('IntersectionObserver' in window))return;
  var pastHero=false,contactVisible=false;
  function update(){bar.hidden=!pastHero||contactVisible;}
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.target===hero)pastHero=!entry.isIntersecting&&entry.boundingClientRect.bottom<=68;
      if(entry.target===contact)contactVisible=entry.isIntersecting;
    });
    update();
  },{rootMargin:'-68px 0px 0px 0px'});
  observer.observe(hero);observer.observe(contact);
})();
</script>
</body></html>`);}

const eliteRoute='grupo-elite-limpeza/';
const eliteUrl=b.url+eliteRoute;
const elitePhone='+351928402547';
const eliteDisplayPhone='928 402 547';
const eliteWa=(message)=>`https://wa.me/351928402547?text=${encodeURIComponent(message)}`;
const eliteServices=[
  {name:'Limpezas pós-obras',copy:'Limpeza final para retirar pó, resíduos e marcas da obra e deixar o espaço pronto a usar.',img:'https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?auto=format&fit=crop&fm=jpg&q=84&w=1800'},
  {name:'Alojamento Local & Airbnb',copy:'Limpeza e preparação do espaço entre estadias, para receber os próximos hóspedes com o espaço cuidado.',img:'../assets/photos/elite-al-quarto-duplo.webp'},
  {name:'Estabelecimentos comerciais',copy:'Limpeza profissional para lojas, escritórios e outros espaços comerciais.',img:'https://images.unsplash.com/photo-1769053202058-74062e1f1530?auto=format&fit=crop&fm=jpg&q=82&w=1800'},
  {name:'Casas e apartamentos',copy:'Limpeza regular ou pontual para a sua casa.'},
  {name:'Limpezas gerais e profundas',copy:'Mais higiene, cuidado e atenção aos detalhes.'},
  {name:'Vidros e persianas',copy:'Limpeza cuidada de vidros e persianas.'},
  {name:'Check-in & Check-out',copy:'Apoio de limpeza para Alojamento Local.'},
  {"name":"Condomínios, garagens e escadas","copy":"Limpeza de áreas comuns e espaços de condomínio."},
  {"name":"Ginásios e empresas","copy":"Limpeza de instalações e espaços de trabalho."},
  {"name":"Remodelações e restauros","copy":"Remodelações em propriedades, canalização e electricidade."},
  {"name":"Jardins e jardinagem","copy":"Limpeza de jardins e serviços de jardinagem."}
];
const eliteEmail='grupoelitelimpeza@gmail.com';
const eliteLogo=`<img class="el4-logo-img" src="../assets/photos/elite-logo.webp?v=${revision}" width="1536" height="1024" alt="Grupo Elite Limpeza">`;
const eliteSchema={'@context':'https://schema.org','@type':'ProfessionalService','@id':eliteUrl+'#negocio',name:'Grupo Elite Limpeza',url:eliteUrl,telephone:elitePhone,email:eliteEmail,areaServed:'Porto e arredores',slogan:'Limpeza profissional',hasOfferCatalog:{'@type':'OfferCatalog',name:'Serviços de limpeza profissional',itemListElement:eliteServices.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.name}}))}};
const eliteFeatured=eliteServices.slice(0,3);
const eliteMore=eliteServices.slice(3);

fs.mkdirSync('docs/'+eliteRoute,{recursive:true});
fs.writeFileSync('docs/'+eliteRoute+'index.html',`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#071f34"><title>Limpezas pós-obras e Alojamento Local | Grupo Elite Limpeza</title><meta name="description" content="Peça orçamento ao Grupo Elite Limpeza para limpezas pós-obras, Alojamento Local, comércio, casas e apartamentos no Porto e arredores."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${eliteUrl}"><link rel="preconnect" href="https://images.unsplash.com"><link rel="stylesheet" href="../assets/beatriz.css?v=${revision}"><link rel="stylesheet" href="../assets/elite-entry.css?v=20261006b"><script type="application/ld+json">${JSON.stringify(eliteSchema)}</script></head><body class="elite-page el4 el5 el9">${icons}

<header class="el9-header">
  <div class="el4-shell el9-header-inner">
    <a class="el9-back" href="../?retorno=1#parceiros" aria-label="Voltar à Engomadoria Beatriz">${icon('arrow')}<span>Beatriz</span></a>
    <a class="el9-wordmark" href="#inicio" aria-label="Grupo Elite Limpeza — início"><small>GRUPO</small><strong>ELITE</strong><b>LIMPEZA</b></a>
    <nav class="el9-nav" aria-label="Principal"><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#contactos">Contacto</a></nav>
    <a class="el9-phone" href="tel:${elitePhone}"><small>PORTO E ARREDORES</small><strong>${eliteDisplayPhone}</strong></a>
    <a class="el9-cta" href="#contactos">Contacto ${icon('arrow')}</a>
  </div>
</header>

<main id="inicio">
<section class="el9-hero">
  <figure class="el9-hero-photo">
    <img src="https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?auto=format&fit=crop&fm=jpg&q=88&w=2600" alt="Profissional a efectuar um serviço de limpeza num espaço doméstico" fetchpriority="high">
  </figure>
  <div class="el9-hero-shade" aria-hidden="true"></div>
  <div class="el4-shell el9-hero-content">
    <div class="el9-hero-copy el10-hero-copy">
      <p class="el16-location">Porto e arredores · Limpeza pós-obra</p>
      <h1 class="el16-title"><span>Obra terminada.</span><em>Espaço pronto.</em></h1>
      <p class="el16-lead">Do pó aos últimos detalhes, tratamos da limpeza final da sua obra.</p>
      <div class="el9-actions el10-actions">
        <a class="el9-primary" href="${eliteWa('Olá, Grupo Elite Limpeza! Gostaria de pedir um orçamento para uma limpeza pós-obra.')}">Pedir orçamento ${icon('wa')}</a>
        <a class="el9-secondary" href="tel:${elitePhone}">${icon('phone')} ${eliteDisplayPhone}</a>
      </div>
      <div class="el16-other"><span>Também cuidamos do seu espaço:</span><a href="#servico-al">Alojamento Local</a><a href="#servico-comercio">Comércio</a><a href="#outros-servicos">Casas</a></div>
    </div>
    <div class="el9-sidecard">
      <span>DETALHE</span>
      <img src="https://images.unsplash.com/photo-1769053202058-74062e1f1530?auto=format&fit=crop&fm=jpg&q=86&w=1200" alt="Espaço profissional pronto depois da limpeza" loading="eager">
      <strong>Obra terminada.<br>Espaço pronto.</strong>
    </div>
  </div>
</section>

<section class="el15-intent" aria-label="Serviços mais procurados">
  <div class="el4-shell el15-intent-grid">
    <a class="el15-intent-main" href="${eliteWa('Olá, Grupo Elite Limpeza! Terminei uma obra e gostaria de pedir orçamento para a limpeza pós-obra.')}"><small>TERMINOU UMA OBRA?</small><strong>Pedir orçamento pós-obra</strong><span>Porto e arredores ${icon('arrow')}</span></a>
    <a href="${eliteWa('Olá, Grupo Elite Limpeza! Gostaria de pedir orçamento para limpeza de Alojamento Local / Airbnb.')}"><small>ALOJAMENTO LOCAL</small><strong>Preparar o espaço entre estadias</strong><span>Pedir orçamento ${icon('arrow')}</span></a>
    <a href="${eliteWa('Olá, Grupo Elite Limpeza! Gostaria de pedir orçamento para a limpeza de um espaço comercial.')}"><small>COMÉRCIO</small><strong>Lojas, escritórios e espaços profissionais</strong><span>Pedir orçamento ${icon('arrow')}</span></a>
  </div>
</section>

<section class="el5-campaign" aria-label="Limpezas pós-obras Grupo Elite">
  <div class="el4-shell el5-campaign-grid">
    <figure class="el5-campaign-media">
      <img src="https://images.unsplash.com/photo-1769053202058-74062e1f1530?auto=format&fit=crop&fm=jpg&q=86&w=2000" alt="Espaço limpo e preparado depois de uma obra" loading="lazy">
      <span>DETALHE</span>
    </figure>
    <div class="el5-campaign-copy">
      <p class="el4-overline">LIMPEZA PÓS-OBRA</p>
      <h2>Da obra feita<br><em>ao espaço pronto.</em></h2>
      <p>Depois dos trabalhos, fica o pó, os resíduos e a limpeza de detalhe. Tratamos da fase final para o espaço ficar preparado para entregar, abrir ou habitar.</p>
      <a class="el5-text-cta" href="${eliteWa('Olá, Grupo Elite Limpeza! Terminei uma obra e gostaria de pedir um orçamento para a limpeza final.')}">Pedir limpeza pós-obra ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="el13-services" id="servicos">
  <div class="el4-shell">
    <div class="el13-heading">
      <p class="el4-overline">POR ORDEM DE FOCO</p>
      <h2>Escolha o serviço.<br><em>Peça orçamento.</em></h2>
      <p>Pós-obras, Alojamento Local e espaços comerciais são os serviços em destaque. Mais abaixo encontra também casas, limpezas profundas, vidros e check-in/check-out.</p>
    </div>

    <div class="el13-sequence">
      ${eliteFeatured.map((s,i)=>`<article class="el13-row ${i%2===1?'is-reverse':''}" id="${['servico-obra','servico-al','servico-comercio'][i]}">
        <figure class="el13-media"><img src="${s.img}" alt="${s.name}" loading="lazy"></figure>
        <div class="el13-copy">
          <div class="el13-index">0${i+1}</div>
          <h3>${s.name}</h3>
          <p>${s.copy}</p>
          <a href="${eliteWa(`Olá, Grupo Elite Limpeza! Gostaria de informações sobre ${s.name}.`)}">Pedir orçamento ${icon('arrow')}</a>
        </div>
      </article>`).join('')}
    </div>

    <section class="el16-al-gallery" aria-labelledby="el16-gallery-title">
      <p class="el4-overline">ALOJAMENTO LOCAL</p>
      <h3 id="el16-gallery-title">O cuidado vê-se no espaço.</h3>
      <div class="el16-photo-grid">
        <figure><img src="../assets/photos/elite-al-quarto-duplo.webp" width="688" height="388" alt="Quarto de Alojamento Local com duas camas preparadas e toalhas" loading="lazy"><figcaption>Quartos preparados</figcaption></figure>
        <figure><img src="../assets/photos/elite-al-quarto-casal.webp" width="688" height="388" alt="Quarto de Alojamento Local com cama de casal e toalhas" loading="lazy"><figcaption>Atenção aos detalhes</figcaption></figure>
        <figure><img src="../assets/photos/elite-al-exterior.webp" width="688" height="388" alt="Espaço exterior de Alojamento Local com piscina e espreguiçadeiras" loading="lazy"><figcaption>Espaços exteriores</figcaption></figure>
      </div>
    </section>

    <div class="el13-more" id="outros-servicos">
      <div>
        <p class="el4-overline">OUTROS SERVIÇOS</p>
        <h3>Também tratamos do resto.</h3>
      </div>
      <div class="el13-more-list">
        ${eliteMore.map(s=>`<a href="${eliteWa(`Olá, Grupo Elite Limpeza! Gostaria de informações sobre ${s.name}.`)}">${s.name}${icon('arrow')}</a>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="el4-about" id="sobre">
  <div class="el4-shell el4-about-grid">
    <div class="el4-about-mark">
      <span>GRUPO</span><strong>ELITE</strong><b>LIMPEZA</b>
      <small>PORTO E ARREDORES</small>
    </div>
    <div class="el4-about-copy">
      <p class="el4-overline">GRUPO ELITE LIMPEZA · PORTO</p>
      <h2>Uma equipa.<br>Vários <em>cuidados.</em></h2>
      <p>Somos uma equipa de profissionais de limpeza no Porto. Cuidamos de alojamentos locais, condomínios, escritórios, apartamentos, moradias, garagens, escadas, espaços comerciais, ginásios e empresas.</p><p>Também fazemos remodelações e restauros, canalização, electricidade, limpeza de jardins e jardinagem. A engomadoria e a lavandaria ficam a cargo da nossa parceira, a Engomadoria Beatriz.</p>
      <div class="el13-about-list">${eliteServices.map(s=>`<span>${s.name}</span>`).join('')}</div>
    </div>
  </div>
</section>

<section class="el4-cta" id="contactos">
  <div class="el4-shell el4-cta-grid">
    <div><p class="el4-overline">ORÇAMENTO DIRECTO</p><h2>Precisa de limpeza?<br><em>Peça orçamento.</em></h2><p>Diga-nos o tipo de espaço e o serviço de que precisa. A disponibilidade e o orçamento são confirmados directamente consigo.</p></div>
    <div class="el4-contact-card">
      <span>CONTACTO</span>
      <a href="tel:${elitePhone}">${eliteDisplayPhone}</a>
      <small>Porto e arredores</small>
      <a class="el16-email" href="mailto:grupoelitelimpeza@gmail.com">grupoelitelimpeza@gmail.com</a>
      <a class="el4-btn el4-btn-light" href="${eliteWa('Olá, Grupo Elite Limpeza! Gostaria de pedir um orçamento.')}">Pedir orçamento no WhatsApp ${icon('wa')}</a>
    </div>
  </div>
</section>
</main>

<footer class="el9-footer">
  <div class="el4-shell el9-footer-grid">
    <a class="el9-wordmark el9-wordmark-footer" href="#inicio"><small>GRUPO</small><strong>ELITE</strong><b>LIMPEZA</b></a>
    <p>Limpeza profissional<br>Porto e arredores.</p>
    <nav><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#contactos">Contacto</a></nav>
    <a class="el9-footer-phone" href="tel:${elitePhone}">${eliteDisplayPhone}</a>
  </div>
</footer>
<a class="el15-mobile-cta" hidden href="${eliteWa('Olá, Grupo Elite Limpeza! Gostaria de pedir um orçamento.')}">Pedir orçamento ${icon('wa')}</a>

</body></html>`);

fs.copyFileSync('src/beatriz.css','docs/assets/beatriz.css');
await build({entryPoints:['src/beatriz.js'],bundle:true,minify:true,format:'iife',target:['safari15','chrome100','firefox100'],outfile:'docs/assets/beatriz.js'});
fs.writeFileSync('docs/assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#cf2465"/><text x="32" y="47" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="48" fill="white">B</text></svg>');
fs.writeFileSync('docs/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${b.url}sitemap.xml\n`);
fs.writeFileSync('docs/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...subpages.map(p=>p[0]),eliteRoute].map(route=>`<url><loc>${b.url+route}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync('docs/llms.txt',`# Engomadoria Beatriz Lavandaria

> Engomadoria com cerca de 20 anos de experiência, packs mensais, recolha e entrega no Grande Porto a partir de 25 peças, lavandaria para Alojamento Local e serviços de limpeza têxtil. Pedidos por WhatsApp.

## Contacto
- Morada da loja: ${b.streetAddress}, ${b.city}.
- Telefone: ${b.displayPhone}
- WhatsApp: https://wa.me/351923250845
- Para chamadas e novos pedidos: preferencialmente dias úteis até às 18:00.

## Packs mensais
${b.packs.map(p=>`- ${p.pieces} peças: ${p.price} €`).join('\n')}
- Preços fixos.
- Cada peça fica entre 1,11 € e 1,45 €, conforme o pack.
- Peças de maior dimensão contam como duas peças.
- Engomadoria: prazo habitual até 72 horas.
- Pagamento: pré-pagamento em dinheiro ou MB WAY.

## Recolha e entrega
- Área: Grande Porto.
- Mínimo: 25 peças por serviço de recolha/entrega.
- Alterações ou cancelamentos: mínimo 24 horas de antecedência.

## Alojamento Local
- Serviço completo: 2 €/kg.
- Inclui lavar, secar, dobrar e engomar.
- Serviço recorrente disponível.
- O prazo é confirmado conforme o volume e o serviço.

## Serviços adicionais
- Tratamento de manchas disponível com preço próprio e possível aumento de prazo.
- ${b.services.join('\n- ')}
- Alguns serviços recorrem a parceiro especializado; prazo e orçamento são confirmados antes de avançar.
- O cliente pode indicar preferências de preparação, como cabides, roupa dobrada e cuidados específicos.

## Horário da loja
- Segunda a sexta-feira: 10:00–12:30 e 14:00–19:00
- Sábado: 10:00–15:00
- Domingos e feriados: encerrado

## Páginas
- [Packs e serviços](${b.url})
- [Preços](${b.url}precos/)
- [Recolha e entrega no Grande Porto](${b.url}recolha-entrega-engomadoria-porto/)
- [Perguntas frequentes](${b.url}perguntas-frequentes/)
- [Contactos](${b.url}contactos/)
`);
console.log('Built 4 static pages, bundled Motion, sitemap and llms.txt.');
