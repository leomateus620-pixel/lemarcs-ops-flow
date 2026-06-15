import { useNavigate } from "@tanstack/react-router";
import { Camera, Clock, Gauge, MapPinned } from "lucide-react";
import { LemarcTimelineCard } from "./LemarcTimelineCard";
import type { Ordem } from "@/lib/mock/serviceOrders";
import type { OrderStatus } from "./StatusBadge";

const statusPeriod: Record<OrderStatus, string> = {
  pending: "Pendente",
  transit: "Trânsito",
  running: "Execução",
  finished: "Final",
  review: "Revisão",
  approved: "Aprovada",
};

function lastTimelineTime(ordem: Ordem) {
  const lastDone = [...ordem.timeline]
    .reverse()
    .find((step) => step.concluida && step.hora !== "—");
  return lastDone?.hora;
}

function workTimeLabel(minutes: number) {
  if (!minutes) return "Sem apontamento";
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

export function OrderCard({ ordem }: { ordem: Ordem }) {
  const navigate = useNavigate();
  const elapsed = workTimeLabel(ordem.tempoTrabalhadoMin);

  return (
    <LemarcTimelineCard
      startTime={ordem.horario}
      endTime={lastTimelineTime(ordem)}
      period={ordem.data}
      eyebrow={`OS #${ordem.numero} · ${ordem.area}`}
      title={ordem.titulo}
      client={`${ordem.cliente} · ${ordem.unidade}`}
      location={ordem.local}
      responsible={ordem.colaborador}
      resource={ordem.materiais[0] ?? ordem.area}
      team={ordem.equipe}
      priority={ordem.prioridade}
      status={ordem.status}
      safetyLabel={statusPeriod[ordem.status]}
      onClick={() => navigate({ to: "/ordens/$id", params: { id: ordem.id } })}
    >
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[0.68rem] font-bold text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPinned className="h-3.5 w-3.5 shrink-0 text-[var(--lemarc-card-accent)]" />
          <span className="truncate">{ordem.distanciaKm} km</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 shrink-0 text-[var(--lemarc-card-accent)]" />
          <span className="truncate">{elapsed}</span>
        </span>
        <span className="inline-flex min-w-0 items-center justify-end gap-1.5 text-right">
          {ordem.fotos ? (
            <Camera className="h-3.5 w-3.5 shrink-0 text-[var(--lemarc-card-accent)]" />
          ) : (
            <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--lemarc-card-accent)]" />
          )}
          <span className="truncate">{ordem.fotos ? `${ordem.fotos} fotos` : "Sem fotos"}</span>
        </span>
      </div>
    </LemarcTimelineCard>
  );
}
