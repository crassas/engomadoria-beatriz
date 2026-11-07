import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import test from 'node:test';
import {chromium} from '@playwright/test';

const root = path.resolve('docs');
const mime = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain'};

function packLayout() {
  const box = document.querySelector('.pack-options').getBoundingClientRect();
  const cards = [...document.querySelectorAll('.pack-option')].map((element) => element.getBoundingClientRect());
  const rows = [];
  for (const card of cards) {
    const row = rows.find((item) => Math.abs(item - card.top) < 8);
    if (row === undefined) rows.push(card.top);
  }
  return {
    columns: getComputedStyle(document.querySelector('.pack-options')).gridTemplateColumns.split(' ').length,
    rows: rows.length,
    card: Math.round(cards[0].width),
    trailing: Math.round(box.right - cards.at(-1).right),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  };
}

test('pack choices, Escape and the partner quote bar', async (t) => {
  const server = createServer((request, response) => {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) {
      response.writeHead(403).end();
      return;
    }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const content = fs.readFileSync(file);
      response.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless: true});
  t.after(async () => {
    await browser.close();
    server.close();
  });

  await t.test('four packs fill the row on desktop', async () => {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    await page.goto(`${base}/?retorno=1`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    const layout = await page.evaluate(packLayout);
    assert.equal(layout.columns, 4);
    assert.equal(layout.rows, 1);
    assert.ok(layout.trailing < 24, `empty column of ${layout.trailing}px`);
    assert.equal(layout.overflow, false);
    await page.close();
  });

  await t.test('four packs form two rows of two on a phone', async () => {
    const page = await browser.newPage({viewport: {width: 390, height: 900}});
    await page.goto(`${base}/?retorno=1`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    const layout = await page.evaluate(packLayout);
    assert.equal(layout.columns, 2);
    assert.equal(layout.rows, 2);
    assert.ok(layout.card >= 140, `pack card is only ${layout.card}px`);
    assert.ok(layout.trailing < 24, `orphan space of ${layout.trailing}px`);
    assert.equal(layout.overflow, false);
    await page.close();
  });

  await t.test('Escape closes only an open menu', async () => {
    const page = await browser.newPage({viewport: {width: 390, height: 900}});
    await page.goto(`${base}/?retorno=1`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    await page.locator('#request-notes').focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'request-notes');
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('#mobile-menu').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobile-menu').isHidden(), true);
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('menu-toggle')), true);
    await page.close();
  });

  await t.test('the partner quote bar appears only after the hero', async () => {
    const page = await browser.newPage({viewport: {width: 390, height: 800}});
    await page.goto(`${base}/grupo-elite-limpeza/`, {waitUntil: 'domcontentloaded'});
    const bar = page.locator('.el15-mobile-cta');
    assert.equal(await bar.isVisible(), false);
    await page.evaluate(() => {
      const hero = document.querySelector('.el9-hero');
      scrollTo(0, hero.getBoundingClientRect().bottom + 120);
    });
    await page.waitForFunction(() => !document.querySelector('.el15-mobile-cta').hidden, undefined, {timeout: 3000});
    assert.equal(await bar.isVisible(), true);
    await page.locator('#contactos').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.el15-mobile-cta').hasAttribute('hidden'), undefined, {timeout: 3000});
    assert.equal(await bar.isVisible(), false);
    const prices = fs.readFileSync(path.join(root, 'precos/index.html'), 'utf8');
    assert.equal(prices.includes('el15-mobile-cta'), false);
    await page.close();
  });
});
