"use client";

import { useEffect, useRef, useState } from "react";
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
import { categoriasItemDb, type CategoriaItemDb, type ItemDb } from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";

const PLACEHOLDER_IMG = "https://picsum.photos/seed/novo-item/300/300";

async function enviarFoto(file: File, clinicaId: string, itemId: string) {
  const supabase = createClient();
  const caminho = `${clinicaId}/${itemId}-${Date.now()}.${file.name.split(".").pop()}`;
  const { error } = await supabase.storage.from("itens").upload(caminho, file, {
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from("itens").getPublicUrl(caminho);
  return data.publicUrl;
}

function ItemRow({
  item,
  clinicaId,
  onChange,
  onRemove,
}: {
  item: ItemDb;
  clinicaId: string;
  onChange: (next: ItemDb) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await enviarFoto(file, clinicaId, item.id);
    if (!url) return;
    await supabase.from("itens").update({ imagem_url: url }).eq("id", item.id);
    onChange({ ...item, imagem_url: url });
  }

  async function salvar(campo: "preco" | "estoque", valor: number) {
    const next = { ...item, [campo]: valor };
    onChange(next);
    await supabase.from("itens").update({ [campo]: valor }).eq("id", item.id);
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
          src={item.imagem_url ?? PLACEHOLDER_IMG}
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
          {categoriasItemDb[item.categoria]}
        </Badge>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-muted-foreground">Preço (R$)</span>
          <Input
            type="number"
            step="0.01"
            value={item.preco}
            onChange={(e) => salvar("preco", Number(e.target.value) || 0)}
            className="h-8 w-24"
          />
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-muted-foreground">Estoque</span>
          <Input
            type="number"
            value={item.estoque}
            onChange={(e) => salvar("estoque", Number(e.target.value) || 0)}
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
  onCriar: (dados: {
    nome: string;
    categoria: CategoriaItemDb;
    preco: number;
    estoque: number;
    arquivoFoto: File | null;
  }) => void;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaItemDb>("material");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function limpar() {
    setNome("");
    setCategoria("material");
    setPreco("");
    setEstoque("");
    setArquivoFoto(null);
    setPrevia(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivoFoto(file);
    setPrevia(URL.createObjectURL(file));
  }

  function handleCriar() {
    if (!nome.trim()) return;
    onCriar({
      nome: nome.trim(),
      categoria,
      preco: Number(preco) || 0,
      estoque: Number(estoque) || 0,
      arquivoFoto,
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
            {previa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previa} alt="Prévia do item" className="size-full object-cover" />
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
              onValueChange={(v) => v && setCategoria(v as CategoriaItemDb)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: CategoriaItemDb) => categoriasItemDb[v]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoriasItemDb).map(([value, label]) => (
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
  const { clinicaId } = useClinica();
  const [lista, setLista] = useState<ItemDb[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoItemOpen, setNovoItemOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("itens")
      .select("*")
      .eq("clinica_id", clinicaId)
      .order("created_at")
      .then(({ data }) => {
        setLista(data ?? []);
        setCarregando(false);
      });
  }, [clinicaId]);

  function updateItem(id: string, next: ItemDb) {
    setLista((l) => l.map((i) => (i.id === id ? next : i)));
  }

  async function removeItem(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("itens").delete().eq("id", id);
    if (!error) setLista((l) => l.filter((i) => i.id !== id));
  }

  async function criar(dados: {
    nome: string;
    categoria: CategoriaItemDb;
    preco: number;
    estoque: number;
    arquivoFoto: File | null;
  }) {
    const supabase = createClient();
    const { data: item, error } = await supabase
      .from("itens")
      .insert({
        clinica_id: clinicaId,
        nome: dados.nome,
        categoria: dados.categoria,
        preco: dados.preco,
        estoque: dados.estoque,
      })
      .select("*")
      .single();

    if (error || !item) return;

    let imagemUrl: string | null = null;
    if (dados.arquivoFoto) {
      imagemUrl = await enviarFoto(dados.arquivoFoto, clinicaId, item.id);
      if (imagemUrl) {
        await supabase.from("itens").update({ imagem_url: imagemUrl }).eq("id", item.id);
      }
    }

    setLista((l) => [...l, { ...item, imagem_url: imagemUrl }]);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Clique na foto para enviar uma nova imagem do item.
        </p>
        <Button size="sm" onClick={() => setNovoItemOpen(true)}>
          <Plus className="size-4" />
          Adicionar item
        </Button>
      </div>
      <div>
        {carregando && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Carregando...
          </p>
        )}
        {!carregando &&
          lista.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              clinicaId={clinicaId}
              onChange={(next) => updateItem(item.id, next)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        {!carregando && lista.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum item cadastrado.
          </p>
        )}
      </div>

      <NovoItemDialog open={novoItemOpen} onOpenChange={setNovoItemOpen} onCriar={criar} />
    </div>
  );
}
