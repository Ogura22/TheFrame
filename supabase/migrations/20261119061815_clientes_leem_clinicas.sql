-- Clientes precisam enxergar a clínica (nome, checkout, planos habilitados)
-- para poder reservar e assinar planos — hoje só a própria clínica e o
-- super admin liam essa tabela.
create policy "qualquer usuario autenticado le clinicas" on clinicas for select
  using (auth.uid() is not null);
