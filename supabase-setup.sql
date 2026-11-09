-- =====================================================================
--  Supabase-setup voor de oefenapps 1 Basis (nieuwe database)
--  Plak dit hele script in Supabase: SQL Editor -> New query -> Run.
--  Je kunt het script veilig vaker uitvoeren.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- 1. Tabellen ----------------------------------------------

-- Klassen: elke docent maakt eigen klassen met een klascode.
create table if not exists public.klassen (
  klascode  text primary key check (klascode ~ '^[A-Z0-9]{4,12}$'),
  klas      text not null check (length(klas) between 1 and 40),
  docent    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  gemaakt   timestamptz not null default now()
);
create index if not exists klassen_docent_idx on public.klassen (docent);

-- Voortgang: één rij per leerling per paragraaf (app).
-- samenvatting bevat per opdracht en per deelvraag: punten, aantal fouten,
-- hints en de laatste foute antwoorden. Daarmee maakt de docentenpagina
-- het overzicht "waar gaat het mis?".
create table if not exists public.voortgang (
  id            bigint generated always as identity primary key,
  app           text not null check (app ~ '^[a-z0-9-]{2,60}$'),
  klascode      text not null references public.klassen(klascode) on delete cascade on update cascade,
  naam          text not null,
  naam_sleutel  text not null,
  pin_hash      text,                                -- leeg = leerling kiest een nieuwe pincode
  staat         jsonb not null default '{}'::jsonb,  -- alles wat de app nodig heeft om verder te gaan
  samenvatting  jsonb not null default '{}'::jsonb,  -- voor het docentenoverzicht
  punten        int not null default 0,
  max_punten    int not null default 0,
  gestart       timestamptz not null default now(),
  bijgewerkt    timestamptz not null default now(),
  unique (app, klascode, naam_sleutel)
);
create index if not exists voortgang_klascode_idx on public.voortgang (klascode);

-- ---------- 2. Beveiliging (Row Level Security) ---------------------
-- Leerlingen (anon) mogen niets rechtstreeks in de tabellen.
-- Zij gaan alleen via de functies hieronder, met klascode + naam + pincode.
-- Een docent ziet alleen leerlingen uit de eigen klassen.

alter table public.klassen   enable row level security;
alter table public.voortgang enable row level security;

revoke all on public.klassen, public.voortgang from anon;
grant select, insert, update, delete on public.klassen   to authenticated;
grant select, update, delete         on public.voortgang to authenticated;

drop policy if exists "docent beheert eigen klassen" on public.klassen;
create policy "docent beheert eigen klassen" on public.klassen
  for all to authenticated
  using (docent = (select auth.uid()))
  with check (docent = (select auth.uid()));

drop policy if exists "docent ziet eigen leerlingen" on public.voortgang;
create policy "docent ziet eigen leerlingen" on public.voortgang
  for select to authenticated
  using (exists (select 1 from public.klassen k where k.klascode = voortgang.klascode and k.docent = (select auth.uid())));

drop policy if exists "docent wijzigt eigen leerlingen" on public.voortgang;
create policy "docent wijzigt eigen leerlingen" on public.voortgang
  for update to authenticated
  using (exists (select 1 from public.klassen k where k.klascode = voortgang.klascode and k.docent = (select auth.uid())))
  with check (exists (select 1 from public.klassen k where k.klascode = voortgang.klascode and k.docent = (select auth.uid())));

drop policy if exists "docent verwijdert eigen leerlingen" on public.voortgang;
create policy "docent verwijdert eigen leerlingen" on public.voortgang
  for delete to authenticated
  using (exists (select 1 from public.klassen k where k.klascode = voortgang.klascode and k.docent = (select auth.uid())));

-- ---------- 3. Functies voor leerlingen -----------------------------

create or replace function public.leerling_aanmelden(p_app text, p_klascode text, p_naam text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code    text := upper(regexp_replace(coalesce(p_klascode,''), '\s', '', 'g'));
  v_naam    text := regexp_replace(trim(coalesce(p_naam,'')), '\s+', ' ', 'g');
  v_sleutel text := lower(regexp_replace(trim(coalesce(p_naam,'')), '\s+', ' ', 'g'));
  v_klas    text;
  r         public.voortgang;
begin
  if coalesce(p_pin,'') !~ '^[0-9]{4}$' then
    return jsonb_build_object('ok', false, 'fout', 'pin');
  end if;
  if length(v_naam) < 2 or length(v_naam) > 60 then
    return jsonb_build_object('ok', false, 'fout', 'naam');
  end if;
  if coalesce(p_app,'') !~ '^[a-z0-9-]{2,60}$' then
    return jsonb_build_object('ok', false, 'fout', 'app');
  end if;

  select klas into v_klas from public.klassen where klascode = v_code;
  if not found then
    return jsonb_build_object('ok', false, 'fout', 'klascode');
  end if;

  select * into r from public.voortgang
   where app = p_app and klascode = v_code and naam_sleutel = v_sleutel;

  if not found then
    insert into public.voortgang (app, klascode, naam, naam_sleutel, pin_hash)
    values (p_app, v_code, v_naam, v_sleutel, crypt(p_pin, gen_salt('bf')))
    returning * into r;
    return jsonb_build_object('ok', true, 'nieuw', true, 'klas', v_klas, 'naam', r.naam, 'staat', r.staat);
  end if;

  if r.pin_hash is null then
    update public.voortgang set pin_hash = crypt(p_pin, gen_salt('bf')) where id = r.id;
  elsif r.pin_hash <> crypt(p_pin, r.pin_hash) then
    return jsonb_build_object('ok', false, 'fout', 'pincode');
  end if;

  return jsonb_build_object('ok', true, 'nieuw', false, 'klas', v_klas, 'naam', r.naam, 'staat', r.staat);
end;
$$;

create or replace function public.leerling_opslaan(
  p_app text, p_klascode text, p_naam text, p_pin text,
  p_staat jsonb, p_samenvatting jsonb, p_punten int, p_max int)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code    text := upper(regexp_replace(coalesce(p_klascode,''), '\s', '', 'g'));
  v_sleutel text := lower(regexp_replace(trim(coalesce(p_naam,'')), '\s+', ' ', 'g'));
  r         public.voortgang;
begin
  if pg_column_size(p_staat) > 400000 or pg_column_size(p_samenvatting) > 100000 then
    return jsonb_build_object('ok', false, 'fout', 'te groot');
  end if;

  select * into r from public.voortgang
   where app = p_app and klascode = v_code and naam_sleutel = v_sleutel;
  if not found then
    return jsonb_build_object('ok', false, 'fout', 'onbekend');
  end if;
  if r.pin_hash is null or r.pin_hash <> crypt(coalesce(p_pin,''), r.pin_hash) then
    return jsonb_build_object('ok', false, 'fout', 'pincode');
  end if;

  update public.voortgang
     set staat = coalesce(p_staat, '{}'::jsonb),
         samenvatting = coalesce(p_samenvatting, '{}'::jsonb),
         punten = greatest(0, coalesce(p_punten, 0)),
         max_punten = greatest(0, coalesce(p_max, 0)),
         bijgewerkt = now()
   where id = r.id;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.leerling_aanmelden(text,text,text,text) from public;
revoke all on function public.leerling_opslaan(text,text,text,text,jsonb,jsonb,int,int) from public;
grant execute on function public.leerling_aanmelden(text,text,text,text) to anon, authenticated;
grant execute on function public.leerling_opslaan(text,text,text,text,jsonb,jsonb,int,int) to anon, authenticated;
