import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const script = fs.readFileSync('src/beatriz.js', 'utf8');
const build = fs.readFileSync('scripts/build.mjs', 'utf8');

test('a entrada é breve e nunca bloqueia a navegação', () => {
  assert.doesNotMatch(script, /inert\s*=\s*true/);
  assert.match(script, /setTimeout\(finishIntro,420\)/);
  assert.match(build, /aria-hidden="true"/);
});

test('o hero orienta logo para os três serviços principais', () => {
  assert.match(build, /A sua roupa,<br>tratada como merece\./);
  assert.match(build, /option-three-media/);
  assert.match(build, /Cuidado em<br>cada dobra/);
  assert.match(build, /Packs mensais/);
  assert.match(build, /Alojamento Local/);
  assert.match(build, /Peças especiais/);
  assert.match(script, /let current=0;let playing=false/);
});
