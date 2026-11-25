-- Cada plano (inclusive o avulso) passa a ter suas próprias regras de
-- agendamento, já que a plataforma escala para múltiplas clínicas com
-- políticas diferentes entre si e entre planos de uma mesma clínica.
alter table planos
  add column horas_minimas int not null default 1,
  add column horas_antecedencia_remarcacao int;

comment on column planos.horas_minimas is
  'Duração mínima (em horas) de uma reserva feita sob este plano.';
comment on column planos.horas_antecedencia_remarcacao is
  'Antecedência mínima (em horas) para remarcar sem cobrança adicional. Nulo = usa a política geral da clínica.';

-- O plano "avulso" agora precisa existir como linha de verdade (antes era
-- só uma constante no front) para poder carregar essas configurações.
-- Backfill para clínicas que já existem e ainda não têm um avulso.
insert into planos (clinica_id, tipo, nome, valor, horas_minimas, ativo)
select c.id, 'avulso', 'Avulso', 0, 1, true
from clinicas c
where not exists (
  select 1 from planos p where p.clinica_id = c.id and p.tipo = 'avulso'
);
