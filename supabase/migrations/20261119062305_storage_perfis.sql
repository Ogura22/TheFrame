-- Bucket público para fotos de perfil. Caminho esperado: <user_id>/<arquivo>.
insert into storage.buckets (id, name, public)
values ('perfis', 'perfis', true)
on conflict (id) do nothing;

create policy "fotos de perfil sao publicas para leitura"
on storage.objects for select
using (bucket_id = 'perfis');

create policy "usuario gerencia a propria foto de perfil"
on storage.objects for all
using (
  bucket_id = 'perfis'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'perfis'
  and (storage.foldername(name))[1] = auth.uid()::text
);
