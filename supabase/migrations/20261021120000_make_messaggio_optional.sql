alter table public.richieste
  alter column messaggio drop not null;

alter table public.richieste
  drop constraint if exists richieste_messaggio_check;

alter table public.richieste
  add constraint richieste_messaggio_check
  check (messaggio is null or char_length(messaggio) between 1 and 2000);
