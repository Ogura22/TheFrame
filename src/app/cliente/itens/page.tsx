"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ItemsCatalog, type CatalogItem } from "@/components/items-catalog";
import { useCart } from "@/lib/cart-context";
import { useReservation } from "@/lib/reservation-context";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/mock-data";
import type { ItemDb } from "@/lib/db-types";

const PLACEHOLDER_IMG = "https://picsum.photos/seed/item-sem-foto/300/300";

function paraCatalogo(item: ItemDb): CatalogItem {
  return {
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    preco: item.preco,
    estoque: item.estoque,
    imagem: item.imagem_url ?? PLACEHOLDER_IMG,
  };
}

export default function ItensPage() {
  const router = useRouter();
  const { clinicaId } = useClinica();
  const { cart, setQty } = useCart();
  const { temReservaEmAndamento, solicitarCheckout } = useReservation();
  const [itens, setItens] = useState<ItemDb[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("itens")
      .select("*")
      .eq("clinica_id", clinicaId)
      .order("created_at")
      .then(({ data }) => setItens(data ?? []));
  }, [clinicaId]);

  const linhasCarrinho = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = itens.find((i) => i.id === id);
          return item ? { item, qty } : null;
        })
        .filter((e): e is { item: ItemDb; qty: number } => e !== null),
    [cart, itens]
  );

  const total = linhasCarrinho.reduce(
    (acc, { item, qty }) => acc + item.preco * qty,
    0
  );

  async function handleSolicitar() {
    if (temReservaEmAndamento) {
      solicitarCheckout();
      router.push("/cliente");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: perfil } = user
      ? await supabase.from("perfis").select("nome").eq("id", user.id).single()
      : { data: null };

    const resumo = linhasCarrinho
      .map(({ item, qty }) => `${qty}x ${item.nome}`)
      .join(", ");

    await supabase.from("notificacoes").insert({
      clinica_id: clinicaId,
      tipo: "material",
      titulo: "Solicitação de itens",
      descricao: `${perfil?.nome ?? "Cliente"} solicitou: ${resumo} (${formatCurrency(total)}).`,
    });

    setEnviando(false);
    setFinalizado(true);
  }

  if (finalizado) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pedido enviado!
        </h1>
        <p className="mt-2 text-muted-foreground">
          A clínica foi notificada e vai preparar os itens para sua próxima
          reserva.
        </p>
        <Button
          className="mt-8"
          onClick={() => {
            linhasCarrinho.forEach(({ item }) => setQty(item.id, 0));
            setFinalizado(false);
          }}
        >
          Fazer novo pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 pb-28">
      <h1 className="text-2xl font-semibold tracking-tight">
        Adicionar Itens
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Materiais, produtos e conveniência disponíveis na clínica. O que você
        adicionar aqui também aparece no checkout da sua reserva.
      </p>

      {linhasCarrinho.length > 0 && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Resumo dos itens selecionados</p>
          <ul className="space-y-1 text-sm">
            {linhasCarrinho.map(({ item, qty }) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {qty}x {item.nome}
                </span>
                <span>{formatCurrency(item.preco * qty)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ItemsCatalog itens={itens.map(paraCatalogo)} cart={cart} onQtyChange={setQty} />
      </div>

      {linhasCarrinho.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 shadow-[0_-4px_16px_-8px_rgb(0_0_0_/_0.15)] backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {linhasCarrinho.length} item(s)
                {temReservaEmAndamento && " · reserva em andamento"}
              </p>
              <p className="text-lg font-semibold">{formatCurrency(total)}</p>
            </div>
            <Button size="lg" onClick={handleSolicitar} disabled={enviando}>
              {temReservaEmAndamento
                ? "Ir para o checkout"
                : enviando
                ? "Enviando..."
                : "Solicitar itens"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
