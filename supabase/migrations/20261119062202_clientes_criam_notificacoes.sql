-- Clientes precisam poder notificar a clínica (ex: solicitação de itens
-- avulsa) mesmo sem fazer parte do staff dela. Leitura continua restrita
-- à própria clínica/super admin pela policy já existente.
create policy "clientes autenticados criam notificacoes" on notificacoes for insert
  with check (auth.uid() is not null);
