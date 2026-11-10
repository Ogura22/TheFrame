"use client";

import { useRef, useState } from "react";
import { Camera, Plus, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoriasItem,
  itens as itensIniciais,
  type CategoriaItem,
  type Item,
} from "@/lib/mock-data";

const PLACEHOLDER_IMG =
  "https://picsum.photos/seed/novo-item/300/300";

function ItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: Item;
  onChange: (next: Item) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...item, imagem: url });
  }

  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative size-14 shrink-0 overflow-hidden rounded-lg border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imagem}
          alt={item.nome}
          className="size-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
          <Camera className="size-4" />
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.nome}</p>
        <Badge variant="secondary" className="mt-0.5 text-[10px]">
          {categoriasItem[item.categoria]}
        </Badge>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-muted-foreground">Preço (R$)</span>
          <Input
            type="number"
            step="0.01"
            value={item.preco}
            onChange={(e) =>
              onChange({ ...item, preco: Number(e.target.value) || 0 })
            }
            className="h-8 w-24"
          />
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-muted-foreground">Estoque</span>
          <Input
            type="number"
            value={item.estoque}
            onChange={(e) =>
              onChange({ ...item, estoque: Number(e.target.value) || 0 })
            }
            className="h-8 w-20"
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function NovoItemDialog({
  open,
  onOpenChange,
  onCriar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (item: Item) => void;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaItem>("material");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function limpar() {
    setNome("");
    setCategoria("material");
    setPreco("");
    setEstoque("");
    setImagem(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagem(URL.createObjectURL(file));
  }

  function handleCriar() {
    if (!nome.trim()) return;
    onCriar({
      id: `novo-${Date.now()}`,
      nome: nome.trim(),
      categoria,
      preco: Number(preco) || 0,
      estoque: Number(estoque) || 0,
      imagem: imagem ?? PLACEHOLDER_IMG,
    });
    limpar();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) limpar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar item</DialogTitle>
          <DialogDescription>
            Cadastre um material, produto ou item de conveniência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative mx-auto flex size-24 items-center justify-center overflow-hidden rounded-lg border bg-muted"
          >
            {imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagem}
                alt="Prévia do item"
                className="size-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="size-5" />
                <span className="text-[10px]">Enviar foto</span>
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <div className="space-y-1.5">
            <Label htmlFor="item-nome">Nome</Label>
            <Input
              id="item-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Luvas de procedimento (par)"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={categoria}
              onValueChange={(v) => v && setCategoria(v as CategoriaItem)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoriasItem).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-preco">Preço (R$)</Label>
              <Input
                id="item-preco"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-estoque">Quantidade</Label>
              <Input
                id="item-estoque"
                type="number"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!nome.trim()} onClick={handleCriar}>
            Adicionar item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StockManager() {
  const [lista, setLista] = useState<Item[]>(itensIniciais);
  const [novoItemOpen, setNovoItemOpen] = useState(false);

  function updateItem(id: string, next: Item) {
    setLista((l) => l.map((i) => (i.id === id ? next : i)));
  }

  function removeItem(id: string) {
    setLista((l) => l.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Clique na foto para enviar uma nova imagem do item. Alterações aqui
          são apenas locais neste protótipo.
        </p>
        <Button size="sm" onClick={() => setNovoItemOpen(true)}>
          <Plus className="size-4" />
          Adicionar item
        </Button>
      </div>
      <div>
        {lista.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onChange={(next) => updateItem(item.id, next)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
        {lista.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum item cadastrado.
          </p>
        )}
      </div>

      <NovoItemDialog
        open={novoItemOpen}
        onOpenChange={setNovoItemOpen}
        onCriar={(item) => setLista((l) => [...l, item])}
      />
    </div>
  );
}
