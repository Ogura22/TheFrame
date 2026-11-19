-- The Frame Coworking — schema inicial
-- Espelha a estrutura já validada no protótipo frontend (mock-data.ts).

create extension if not exists pgcrypto;

-- ---------- Tipos ----------

create type tipo_perfil as enum ('super_admin', 'clinica_admin', 'recepcao', 'cliente');
create type checkout_tipo as enum ('automatico', 'com_confirmacao');
create type status_reserva as enum ('confirmada', 'pendente', 'cancelada');
create type categoria_item as enum ('material', 'produto', 'conveniencia');
create type tipo_plano as enum ('avulso', 'flex', 'fixo');
create type status_assinatura as enum ('ativa', 'cancelada');
create type tipo_notificacao as enum ('reserva', 'material', 'pagamento', 'reagendamento');

-- ---------- Clínicas ----------

create table clinicas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text not null unique,
  telefone text,
  email text,
  endereco text,
  cidade text,
  checkout checkout_tipo not null default 'automatico',
  tipos_plano_habilitados tipo_plano[] not null default array['avulso']::tipo_plano[],
  comissao_percentual numeric not null default 8,
  created_at timestamptz not null default now()
);

create table salas (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  nome text not null,
  capacidade int not null default 1,
  valor_hora numeric not null,
  created_at timestamptz not null default now()
);

-- ---------- Perfis (estende auth.users) ----------

create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  tipo tipo_perfil not null default 'cliente',
  clinica_id uuid references clinicas(id) on delete set null,
  nome text not null,
  especialidade text,
  foto_url text,
  cpf text,
  registro_profissional text,
  endereco_cobranca text,
  celular text,
  email text,
  created_at timestamptz not null default now()
);

-- ---------- Itens (materiais / produtos / conveniência) ----------

create table itens (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  nome text not null,
  categoria categoria_item not null,
  preco numeric not null default 0,
  estoque int not null default 0,
  imagem_url text,
  created_at timestamptz not null default now()
);

-- ---------- Reservas ----------

create table reservas (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  cliente_id uuid not null references perfis(id) on delete cascade,
  sala_id uuid not null references salas(id) on delete restrict,
  dia date not null,
  hora_inicio time not null,
  hora_fim time not null,
  valor numeric not null,
  status status_reserva not null default 'pendente',
  pago boolean not null default false,
  created_at timestamptz not null default now(),
  constraint hora_fim_apos_inicio check (hora_fim > hora_inicio)
);

create index reservas_clinica_sala_dia_idx on reservas (clinica_id, sala_id, dia);

create table reserva_itens (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null references reservas(id) on delete cascade,
  item_id uuid not null references itens(id) on delete restrict,
  quantidade int not null default 1,
  preco_unitario numeric not null
);

-- ---------- Política de cancelamento ----------

create table politicas_cancelamento (
  clinica_id uuid primary key references clinicas(id) on delete cascade,
  horas_antecedencia_gratuita int not null default 48,
  percentual_cobrado_fora_prazo numeric not null default 100,
  reagendamento_requer_aprovacao boolean not null default true
);

-- ---------- Notificações ----------

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  tipo tipo_notificacao not null,
  titulo text not null,
  descricao text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Planos ----------

create table planos (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  tipo tipo_plano not null,
  nome text not null,
  valor numeric not null default 0,
  horas_incluidas int,
  recorrencia jsonb,
  itens_inclusos_ids uuid[],
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references perfis(id) on delete cascade,
  plano_id uuid not null references planos(id) on delete restrict,
  horas_restantes numeric,
  status status_assinatura not null default 'ativa',
  proxima_cobranca date,
  created_at timestamptz not null default now()
);

-- ---------- Contratos e aceites ----------

create table contratos (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references clinicas(id) on delete cascade,
  arquivo_url text,
  texto_modelo text,
  created_at timestamptz not null default now()
);

create table aceites_contrato (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfis(id) on delete cascade,
  reserva_id uuid references reservas(id) on delete set null,
  contrato_id uuid references contratos(id) on delete set null,
  hash_contrato text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------

alter table clinicas enable row level security;
alter table salas enable row level security;
alter table perfis enable row level security;
alter table itens enable row level security;
alter table reservas enable row level security;
alter table reserva_itens enable row level security;
alter table politicas_cancelamento enable row level security;
alter table notificacoes enable row level security;
alter table planos enable row level security;
alter table assinaturas enable row level security;
alter table contratos enable row level security;
alter table aceites_contrato enable row level security;

-- Funções auxiliares para checar papel/clínica do usuário logado sem recursão de RLS.
create or replace function meu_tipo()
returns tipo_perfil
language sql stable security definer set search_path = public as $$
  select tipo from perfis where id = auth.uid();
$$;

create or replace function minha_clinica()
returns uuid
language sql stable security definer set search_path = public as $$
  select clinica_id from perfis where id = auth.uid();
$$;

-- Super admin vê tudo; clínica vê o que é da própria clinica_id; cliente vê o que é seu.

create policy "super admin tudo - clinicas" on clinicas for all
  using (meu_tipo() = 'super_admin') with check (meu_tipo() = 'super_admin');
create policy "clinica le a propria" on clinicas for select
  using (id = minha_clinica());

create policy "super admin tudo - perfis" on perfis for all
  using (meu_tipo() = 'super_admin') with check (meu_tipo() = 'super_admin');
create policy "usuario le e edita o proprio perfil" on perfis for select using (id = auth.uid());
create policy "usuario edita o proprio perfil" on perfis for update using (id = auth.uid());
create policy "clinica le perfis de seus clientes" on perfis for select
  using (clinica_id = minha_clinica() and meu_tipo() in ('clinica_admin', 'recepcao'));

create policy "salas por clinica" on salas for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "clientes leem salas da clinica" on salas for select
  using (true);

create policy "itens por clinica" on itens for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "clientes leem itens da clinica" on itens for select
  using (true);

create policy "reservas da clinica" on reservas for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "cliente ve e cria suas reservas" on reservas for all
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

create policy "reserva_itens segue a reserva" on reserva_itens for all
  using (exists (
    select 1 from reservas r
    where r.id = reserva_itens.reserva_id
      and (r.cliente_id = auth.uid() or r.clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  ));

create policy "politica por clinica" on politicas_cancelamento for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "clientes leem politica da clinica" on politicas_cancelamento for select
  using (true);

create policy "notificacoes da clinica" on notificacoes for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');

create policy "planos por clinica" on planos for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "clientes leem planos da clinica" on planos for select
  using (true);

create policy "assinaturas do cliente" on assinaturas for all
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());
create policy "clinica le assinaturas de seus clientes" on assinaturas for select
  using (exists (
    select 1 from perfis p where p.id = assinaturas.cliente_id and p.clinica_id = minha_clinica()
  ) or meu_tipo() = 'super_admin');

create policy "contratos por clinica" on contratos for all
  using (clinica_id = minha_clinica() or meu_tipo() = 'super_admin')
  with check (clinica_id = minha_clinica() or meu_tipo() = 'super_admin');
create policy "clientes leem contrato da clinica" on contratos for select
  using (true);

create policy "aceite e so do proprio usuario" on aceites_contrato for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
create policy "clinica le aceites de seus clientes" on aceites_contrato for select
  using (exists (
    select 1 from perfis p where p.id = aceites_contrato.usuario_id and p.clinica_id = minha_clinica()
  ) or meu_tipo() = 'super_admin');
