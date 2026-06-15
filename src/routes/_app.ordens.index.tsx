import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Plus, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { FilterChips, PageHero } from "@/components/app/operations";
import { OrderCard } from "@/components/app/OrderCard";
import { Input } from "@/components/ui/input";
import { statusLabels, type OrderStatus } from "@/components/app/StatusBadge";
import { ordens } from "@/lib/mock/serviceOrders";

export const Route = createFileRoute("/_app/ordens/")({
  head: () => ({ meta: [{ title: "Ordens de serviço — Gestão Lemarc" }] }),
  component: OrdensList,
});

const filters: ({ key: "todas" } | { key: OrderStatus })[] = [
  { key: "todas" },
  { key: "pending" },
  { key: "transit" },
  { key: "running" },
  { key: "finished" },
  { key: "review" },
  { key: "approved" },
];

function OrdensList() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todas" | OrderStatus>("todas");

  const filtered = ordens.filter((ordem) => {
    const searchable =
      `${ordem.numero} ${ordem.titulo} ${ordem.cliente} ${ordem.local}`.toLowerCase();
    const matchesQ = !q || searchable.includes(q.toLowerCase());
    const matchesFilter = filter === "todas" || ordem.status === filter;
    return matchesQ && matchesFilter;
  });

  return (
    <AppShell
      title="Ordens de serviço"
      action={
        <Link
          to="/ordens/nova"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow-orange)]"
          aria-label="Nova OS"
        >
          <Plus size={18} />
        </Link>
      }
    >
      <PageHero
        eyebrow="Execução e acompanhamento"
        title="Ordens"
        description="Busca, filtros por status e timeline operacional para acompanhar campo, revisão e cobrança."
        icon={ClipboardList}
      />

      <div className="mt-5 flex items-center gap-2">
        <div className="glass flex flex-1 items-center gap-2 rounded-2xl px-3">
          <Search size={16} className="text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Buscar por OS, cliente, setor..."
            className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
          />
        </div>
        <button
          type="button"
          className="lemarc-liquid lemarc-pressable grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Ajustar filtros"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      <div className="mt-4">
        <FilterChips
          items={filters.map((item) => ({
            key: item.key,
            label: item.key === "todas" ? "Todas" : statusLabels[item.key],
            count:
              item.key === "todas"
                ? ordens.length
                : ordens.filter((ordem) => ordem.status === item.key).length,
          }))}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {filtered.map((ordem) => (
          <OrderCard key={ordem.id} ordem={ordem} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-5">
          <EmptyState
            icon={Search}
            title="Nenhuma OS encontrada"
            text="Ajuste a busca ou os filtros para localizar ordens de serviço."
          />
        </div>
      )}
    </AppShell>
  );
}
