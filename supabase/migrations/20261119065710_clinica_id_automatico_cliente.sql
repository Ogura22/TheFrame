-- Antes, o app "adivinhava" a clínica do cliente pela ordem de criação
-- (frágil e causou bug real: cliente caindo na clínica errada). Agora a
-- clinica_id do cliente é decidida e gravada no momento do cadastro:
--
-- 1. Se o cadastro informar clinica_id explicitamente (metadado, usado por
--    links de cadastro específicos de cada clínica no futuro) — usa esse.
-- 2. Senão, se existir exatamente UMA clínica ativa no sistema (nosso
--    cenário atual, só a clínica da Dra. Karen) — vincula automaticamente.
-- 3. Senão (múltiplas clínicas, sem link específico) — fica sem clínica,
--    e o app deve pedir para o cliente escolher.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  tipo_resolvido tipo_perfil;
  clinica_resolvida uuid;
begin
  tipo_resolvido := coalesce((new.raw_user_meta_data->>'tipo')::tipo_perfil, 'cliente');

  clinica_resolvida := nullif(new.raw_user_meta_data->>'clinica_id', '')::uuid;

  if clinica_resolvida is null and tipo_resolvido = 'cliente' then
    select id into clinica_resolvida
    from clinicas
    where (select count(*) from clinicas) = 1
    limit 1;
  end if;

  insert into public.perfis (
    id, tipo, clinica_id, nome, email, celular, especialidade, cpf, registro_profissional
  )
  values (
    new.id,
    tipo_resolvido,
    clinica_resolvida,
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
