# Contas e pedidos — preparação, ainda sem activação

O site público continua funcional. Estes ficheiros ainda não estão ligados ao site:
faltam o projecto Neon, os endpoints de Auth/Data API e a conta administrativa.
Não há registo real nem pedidos persistentes activos nesta fase.

## Fluxo definido

- Cliente cria conta com nome, email e palavra-passe; confirma o email.
- Guarda o telemóvel e escolhe o pack. O pedido fica «Por confirmar».
- O pedido é guardado antes de apresentar o link para WhatsApp. O link inclui a referência.
- Cliente consulta apenas os próprios pedidos. A Beatriz vê os pedidos e os contactos.
- A Beatriz confirma os pedidos; não há reserva automática de dia/hora nem pagamento.

## Ligação

1. Criar um projecto dedicado à Beatriz, com Neon Auth e Data API autenticada.
2. Configurar email de verificação e recuperação, limites de registo e os domínios autorizados.
3. Aplicar a migração em `migrations/001_accounts_orders.sql` num ambiente de teste.
4. Criar o cliente oficial `@neondatabase/neon-js` com os URLs públicos de Auth e Data API.
5. Injectar o cliente em `createCustomerService`. A UI de conta ainda falta integrar.
6. A Beatriz cria e verifica a própria conta. Inserir o ID verificado em `beatriz_private.staff`
   pelo acesso administrativo à base de dados. Nunca aceitar privilégios enviados pelo browser.
7. Confirmar preços do catálogo com a Beatriz: o site e a migração seguem `src/data.mjs`.
8. Testar duas contas: nenhuma pode ler ou alterar dados da outra; cliente não pode confirmar
   pedidos, alterar preços ou tornar-se administrador. Testar recuperação e verificação de email.
9. Integrar a área de cliente e gestão, rever o aviso de privacidade e activar só após estes testes.

Não colocar strings de ligação, palavras-passe ou chaves administrativas no GitHub público.
As políticas limitam leitura por utilizador. Só a conta autorizada pode mudar o estado.
O preço vem do catálogo na base de dados; a referência torna tentativas repetidas idempotentes.

## Guia previsto para a Beatriz

1. Abrir «Gestão» e entrar na conta privada.
2. Ver os pedidos «Por confirmar» com nome, telemóvel, pack, valor e nota.
3. Tocar em «WhatsApp» para combinar condições e entrega.
4. Depois do acordo, marcar «Confirmado». No fim, marcar «Concluído».

As acções de contacto apenas preparam o WhatsApp: nenhuma mensagem é enviada automaticamente.
