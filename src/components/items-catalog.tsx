"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  categoriasItem,
  formatCurrency,
  type CategoriaItem,
  type Item,
} from "@/lib/mock-data";

interface ItemsCatalogProps {
  itens: Item[];
  cart: Record<string, number>;
  onQtyChange: (itemId: string, qty: number) => void;
  compact?: boolean;
}

const categorias: Array<CategoriaItem | "todos"> = [
  "todos",
  "material",
  "produto",
  "conveniencia",
];

export function ItemsCatalog({
  itens,
  cart,
  onQtyChange,
  compact = false,
}: ItemsCatalogProps) {
  const [filtro, setFiltro] = useState<CategoriaItem | "todos">("todos");

  const filtrados =
    filtro === "todos" ? itens : itens.filter((i) => i.categoria === filtro);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filtro === c
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {c === "todos" ? "Todos" : categoriasItem[c]}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        )}
      >
        {filtrados.map((item) => {
          const qty = cart[item.id] ?? 0;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imagem}
                alt={item.nome}
                className={cn(
                  "w-full object-cover",
                  compact ? "h-16" : "h-28"
                )}
              />
              <div className="space-y-1.5 p-2">
                <p className="line-clamp-2 text-xs font-medium leading-tight">
                  {item.nome}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {formatCurrency(item.preco)}
                  </span>
                  {!compact && (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.estoque} em estoque
                    </Badge>
                  )}
                </div>

                {qty === 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onQtyChange(item.id, 1)}
                  >
                    Adicionar
                  </Button>
                ) : (
                  <div className="flex items-center justify-between rounded-md border">
                    <button
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                      onClick={() => onQtyChange(item.id, Math.max(0, qty - 1))}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-xs font-medium">{qty}</span>
                    <button
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={qty >= item.estoque}
                      onClick={() => onQtyChange(item.id, qty + 1)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
