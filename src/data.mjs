export const business = {
  name: 'Engomadoria Beatriz',
  fullName: 'Engomadoria Beatriz Lavandaria',
  url: 'https://engomadoriabeatriz.pt/',
  streetAddress: 'Praça das Flores 42',
  city: 'Porto',
  phone: '+351923250845',
  displayPhone: '923 250 845',
  packs: [{pieces:20,price:29},{pieces:40,price:49},{pieces:60,price:69},{pieces:80,price:89}],
  services: ['Limpeza a seco','Carpetes','Cortinados','Peles','Edredões','Cobertores'],
  pickupArea: 'Grande Porto',
  pickupMinimumPieces: 25,
  ironingTurnaround: 'até 72 horas',
  paymentMethods: ['Dinheiro','MB WAY'],
  cancellationHours: 24,
  alPricePerKg: 2,
  experienceYears: 20,
  faq: [
    ['Quanto custam os packs mensais?', '20 peças: 29 €. 40 peças: 49 €. 60 peças: 69 €. 80 peças: 89 €. Os preços dos packs são fixos. Peças de maior dimensão contam como duas peças.'],
    ['Como funciona um pedido?', 'Escolha o pack ou serviço e contacte a Beatriz. Para recolha e entrega ao domicílio, o serviço abrange o Grande Porto e exige um mínimo de 25 peças. O pagamento é feito antecipadamente, em dinheiro ou por MB WAY.'],
    ['Quanto tempo demora?', 'Na engomadoria, o prazo habitual é até 72 horas. Alojamento Local, tratamento de manchas e outros serviços de lavandaria ou limpeza têxtil podem precisar de mais tempo; o prazo é confirmado caso a caso.'],
    ['Há recolha e entrega ao domicílio?', 'Sim. A recolha e entrega está disponível no Grande Porto, com um mínimo de 25 peças por serviço. Confirme por WhatsApp a zona, o dia e as condições antes da recolha.'],
    ['Posso alterar ou cancelar uma recolha?', 'Sim. Alterações ou cancelamentos devem ser comunicados com pelo menos 24 horas de antecedência.'],
    ['Como são feitos os pagamentos?', 'O serviço é pré-pago. A Beatriz aceita dinheiro ou MB WAY.'],
    ['Como são contadas as peças dos packs?', 'Camisas, calças, vestidos e peças semelhantes contam normalmente como uma peça. Peças de maior dimensão contam como duas peças.'],
    ['Fazem tratamento de manchas?', 'Sim. O tratamento de nódoas e manchas é um serviço adicional, com preço próprio, e pode aumentar o prazo de entrega.'],
    ['Tratam roupa de Alojamento Local?', 'Sim. O serviço para Alojamento Local custa 2 €/kg e inclui lavar, secar, dobrar e engomar. Pode ser usado de forma recorrente. O prazo é confirmado conforme o volume e o serviço.'],
    ['Trabalham com empresas?', 'Sim. A Beatriz pode tratar roupa de Alojamentos Locais, cabeleireiros e outros negócios adequados ao serviço. Nestes casos, o serviço é calculado ao quilo.'],
    ['Posso indicar como quero a roupa preparada?', 'Sim. Pode pedir a roupa em cabides ou dobrada, com ou sem engomar, e indicar cuidados ou preferências específicas para o tratamento.'],
    ['Usam produtos específicos para diferentes tipos de roupa?', 'Sim. São usados produtos adequados ao tipo de roupa, incluindo roupa branca e necessidades específicas. Indique previamente alergias ou cuidados especiais.'],
    ['O que acontece se tiver um problema com o serviço?', 'Fale directamente com a D. Beatriz. Reclamações ou situações com uma peça são analisadas directamente consigo para encontrar uma solução.'],
    ['Que outros serviços posso consultar?', 'Limpeza a seco, carpetes, cortinados, peles, edredões e cobertores, entre outros serviços de limpeza têxtil. Alguns serviços são realizados com parceiro especializado e a disponibilidade, o prazo e o orçamento são confirmados antes de avançar.'],
    ['Qual é o horário?', 'A loja funciona de segunda a sexta-feira, das 10:00 às 12:30 e das 14:00 às 19:00, e sábado das 10:00 às 15:00. Chamadas e novos pedidos: dias úteis até às 18:00.'],
    ['Onde fica a loja?', 'A Engomadoria Beatriz fica na Praça das Flores 42, no Porto. Pode deixar e levantar a roupa directamente na loja, dentro do horário: segunda a sexta-feira das 10:00 às 12:30 e das 14:00 às 19:00, e sábado das 10:00 às 15:00.'],
    ['Quanto custa engomar uma camisa?', 'Nos packs mensais, cada peça fica entre 1,11 € (pack de 80 peças, 89 €) e 1,45 € (pack de 20 peças, 29 €). Camisas e peças semelhantes contam como uma peça. Para peças fora de pack, confirme o preço por WhatsApp.'],
    ['Fazem limpeza a seco?', 'Sim. A limpeza a seco faz parte dos serviços de limpeza têxtil da Beatriz, tal como carpetes, cortinados, peles, edredões e cobertores. Alguns destes serviços são realizados com parceiro especializado; a disponibilidade, o prazo e o orçamento são confirmados antes de avançar.']
  ]
};
export const wa = (message) => `https://wa.me/351923250845?text=${encodeURIComponent(message)}`;
export const generalMessage = 'Olá, Beatriz! Gostaria de saber mais sobre os serviços de engomadoria.';
export const packMessage = (p) => `Olá, Beatriz! Gostaria do pack mensal de ${p.pieces} peças (${p.price} €). ${p.pieces>=25?'Gostaria também de confirmar a recolha e entrega no Grande Porto.':'Pode indicar-me as opções de entrega/recolha para este pack?'} Pode confirmar a disponibilidade e o prazo?`;
