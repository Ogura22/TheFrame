-- Permite que o cadastro de usuários feito pelo Super Admin (via Admin API,
-- fora do signUp público) já defina o tipo de perfil e a clínica vinculada
-- através dos metadados do usuário, em vez de sempre cair como 'cliente'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (
    id, tipo, clinica_id, nome, email, celular, especialidade, cpf, registro_profissional
  )
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'tipo')::tipo_perfil, 'cliente'),
    nullif(new.raw_user_meta_data->>'clinica_id', '')::uuid,
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
