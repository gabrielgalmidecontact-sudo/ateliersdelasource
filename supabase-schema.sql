-- ============================================================
-- Les Ateliers de la Source — Schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE : profiles (infos membres)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  city text,
  bio text,
  motivation text,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'admin')),
  newsletter_global boolean not null default true,
  newsletter_stages boolean not null default true,
  newsletter_spectacles boolean not null default true,
  newsletter_blog boolean not null default false,
  newsletter_amelie boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger mise à jour updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Créer le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = 'gabrielgalmide.contact@gmail.com' then 'admin' else 'member' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TABLE : stage_logs (fiches de suivi)
-- ============================================================
create table if not exists public.stage_logs (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  stage_slug text not null,
  stage_title text not null,
  stage_date date not null,
  trainer text not null default 'Gabriel',
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  intention_before text,
  reflection_after text,
  key_insight text,
  integration_notes text,
  rating smallint check (rating between 1 and 5),
  would_recommend boolean,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE : member_notes (notes personnelles du membre)
-- ============================================================
create table if not exists public.member_notes (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  stage_log_id uuid references public.stage_logs(id) on delete set null,
  title text not null,
  content text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger member_notes_updated_at
  before update on public.member_notes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABLE : trainer_notes (notes Gabriel/Amélie)
-- ============================================================
create table if not exists public.trainer_notes (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  stage_log_id uuid references public.stage_logs(id) on delete set null,
  trainer_name text not null,
  content text not null,
  category text not null default 'general' check (category in ('observation', 'encouragement', 'recommendation', 'general')),
  is_visible_to_member boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trainer_notes_updated_at
  before update on public.trainer_notes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABLE : reservations
-- ============================================================
create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  event_slug text not null,
  event_title text not null,
  event_date date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'free' check (payment_status in ('free', 'pending', 'paid', 'refunded')),
  amount_cents integer,
  stripe_session_id text,
  notes text,
  diet_type text,
  food_allergies text,
  food_intolerances text,
  diet_notes text,
  logistics_notes text,
  accommodation_type text,
  transport_mode text check (transport_mode in ('train', 'avion', 'voiture', 'bus')),
  arrival_location text,
  needs_transfer boolean not null default false,
  arrival_time text,
  departure_time text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- ============================================================

-- Profiles : chaque membre voit seulement son profil, admin voit tout
alter table public.profiles enable row level security;

create policy "Membre voit son profil" on public.profiles
  for select using (auth.uid() = id);

create policy "Membre modifie son profil" on public.profiles
  for update using (auth.uid() = id);

create policy "Admin voit tous les profils" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Stage logs
alter table public.stage_logs enable row level security;

create policy "Membre voit ses fiches" on public.stage_logs
  for select using (auth.uid() = member_id);

create policy "Membre crée ses fiches" on public.stage_logs
  for insert with check (auth.uid() = member_id);

create policy "Membre modifie ses fiches" on public.stage_logs
  for update using (auth.uid() = member_id);

create policy "Admin accès total fiches" on public.stage_logs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Member notes
alter table public.member_notes enable row level security;

create policy "Membre voit ses notes" on public.member_notes
  for all using (auth.uid() = member_id);

create policy "Admin voit notes non-privées" on public.member_notes
  for select using (
    is_private = false and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Trainer notes
alter table public.trainer_notes enable row level security;

create policy "Membre voit ses notes formateur visibles" on public.trainer_notes
  for select using (
    auth.uid() = member_id and is_visible_to_member = true
  );

create policy "Admin accès total notes formateur" on public.trainer_notes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Reservations
alter table public.reservations enable row level security;

create policy "Membre voit ses réservations" on public.reservations
  for all using (auth.uid() = member_id);

create policy "Admin voit toutes les réservations" on public.reservations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- DONNÉES DE TEST (optionnel — supprimer en production)
-- ============================================================
-- (Ajouter Gabriel comme admin manuellement après sa première connexion)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'gabrielgalmide.contact@gmail.com';
