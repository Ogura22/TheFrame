-- Permite que o próprio usuário crie sua linha em perfis (fallback manual).
create policy "usuario cria o proprio perfil" on perfis for insert
  with check (id = auth.uid());

-- Padrão recomendado pelo Supabase: cria o perfil automaticamente via trigger
-- assim que o usuário se cadastra no Auth, lendo os metadados enviados no
-- signUp (nome, celular, especialidade, cpf, registro_profissional).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, tipo, nome, email, celular, especialidade, cpf, registro_profissional)
  values (
    new.id,
    'cliente',
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    new.raw_user_meta_data->>'celular',
    new.raw_user_meta_data->>'especialidade',
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'registro_profissional'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
