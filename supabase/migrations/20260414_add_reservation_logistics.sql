alter table public.reservations
  add column if not exists transport_mode text check (transport_mode in ('train', 'avion', 'voiture', 'bus')),
  add column if not exists arrival_location text,
  add column if not exists needs_transfer boolean not null default false,
  add column if not exists diet_type text,
  add column if not exists food_allergies text,
  add column if not exists food_intolerances text,
  add column if not exists diet_notes text,
  add column if not exists logistics_notes text,
  add column if not exists accommodation_type text,
  add column if not exists arrival_time text,
  add column if not exists departure_time text;
