-- Apply only after Neon Auth and the authenticated Data API role exist.
BEGIN;
CREATE SCHEMA beatriz_private;
REVOKE ALL ON SCHEMA beatriz_private FROM PUBLIC;
CREATE TABLE beatriz_private.staff (user_id text PRIMARY KEY);
CREATE FUNCTION public.beatriz_is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog
AS $$ SELECT EXISTS (SELECT 1 FROM beatriz_private.staff WHERE user_id = auth.user_id()) $$;
REVOKE ALL ON FUNCTION public.beatriz_is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.beatriz_is_staff() TO authenticated;

CREATE TABLE public.beatriz_customers (
  user_id text PRIMARY KEY DEFAULT auth.user_id(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beatriz_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_read ON public.beatriz_customers FOR SELECT TO authenticated
USING (user_id = auth.user_id() OR public.beatriz_is_staff());
CREATE POLICY customers_insert ON public.beatriz_customers FOR INSERT TO authenticated
WITH CHECK (user_id = auth.user_id());
CREATE POLICY customers_update ON public.beatriz_customers FOR UPDATE TO authenticated
USING (user_id = auth.user_id()) WITH CHECK (user_id = auth.user_id());
GRANT SELECT, INSERT ON public.beatriz_customers TO authenticated;
GRANT UPDATE(name, phone) ON public.beatriz_customers TO authenticated;

CREATE TABLE public.beatriz_packs (
  pieces integer PRIMARY KEY,
  price numeric(8,2) NOT NULL CHECK (price >= 0)
);
-- Matches src/data.mjs; confirm the catalogue with the business before launch.
INSERT INTO public.beatriz_packs VALUES (20,19),(40,39),(60,49),(80,59),(100,65);
ALTER TABLE public.beatriz_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY packs_read ON public.beatriz_packs FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.beatriz_packs TO authenticated;

CREATE TABLE public.beatriz_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.beatriz_customers(user_id),
  pieces integer NOT NULL REFERENCES public.beatriz_packs(pieces),
  price numeric(8,2) NOT NULL,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX beatriz_orders_customer_date ON public.beatriz_orders(user_id, created_at DESC);
CREATE INDEX beatriz_orders_status_date ON public.beatriz_orders(status, created_at DESC);
ALTER TABLE public.beatriz_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_read ON public.beatriz_orders FOR SELECT TO authenticated
USING (user_id = auth.user_id() OR public.beatriz_is_staff());
CREATE POLICY orders_staff_update ON public.beatriz_orders FOR UPDATE TO authenticated
USING (public.beatriz_is_staff()) WITH CHECK (public.beatriz_is_staff());
GRANT SELECT ON public.beatriz_orders TO authenticated;
GRANT UPDATE(status) ON public.beatriz_orders TO authenticated;

CREATE FUNCTION public.beatriz_submit_order(pack_pieces integer, customer_notes text, request_id uuid)
RETURNS public.beatriz_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $$
DECLARE current_user_id text := auth.user_id(); result public.beatriz_orders; pack_price numeric;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.beatriz_customers WHERE user_id=current_user_id) THEN
    RAISE EXCEPTION 'Customer profile required';
  END IF;
  SELECT * INTO result FROM public.beatriz_orders WHERE id=request_id AND user_id=current_user_id;
  IF FOUND THEN RETURN result; END IF;
  SELECT price INTO pack_price FROM public.beatriz_packs WHERE pieces=pack_pieces;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid pack'; END IF;
  IF char_length(coalesce(customer_notes,'')) > 1000 THEN RAISE EXCEPTION 'Notes too long'; END IF;
  IF (SELECT count(*) FROM public.beatriz_orders WHERE user_id=current_user_id AND created_at > now()-interval '1 hour') >= 10 THEN
    RAISE EXCEPTION 'Too many requests';
  END IF;
  INSERT INTO public.beatriz_orders(id,user_id,pieces,price,notes)
  VALUES(request_id,current_user_id,pack_pieces,pack_price,coalesce(customer_notes,'')) RETURNING * INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.beatriz_submit_order(integer,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.beatriz_submit_order(integer,text,uuid) TO authenticated;
COMMIT;
