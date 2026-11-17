-- Execute no SQL Editor do Supabase.
create table if not exists public.site_content (
  id bigint primary key check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- Cada administrador pode consultar somente o próprio cadastro.
drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record" on public.admin_users
for select to authenticated using (user_id = auth.uid());

-- Leitura pública do conteúdo publicado.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content" on public.site_content
for select to anon, authenticated using (true);

-- Somente usuários cadastrados em admin_users podem alterar conteúdo.
drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content" on public.site_content
for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content" on public.site_content
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into public.site_content(id, content)
values (1, jsonb_build_object(
  'title','Filmes, séries e futebol ao vivo em um só lugar',
  'subtitle','Milhares de opções de entretenimento para assistir nos seus dispositivos favoritos.',
  'whatsapp','5511940802230',
  'cards','[]'::jsonb,
  'plans','[]'::jsonb
))
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('maxplus-images','maxplus-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=8388608;

drop policy if exists "Public can view maxplus images" on storage.objects;
create policy "Public can view maxplus images" on storage.objects
for select to anon, authenticated using (bucket_id = 'maxplus-images');

drop policy if exists "Admins can upload maxplus images" on storage.objects;
create policy "Admins can upload maxplus images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'maxplus-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update maxplus images" on storage.objects;
create policy "Admins can update maxplus images" on storage.objects
for update to authenticated
using (
  bucket_id = 'maxplus-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'maxplus-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "Admins can delete maxplus images" on storage.objects;
create policy "Admins can delete maxplus images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'maxplus-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);
