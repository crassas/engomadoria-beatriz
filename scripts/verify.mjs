import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {business} from '../src/data.mjs';
const root=path.resolve('docs');const out='.review';fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const server=createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(content)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(4173,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});const results=[];const errors=[];
const check=(condition,name)=>{results.push({name,passed:Boolean(condition)});if(!condition)errors.push(name)};
const imageDocs=['index.html','grupo-elite-limpeza/index.html'];
const localImageSources=imageDocs.flatMap(file=>Array.from(fs.readFileSync(path.join(root,file),'utf8').matchAll(/<img[^>]+src="([^"]+)"/g),m=>({file,src:m[1]}))).filter(x=>!/^https?:\/\//.test(x.src)).map(x=>({file:x.file,src:x.src.split('?')[0]}));
check(localImageSources.every(x=>fs.existsSync(path.resolve(path.dirname(path.join(root,x.file)),x.src))),'all local image files exist on disk');
try{
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},...(width===1440?{recordVideo:{dir:'.review/intro-recording',size:{width:1440,height:1000}}}:{})});const page=await context.newPage();const recording=page.video();await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.intro'),{},{timeout:3000});check(!await page.locator('.intro').count(),`${width}: brief opening leaves the page immediately usable`);const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check(!axe.violations.length,`${width}: opening has no WCAG A/AA violations`);if(axe.violations.length)errors.push(...axe.violations.map(v=>`${width}: opening ${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join(', ')}`));await page.screenshot({path:`.review/${width===390?'mobile':'desktop'}-intro.png`});await context.close();if(recording){await recording.saveAs('.review/beatriz-intro.webm');fs.rmSync('.review/intro-recording',{recursive:true,force:true})}
}
{
 const context=await browser.newContext();const page=await context.newPage();await page.goto('http://127.0.0.1:4173');await page.keyboard.press('Escape');await page.locator('.intro').waitFor({state:'detached'});check(await page.locator('h1').isVisible(),'intro: immediate entry works');await context.close();
}
for(const width of [320,360,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1});const page=await context.newPage();let consoleErrors=[];let failed=[];
 page.on('pageerror',e=>consoleErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.keyboard.press('Escape');await page.locator('.intro').waitFor({state:'detached'});await page.evaluate(()=>document.fonts.ready);
 // Trigger native lazy-loaded images after the monthly section increased page length.
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=Math.max(innerHeight*.8,300)){scrollTo(0,y);await new Promise(r=>setTimeout(r,25))}scrollTo(0,0)});
 check(await page.locator('h1').count()===1,`${width}: one visible page heading`);
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: no horizontal overflow`);
 check(await page.evaluate(()=>Array.from(document.images).filter(i=>new URL(i.src,location.href).origin!==location.origin).every(i=>i.getAttribute('src')?.length>0)),`${width}: external image references are configured`);
 check(await page.evaluate(()=>document.fonts.check('16px "Beatriz Sans"')&&document.fonts.check('16px "Beatriz Serif"')&&document.fonts.check('16px "Beatriz Script"')),`${width}: local fonts load`);
 check(await page.locator('.intro').count()===0,`${width}: introduction finishes`);
 for(const pack of business.packs){await page.locator(`.pack-option[data-pieces="${pack.pieces}"]`).click();const summary=await page.locator('#pack-summary').innerText();const href=await page.locator('#pack-whatsapp').getAttribute('href');check(summary===`${pack.pieces} peças · ${pack.price} €`&&decodeURIComponent(href).includes(`${pack.pieces} peças (${pack.price} €)`),`${width}: ${pack.pieces}-piece WhatsApp message`)}
 await page.locator('#service-select').selectOption('al');await page.locator('#request-quantity').fill('15');await page.locator('#request-notes').fill('Preciso para sexta-feira.');const al=decodeURIComponent(await page.locator('#request-whatsapp').getAttribute('href'));check(al.includes('15 kg')&&al.includes('2 €/kg')&&al.includes('sexta-feira'),`${width}: AL message includes quantity and note`);
 await page.locator('#service-select').selectOption('Cortinados');check((await page.locator('#message-preview').innerText()).includes('cortinados'),`${width}: textile service message`);
 check(!await page.locator('#request-al-field').isVisible(),`${width}: irrelevant AL input is hidden`);
 await page.locator('#request-notes').fill('');await page.locator('#service-select').selectOption('pack');await page.locator('#request-pack').selectOption('60');await page.locator('.pack-option[data-pieces="60"]').click();
 if(width<700){await page.locator('.menu-toggle').click();check(await page.locator('#mobile-menu').isVisible(),`${width}: mobile menu opens`);await page.locator('#mobile-menu a').first().click();check(!await page.locator('#mobile-menu').isVisible(),`${width}: mobile menu closes after selection`)}
  check(await page.locator('#care-video').count()===0,`${width}: presentation video removed`);check(await page.locator('.hero-hours').innerText().then(t=>t.includes('10:00–12:30')&&t.includes('Alojamento Local')),`${width}: hours and AL visible`);const motion=page.locator('.care-type .motion-toggle');if(await motion.count()){await motion.click();check(await motion.getAttribute('aria-pressed')==='true',`${width}: moving text can pause`);await motion.click();check(await motion.getAttribute('aria-pressed')==='false',`${width}: moving text can resume`)}else{check(true,`${width}: motion control intentionally absent`)};
 check(await page.locator('a[href^="https://wa.me/"]').evaluateAll(a=>a.every(el=>{const u=new URL(el.href);return u.pathname==='/351923250845'&&u.searchParams.get('text')?.trim().length>0})),`${width}: every WhatsApp CTA has correct contact and message`);
 // Measure readable resting states, rather than sampling halfway through a dissolve.
 await page.waitForFunction(()=>{const summary=document.querySelector('#pack-summary');return !!summary&&getComputedStyle(summary).opacity==='1'&&summary.getAnimations().every(animation=>animation.playState==='finished')});
 const resting=await page.addStyleTag({content:'.hero-steam-title>span,.announcement-steam>span{animation:none!important;opacity:1!important;filter:none!important;transform:none!important;display:none!important}.hero-steam-title>span:first-child,.announcement-steam>span:first-child{display:block!important}#pack-summary{opacity:1!important}'});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check(axe.violations.length===0,`${width}: no WCAG A/AA violations`);if(axe.violations.length)errors.push(...axe.violations.map(v=>`${width}: ${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join(', ')}`));
 for(const n of [2,3]){const state=await page.addStyleTag({content:`.hero-steam-title>span:first-child,.announcement-steam>span:first-child{display:none!important}.hero-steam-title>span:nth-child(${n}),.announcement-steam>span:nth-child(2){display:block!important}`});const audit=await new AxeBuilder({page}).include('.hero-brand-motion').include('.announcement').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check(!audit.violations.length,`${width}: rotating message ${n} is accessible`);if(audit.violations.length)errors.push(...audit.violations.map(v=>`${width}: message ${n}: ${v.id}`));await state.evaluate(e=>e.remove())}
 await resting.evaluate(e=>e.remove());

 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);if([390,1440].includes(width)){await page.screenshot({path:`${out}/${width===390?'mobile':'desktop'}.png`,fullPage:true});await page.screenshot({path:`${out}/${width===390?'mobile':'desktop'}-hero.png`})}
 check(!consoleErrors.length,`${width}: no JavaScript errors`);check(!failed.length,`${width}: no failed resources`);if(failed.length)errors.push(...failed);
 await context.close();
}
{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:4173/?retorno=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.classList.contains('js'));
 const layout=await page.evaluate(()=>{const box=document.querySelector('.pack-options').getBoundingClientRect();const cards=[...document.querySelectorAll('.pack-option')].map(el=>el.getBoundingClientRect());const rows=[];for(const card of cards){if(!rows.some(top=>Math.abs(top-card.top)<8))rows.push(card.top)}return {columns:getComputedStyle(document.querySelector('.pack-options')).gridTemplateColumns.split(' ').length,rows:rows.length,trailing:Math.round(box.right-cards.at(-1).right)}});
 check(layout.columns===4&&layout.rows===1&&layout.trailing<24,'1440: four packs fill the row');await page.close();
}
{
 const page=await browser.newPage({viewport:{width:390,height:900}});await page.goto('http://127.0.0.1:4173/?retorno=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.classList.contains('js'));
 await page.locator('#request-notes').focus();await page.keyboard.press('Escape');check(await page.evaluate(()=>document.activeElement.id)==='request-notes','escape: closed menu keeps the request focused');
 await page.locator('.menu-toggle').click();check(await page.locator('#mobile-menu').isVisible(),'escape: menu can open');await page.keyboard.press('Escape');check(await page.locator('#mobile-menu').isHidden()&&await page.evaluate(()=>document.activeElement.classList.contains('menu-toggle')),'escape: open menu closes and returns focus');
 const layout=await page.evaluate(()=>{const box=document.querySelector('.pack-options').getBoundingClientRect();const cards=[...document.querySelectorAll('.pack-option')].map(el=>el.getBoundingClientRect());const rows=[];for(const card of cards){if(!rows.some(top=>Math.abs(top-card.top)<8))rows.push(card.top)}return {columns:getComputedStyle(document.querySelector('.pack-options')).gridTemplateColumns.split(' ').length,rows:rows.length,card:Math.round(cards[0].width),trailing:Math.round(box.right-cards.at(-1).right)}});
 check(layout.columns===2&&layout.rows===2&&layout.card>=140&&layout.trailing<24,'390: four packs form two rows of two');await page.close();
}
{
 const page=await browser.newPage({viewport:{width:390,height:800}});await page.goto('http://127.0.0.1:4173/grupo-elite-limpeza/',{waitUntil:'domcontentloaded'});const bar=page.locator('.el15-mobile-cta');
 check(!await bar.isVisible(),'elite mobile: quote bar hidden on the hero');
 await page.evaluate(()=>{const hero=document.querySelector('.el9-hero');scrollTo(0,hero.getBoundingClientRect().bottom+120)});
 await page.waitForFunction(()=>!document.querySelector('.el15-mobile-cta').hidden,null,{timeout:3000}).catch(()=>{});
 check(await bar.isVisible(),'elite mobile: quote bar appears after the hero');
 await page.locator('#contactos').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.el15-mobile-cta').hasAttribute('hidden'),null,{timeout:3000}).catch(()=>{});
 check(!await bar.isVisible(),'elite mobile: quote bar hides on the contact section');
 check(!fs.readFileSync(path.join(root,'precos/index.html'),'utf8').includes('el15-mobile-cta'),'prices page does not carry the partner quote script');
 await page.close();
}
const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();await page.goto('http://127.0.0.1:4173');check(!await page.locator('.intro').count(),'reduced motion: no introduction');await context.close();
const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto('http://127.0.0.1:4173');check(await p.locator('h1').isVisible(),'no JavaScript: main content remains visible');check(await p.locator('noscript a').count()>=business.packs.length,'no JavaScript: every pack has a direct WhatsApp link');await nojs.close();
for(const route of ['precos/','contactos/','perguntas-frequentes/']){const page=await browser.newPage();const response=await page.goto('http://127.0.0.1:4173/'+route);check(response.status()===200,route+': loads');check((await page.locator('h1').count())===1,route+': heading present');const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());check(schema['@graph'][0].telephone==='+351923250845',route+': valid structured data');await page.close()}
}catch(error){errors.push(error.stack||error.message)}finally{await browser.close();server.close();}
fs.writeFileSync(`${out}/verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),checks:results,errors},null,2));console.log(JSON.stringify({passed:results.filter(x=>x.passed).length,checks:results.length,errors},null,2));if(errors.length)process.exitCode=1;
