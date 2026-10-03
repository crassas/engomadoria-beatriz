# Engomadoria Beatriz Lavandaria

Site público: https://crassas.github.io/engomadoria-beatriz/

Montra digital responsiva, com selector de packs, pedidos por WhatsApp, roupa branca para Alojamento Local, consultas de limpeza têxtil, horário, perguntas frequentes e filme de apresentação.

## Fonte comercial
`CONTENT_TRUTH.md` é a referência comercial mais recente. Os preços actuais usados no site são 19 €, 39 €, 49 €, 59 € e 65 € para 20, 40, 60, 80 e 100 peças. O serviço de roupa branca de AL é 2 €/kg. Telefone: 923 250 845.

Os dados são definidos uma vez em `src/data.mjs` e usados para construir a página principal, preços, perguntas frequentes, contactos, JSON-LD e llms.txt.

## Desenvolvimento
- `npm ci`
- `npm run build`
- `npm run video:render`
- `npm run verify`
- `npm run preview`

O GitHub Actions renderiza o filme Remotion e verifica os percursos num navegador real. Guarda o vídeo e as provas em `.review/`.

## Informação por confirmar
Morada exacta, localidade/bairro e domínio próprio. A página não inventa localização, avaliações, disponibilidade, recolha, entrega ou prazos. A estratégia local deve ser completada com a morada confirmada. O site é indexável sem Google Business; não existe garantia de posição ou de citação por sistemas de IA.

Publicação: GitHub Pages, pasta `docs` da branch `main`.
