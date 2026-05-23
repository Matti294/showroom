-- In Supabase: SQL Editor → New query → Ausführen

create table comments (
  id          bigint generated always as identity primary key,
  project_slug text   not null,
  author       text   not null,
  body         text   not null,
  created_at   timestamptz default now()
);

-- Jeder darf lesen und schreiben (kein Login nötig)
alter table comments enable row level security;

create policy "Kommentare lesen" on comments
  for select using (true);

create policy "Kommentar schreiben" on comments
  for insert with check (true);
