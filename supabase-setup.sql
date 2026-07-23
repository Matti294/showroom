-- In Supabase: SQL Editor → New query → Ausführen

create table comments (
  id          bigint generated always as identity primary key,
  project_slug text   not null,
  author       text   not null,
  body         text   not null,
  created_at   timestamptz default now()
);

alter table comments enable row level security;

create policy "Kommentare lesen" on comments
  for select using (true);

create policy "Kommentar schreiben" on comments
  for insert with check (true);

create policy "Kommentar loeschen" on comments
  for delete using (true);

-- Referenz-Links (neue Tabelle)
create table links (
  id          bigint generated always as identity primary key,
  url         text        not null,
  title       text        not null,
  description text,
  author      text        not null,
  created_at  timestamptz default now()
);

alter table links enable row level security;

create policy "Links lesen"     on links for select using (true);
create policy "Links schreiben" on links for insert with check (true);
create policy "Links loeschen"  on links for delete using (true);
