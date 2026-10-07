export const business = {
  name: 'Engomadoria Beatriz', fullName: 'Engomadoria Beatriz Lavandaria',
  url: 'https://engomadoriabeatriz.pt/',
  phone: '+351923250845', displayPhone: '923 250 845',
  packs: [{pieces:20,price:29},{pieces:40,price:49},{pieces:60,price:69},{pieces:80,price:89}],
  services: ['Limpeza a seco','Carpetes','Cortinados','Peles','Edredões','Cobertores'],
  faq: [
    ['Como posso pedir um pack mensal de engomadoria?', 'Escolha um dos packs mensais de 20, 40, 60 ou 80 peças e abra o WhatsApp com o pedido preparado. A Beatriz confirma consigo a área abrangida, a recolha, a entrega, a disponibilidade e as condições.'],
    ['Quanto custam os packs mensais?', '20 peças: 29 €. 40 peças: 49 €. 60 peças: 69 €. 80 peças: 89 €. Confirme no WhatsApp as condições, a área abrangida e as peças incluídas.'],
    ['Tratam roupa de Alojamento Local?', 'Sim. O serviço de lavandaria para Alojamento Local abrange roupa branca a 2 €/kg. Indique a quantidade aproximada e a data pretendida para confirmar as condições.'],
    ['Que outros serviços posso consultar?', 'Limpeza a seco, carpetes, cortinados, peles, edredões e cobertores, entre outros serviços de limpeza têxtil. A disponibilidade e o orçamento são confirmados directamente no WhatsApp.'],
    ['Qual é o horário?', 'Segunda a sexta-feira, das 10:00 às 12:30 e das 14:00 às 19:00. Sábado, das 10:00 às 15:00. Domingos e feriados: encerrado.'],
    ['Há recolha e entrega ao domicílio?', 'Sim. Os packs mensais de 20, 40, 60 e 80 peças incluem a opção de recolha e entrega ao domicílio. Confirme por WhatsApp a área abrangida e as condições do serviço.']
  ]
};
export const wa = (message) => `https://wa.me/351923250845?text=${encodeURIComponent(message)}`;
export const generalMessage = 'Olá, Beatriz! Gostaria de saber mais sobre os serviços de engomadoria.';
export const packMessage = (p) => `Olá, Beatriz! Gostaria do pack mensal de ${p.pieces} peças (${p.price} €), com recolha e entrega ao domicílio. Pode confirmar a área abrangida, as condições, a disponibilidade e o prazo?`;
