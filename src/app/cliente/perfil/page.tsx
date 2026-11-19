"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clienteLogado, clientesDetalhe } from "@/lib/mock-data";

export default function PerfilPage() {
  const original = clientesDetalhe.find((c) => c.nome === clienteLogado)!;
  const [perfil, setPerfil] = useState(original);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Dados usados no contrato, na cobrança e no contato com a clínica.
      </p>

      <div className="mt-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={perfil.foto}
          alt={perfil.nome}
          className="size-20 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{perfil.nome}</p>
          <p className="text-sm text-muted-foreground">{perfil.especialidade}</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={perfil.nome}
              onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              value={perfil.especialidade}
              onChange={(e) =>
                setPerfil({ ...perfil, especialidade: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={perfil.cpf} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço de cobrança</Label>
            <Input
              id="endereco"
              value={perfil.enderecoCobranca}
              onChange={(e) =>
                setPerfil({ ...perfil, enderecoCobranca: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                value={perfil.celular}
                onChange={(e) =>
                  setPerfil({ ...perfil, celular: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={perfil.email}
                onChange={(e) =>
                  setPerfil({ ...perfil, email: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button>Salvar alterações</Button>
        <Button variant="outline" onClick={() => setResetOpen(true)}>
          Redefinir senha
        </Button>
      </div>

      <Dialog
        open={resetOpen}
        onOpenChange={(o) => {
          setResetOpen(o);
          if (!o) setResetEnviado(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              {resetEnviado
                ? `Enviamos um link de redefinição para ${perfil.email}.`
                : "Vamos enviar um link de redefinição de senha para o seu e-mail cadastrado."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!resetEnviado && (
              <Button onClick={() => setResetEnviado(true)}>
                Enviar link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
