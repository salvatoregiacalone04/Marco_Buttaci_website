create table public.richieste (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  messaggio text not null check (char_length(messaggio) between 1 and 2000),
  notifica_inviata boolean not null default false,
  conferma_inviata boolean not null default false
);

alter table public.richieste enable row level security;
