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
try{
for(const width of [320,360,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1});const page=await context.newPage();let consoleErrors=[];let failed=[];
 page.on('pageerror',e=>consoleErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForTimeout(2100);await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('h1').count()===1,`${width}: one visible page heading`);
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: no horizontal overflow`);
 check(await page.evaluate(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)),`${width}: all images load`);
 check(await page.evaluate(()=>document.fonts.check('16px "Beatriz Sans"')&&document.fonts.check('16px "Beatriz Serif"')),`${width}: local fonts load`);
 check(await page.locator('.intro').count()===0,`${width}: introduction finishes`);
 for(const pack of business.packs){await page.locator(`.pack-option[data-pieces="${pack.pieces}"]`).click();const summary=await page.locator('#pack-summary').innerText();const href=await page.locator('#pack-whatsapp').getAttribute('href');check(summary===`${pack.pieces} peças · ${pack.price} €`&&decodeURIComponent(href).includes(`${pack.pieces} peças (${pack.price} €)`),`${width}: ${pack.pieces}-piece WhatsApp message`)}
 await page.locator('#service-select').selectOption('al');await page.locator('#request-quantity').fill('15');await page.locator('#request-notes').fill('Preciso para sexta-feira.');const al=decodeURIComponent(await page.locator('#request-whatsapp').getAttribute('href'));check(al.includes('15 kg')&&al.includes('2 €/kg')&&al.includes('sexta-feira'),`${width}: AL message includes quantity and note`);
 await page.locator('#service-select').selectOption('Cortinados');check((await page.locator('#message-preview').innerText()).includes('cortinados'),`${width}: textile service message`);
 check(!await page.locator('#request-al-field').isVisible(),`${width}: irrelevant AL input is hidden`);
 await page.locator('#request-notes').fill('');await page.locator('#service-select').selectOption('pack');await page.locator('#request-pack').selectOption('60');await page.locator('.pack-option[data-pieces="60"]').click();
 if(width<700){await page.locator('.menu-toggle').click();check(await page.locator('#mobile-menu').isVisible(),`${width}: mobile menu opens`);await page.locator('#mobile-menu a').first().click();check(!await page.locator('#mobile-menu').isVisible(),`${width}: mobile menu closes after selection`)}
 check(await page.locator('.film').evaluate(el=>Math.abs(el.clientWidth/el.clientHeight-16/9)<.03),`${width}: film preserves full 16:9 composition`);await page.locator('#video-toggle').click();await page.waitForTimeout(1400);check(await page.locator('#care-video').evaluate(v=>v.currentTime>0&&!v.paused&&v.videoWidth>0),`${width}: rendered film plays`);await page.locator('#video-toggle').click();check(await page.locator('#care-video').evaluate(v=>v.paused),`${width}: film can pause`);
 check(await page.locator('a[href^="https://wa.me/"]').evaluateAll(a=>a.every(el=>{const u=new URL(el.href);return u.pathname==='/351923250845'&&u.searchParams.get('text')?.trim().length>0})),`${width}: every WhatsApp CTA has correct contact and message`);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check(axe.violations.length===0,`${width}: no WCAG A/AA violations`);if(axe.violations.length)errors.push(...axe.violations.map(v=>`${width}: ${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join(', ')}`));
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);if([390,1440].includes(width)){await page.screenshot({path:`${out}/${width===390?'mobile':'desktop'}.png`,fullPage:true});await page.screenshot({path:`${out}/${width===390?'mobile':'desktop'}-hero.png`})}
 check(!consoleErrors.length,`${width}: no JavaScript errors`);check(!failed.length,`${width}: no failed resources`);if(failed.length)errors.push(...failed);
 await context.close();
}
const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();await page.goto('http://127.0.0.1:4173');check(!await page.locator('.intro').count(),'reduced motion: no introduction');await context.close();
const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto('http://127.0.0.1:4173');check(await p.locator('h1').isVisible(),'no JavaScript: main content remains visible');check(await p.locator('noscript a').count()>=6,'no JavaScript: every pack has a direct WhatsApp link');await nojs.close();
for(const route of ['precos/','contactos/','perguntas-frequentes/']){const page=await browser.newPage();const response=await page.goto('http://127.0.0.1:4173/'+route);check(response.status()===200,route+': loads');check((await page.locator('h1').count())===1,route+': heading present');const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());check(schema['@graph'][0].telephone==='+351923250845',route+': valid structured data');await page.close()}
}catch(error){errors.push(error.stack||error.message)}finally{await browser.close();server.close();}
fs.writeFileSync(`${out}/verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),checks:results,errors},null,2));console.log(JSON.stringify({passed:results.filter(x=>x.passed).length,checks:results.length,errors},null,2));if(errors.length)process.exitCode=1;
