// Inject the official Neon client. No database credentials belong in the browser.
export function normalizePhone(value) {
  let phone = String(value).replace(/[\s().-]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.slice(2);
  if (/^[29]\d{8}$/.test(phone)) phone = '+351' + phone;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Indique um telemóvel válido, com indicativo.');
  return phone;
}
export function orderMessage(order, name) {
  return `Olá, Beatriz! Sou ${name}. Registei o pedido ${order.id}: pack de ${order.pieces} peças (${Number(order.price).toFixed(2).replace('.', ',')} €).${order.notes ? ' ' + order.notes : ''} Pode confirmar as condições e a disponibilidade?`;
}
export function createCustomerService(client) {
  async function checked(query) {
    const result = await query;
    if (result.error) throw new Error('Não foi possível concluir. Tente novamente.');
    return result.data;
  }
  async function session() {
    const data = await checked(client.auth.getSession());
    if (!data?.user) throw new Error('Entre na sua conta para continuar.');
    return data.user;
  }
  return {
    session,
    async register({name,email,password}) {
      if (name.trim().length < 2 || name.trim().length > 100) throw new Error('Indique o seu nome.');
      if (password.length < 12) throw new Error('Use uma palavra-passe com pelo menos 12 caracteres.');
      return checked(client.auth.signUp.email({name:name.trim(),email,password}));
    },
    signIn: ({email,password}) => checked(client.auth.signIn.email({email,password})),
    signOut: () => checked(client.auth.signOut()),
    async saveProfile({name,phone}) {
      const user = await session();
      if (name.trim().length < 2 || name.trim().length > 100) throw new Error('Indique o seu nome.');
      const profile = {name:name.trim(),phone:normalizePhone(phone)};
      const existing = await checked(client.from('beatriz_customers').select('user_id').eq('user_id',user.id).maybeSingle());
      return existing
        ? checked(client.from('beatriz_customers').update(profile).eq('user_id',user.id).select().single())
        : checked(client.from('beatriz_customers').insert({...profile,user_id:user.id}).select().single());
    },
    async myOrders() {
      const user = await session();
      return checked(client.from('beatriz_orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100));
    },
    async submit({pieces,notes='',requestId}) {
      await session();
      if (!requestId) throw new Error('Falta a referência do pedido.');
      if (notes.length > 1000) throw new Error('A nota deve ter até 1000 caracteres.');
      return checked(client.rpc('beatriz_submit_order',{pack_pieces:Number(pieces),customer_notes:notes,request_id:requestId}));
    },
    async staffOrders() {
      await session();
      if (!await checked(client.rpc('beatriz_is_staff'))) throw new Error('Área reservada à Beatriz.');
      return checked(client.from('beatriz_orders').select('*,beatriz_customers(name,phone)').order('created_at',{ascending:false}).limit(100));
    },
    async setStatus(id,status) {
      await session();
      if (!['pending','confirmed','completed','cancelled'].includes(status)) throw new Error('Estado inválido.');
      return checked(client.from('beatriz_orders').update({status}).eq('id',id).select().single());
    },
  };
}
