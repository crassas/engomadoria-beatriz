export const business = {
  name: 'Engomadoria Beatriz', fullName: 'Engomadoria Beatriz Lavandaria',
  url: 'https://crassas.github.io/engomadoria-beatriz/',
  phone: '+351923250845', displayPhone: '923 250 845',
  packs: [{pieces:20,price:19},{pieces:40,price:39},{pieces:60,price:49},{pieces:80,price:59},{pieces:100,price:65}],
  monthlyPickupPacks: [{pieces:20,price:29},{pieces:40,price:49},{pieces:60,price:69},{pieces:80,price:89}],
  services: ['Limpeza a seco','Carpetes','Cortinados','Peles','Edredões','Cobertores'],
  faq: [
    ['Como posso pedir um pack de engomadoria?', 'Escolha um dos packs de 20, 40, 60, 80 ou 100 peças e abra o WhatsApp com o pedido preparado. A Beatriz confirma consigo os detalhes, a disponibilidade e o prazo.'],
    ['Quanto custam os packs?', '20 peças: 19 €. 40 peças: 39 €. 60 peças: 49 €. 80 peças: 59 €. 100 peças: 65 €. Confirme no WhatsApp as condições e as peças abrangidas pelo pack.'],
    ['Tratam roupa de Alojamento Local?', 'Sim. O serviço de lavandaria para Alojamento Local abrange roupa branca a 2 €/kg. Indique a quantidade aproximada e a data pretendida para confirmar as condições.'],
    ['Que outros serviços posso consultar?', 'Limpeza a seco, carpetes, cortinados, peles, edredões e cobertores, entre outros serviços de limpeza têxtil. A disponibilidade e o orçamento são confirmados directamente no WhatsApp.'],
    ['Qual é o horário?', 'Segunda a sexta-feira, das 10:00 às 12:30 e das 14:00 às 19:00. Sábado, das 10:00 às 15:00. Domingos e feriados: encerrado.'],
    ['Há recolha e entrega ao domicílio?', 'Sim. Existem packs mensais de engomadoria com recolha e entrega ao domicílio: 20 peças por 29 €, 40 peças por 49 €, 60 peças por 69 € e 80 peças por 89 €. Confirme por WhatsApp a área abrangida e as condições do serviço.']
  ]
};
export const wa = (message) => `https://wa.me/351923250845?text=${encodeURIComponent(message)}`;
export const generalMessage = 'Olá, Beatriz! Gostaria de saber mais sobre os serviços de engomadoria.';
export const packMessage = (p) => `Olá, Beatriz! Gostaria do pack de ${p.pieces} peças (${p.price} €). Pode confirmar as condições, a disponibilidade e o prazo?`;
