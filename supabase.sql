-- ============================================================
-- Supabase: tabel voor de resultaten van de oefenapp
-- Plak dit in Supabase → SQL Editor → New query → Run.
-- Je hoeft dit maar één keer te doen.
-- ============================================================

create table if not exists public.resultaten (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  leerling      text not null check (char_length(leerling) between 1 and 100),
  klas          text check (klas is null or char_length(klas) <= 40),
  module        text,
  cijfer        numeric(3,1) check (cijfer between 1 and 10),
  score         integer,
  totaal        integer,
  gokkans       text check (gokkans in ('Laag','Gemiddeld','Hoog')),
  samenvatting  text,
  export_tekst  text,
  details       jsonb,
  sessie_start  timestamptz
);

-- Beveiliging aanzetten (Row Level Security)
alter table public.resultaten enable row level security;

-- Leerlingen (niet ingelogd) mogen alleen een resultaat INSTUREN.
drop policy if exists "leerling stuurt resultaat in" on public.resultaten;
create policy "leerling stuurt resultaat in"
  on public.resultaten for insert
  to anon, authenticated
  with check (true);

-- Alleen ingelogde docenten mogen resultaten LEZEN.
drop policy if exists "docent leest resultaten" on public.resultaten;
create policy "docent leest resultaten"
  on public.resultaten for select
  to authenticated
  using (true);

-- Alleen ingelogde docenten mogen resultaten VERWIJDEREN.
drop policy if exists "docent verwijdert resultaten" on public.resultaten;
create policy "docent verwijdert resultaten"
  on public.resultaten for delete
  to authenticated
  using (true);

create index if not exists resultaten_klas_idx on public.resultaten (klas, created_at desc);

-- ============================================================
-- Deel 2: docenten en opslaan van voortgang met een code
-- ============================================================
create table if not exists public.docenten (email text primary key);
alter table public.docenten enable row level security;
-- vervang door je eigen e-mailadres (en voeg collega's toe)
insert into public.docenten (email) values ('mieke.van.kemenade@ozhw.nl') on conflict do nothing;

create or replace function public.is_docent() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.docenten d where lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_docent() from public, anon;
grant execute on function public.is_docent() to authenticated;

drop policy if exists "docent leest resultaten" on public.resultaten;
create policy "docent leest resultaten" on public.resultaten for select to authenticated using (public.is_docent());
drop policy if exists "docent verwijdert resultaten" on public.resultaten;
create policy "docent verwijdert resultaten" on public.resultaten for delete to authenticated using (public.is_docent());
drop policy if exists "docent ziet eigen docentrij" on public.docenten;
create policy "docent ziet eigen docentrij" on public.docenten for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
alter table public.resultaten add column if not exists code text check (code is null or code ~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$');

create table if not exists public.voortgang (
  code        text primary key check (code ~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$'),
  leerling    text not null check (char_length(leerling) between 1 and 100),
  klas        text check (klas is null or char_length(klas) <= 40),
  data        jsonb not null,
  aangemaakt  timestamptz not null default now(),
  bijgewerkt  timestamptz not null default now()
);
alter table public.voortgang enable row level security;
drop policy if exists "docent leest voortgang" on public.voortgang;
create policy "docent leest voortgang" on public.voortgang for select to authenticated using (public.is_docent());
drop policy if exists "docent verwijdert voortgang" on public.voortgang;
create policy "docent verwijdert voortgang" on public.voortgang for delete to authenticated using (public.is_docent());

-- Leerlingen lezen en schrijven hun voortgang alleen via deze twee functies, met hun code.
create or replace function public.voortgang_opslaan(p_code text, p_leerling text, p_klas text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_code !~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$' then raise exception 'ongeldige code'; end if;
  if pg_column_size(p_data) > 300000 then raise exception 'te groot'; end if;
  insert into public.voortgang (code, leerling, klas, data)
  values (p_code, left(coalesce(nullif(trim(p_leerling), ''), 'onbekend'), 100), left(p_klas, 40), p_data)
  on conflict (code) do update set leerling = excluded.leerling, klas = excluded.klas, data = excluded.data, bijgewerkt = now();
end $$;
create or replace function public.voortgang_laden(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('leerling', leerling, 'klas', klas, 'data', data, 'bijgewerkt', bijgewerkt)
  from public.voortgang where code = upper(trim(p_code));
$$;
revoke all on function public.voortgang_opslaan(text, text, text, jsonb) from public;
revoke all on function public.voortgang_laden(text) from public;
grant execute on function public.voortgang_opslaan(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.voortgang_laden(text) to anon, authenticated;
