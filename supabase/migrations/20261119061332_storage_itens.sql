-- Bucket público para fotos de itens (materiais/produtos/conveniência).
-- Caminho esperado dos objetos: <clinica_id>/<arquivo>.
insert into storage.buckets (id, name, public)
values ('itens', 'itens', true)
on conflict (id) do nothing;

create policy "fotos de itens sao publicas para leitura"
on storage.objects for select
using (bucket_id = 'itens');

create policy "clinica gerencia fotos dos proprios itens"
on storage.objects for all
using (
  bucket_id = 'itens'
  and (storage.foldername(name))[1] = minha_clinica()::text
)
with check (
  bucket_id = 'itens'
  and (storage.foldername(name))[1] = minha_clinica()::text
);
