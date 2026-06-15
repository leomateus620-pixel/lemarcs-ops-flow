import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Play,
  Receipt,
  Route as RouteIcon,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { LemarcMetricCard } from "@/components/app/LemarcMetricCard";
import { LemarcSmartCardScroller } from "@/components/app/LemarcSmartCardScroller";
import { OrderCard } from "@/components/app/OrderCard";
import { useRole } from "@/components/app/RoleContext";
import { OperationalFlow, PageHero, PrimaryCTA } from "@/components/app/operations";
import { ordens, ordensStats } from "@/lib/mock/serviceOrders";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Central de Operação — Gestão Lemarc" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { role, name } = useRole();
  return (
    <AppShell>
      {role === "gestor" ? <GestorView name={name} /> : <ColaboradorView name={name} />}
    </AppShell>
  );
}

type DashboardMetric = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  footerLabel: string;
  accent: "orange" | "blue" | "steel" | "amber" | "green" | "red";
  trend: string | number[];
  route: "/ordens" | "/clientes" | "/relatorios" | "/colaboradores";
};

function GestorView({ name }: { name: string }) {
  const navigate = useNavigate();
  const emAndamento = ordens.filter((ordem) => ["running", "transit"].includes(ordem.status));
  const clientesAtivos = new Set(ordens.map((ordem) => ordem.cliente)).size;
  const tecnicosEmCampo = new Set(emAndamento.map((ordem) => ordem.colaborador)).size;
  const alertas = ordens.filter((ordem) => ordem.prioridade === "alta").length;
  const concluidas = ordens.filter((ordem) =>
    ["finished", "approved"].includes(ordem.status),
  ).length;

  const metrics: DashboardMetric[] = [
    {
      title: "Ordens pendentes",
      value: ordens.filter((ordem) => ordem.status === "pending").length,
      subtitle: "Fila aguardando despacho técnico.",
      icon: ClipboardList,
      footerLabel: "Abrir ordens",
      accent: "steel",
      trend: [2, 3, 3, 4, 3, 4, ordensStats.abertas],
      route: "/ordens",
    },
    {
      title: "Em andamento",
      value: ordensStats.emExecucao,
      subtitle: "Serviços ativos com apontamento de campo.",
      icon: Activity,
      footerLabel: "Acompanhar campo",
      accent: "orange",
      trend: "ao vivo",
      route: "/ordens",
    },
    {
      title: "Clientes ativos",
      value: clientesAtivos,
      subtitle: "Unidades com OS recente ou aberta.",
      icon: Building2,
      footerLabel: "Ver carteira",
      accent: "blue",
      trend: [1, 2, 2, 3, 3, clientesAtivos],
      route: "/clientes",
    },
    {
      title: "Técnicos em campo",
      value: tecnicosEmCampo,
      subtitle: "Equipes em execução ou deslocamento.",
      icon: HardHat,
      footerLabel: "Ver equipe",
      accent: "orange",
      trend: "turno atual",
      route: "/colaboradores",
    },
    {
      title: "Relatórios",
      value: `R$ ${Math.round(ordensStats.valorEstimado / 1000)}k`,
      subtitle: "Pré-cobrança estimada no mês.",
      icon: Receipt,
      footerLabel: "Gerar relatório",
      accent: "amber",
      trend: [18, 22, 25, 31, 36, 42],
      route: "/relatorios",
    },
    {
      title: "Alertas",
      value: alertas,
      subtitle: "Prioridade alta, urgência ou risco operacional.",
      icon: AlertTriangle,
      footerLabel: "Tratar alertas",
      accent: "red",
      trend: "atenção",
      route: "/ordens",
    },
    {
      title: "Prioridades",
      value: ordensStats.aguardandoRevisao,
      subtitle: "Itens parados em revisão e cobrança.",
      icon: ShieldCheck,
      footerLabel: "Revisar agora",
      accent: "amber",
      trend: [4, 3, 3, 2, 2, ordensStats.aguardandoRevisao],
      route: "/ordens",
    },
    {
      title: "Serviços concluídos",
      value: concluidas,
      subtitle: "OS finalizadas ou aprovadas para cobrança.",
      icon: CheckCircle2,
      footerLabel: "Ver concluídas",
      accent: "green",
      trend: "pronto",
      route: "/ordens",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Operação de hoje"
        title={`Olá, ${name.split(" ")[0]}.`}
        description={`${ordensStats.abertas} OS abertas · ${ordensStats.emExecucao} em execução · ${ordensStats.aguardandoRevisao} aguardando revisão`}
        action={
          <PrimaryCTA to="/ordens/nova" icon={ClipboardList}>
            Nova OS
          </PrimaryCTA>
        }
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <LemarcMetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            footerLabel={metric.footerLabel}
            accent={metric.accent}
            trend={metric.trend}
            pageCount={4}
            pageIndex={index % 4}
            onClick={() => navigate({ to: metric.route })}
          />
        ))}
      </div>

      <div className="mt-5">
        <OperationalFlow active={1} />
      </div>

      <section className="mt-6">
        <Header title="OS em andamento agora" to="/ordens" />
        <LemarcSmartCardScroller
          items={emAndamento}
          getKey={(ordem) => ordem.id}
          renderItem={(ordem) => <OrderCard ordem={ordem} />}
          ariaLabel="Ordens em andamento"
          itemClassName="w-[min(88vw,28rem)] sm:w-[27rem] lg:w-[30rem]"
        />
      </section>

      <section className="mt-6">
        <Header title="Ordens recentes" to="/ordens" />
        <div className="grid gap-4 xl:grid-cols-2">
          {ordens.slice(0, 4).map((ordem) => (
            <OrderCard key={ordem.id} ordem={ordem} />
          ))}
        </div>
      </section>
    </>
  );
}

function ColaboradorView({ name }: { name: string }) {
  const minhas = ordens.filter((ordem) => ordem.colaborador === "Carlos Henrique Silva");
  const proxima = minhas[0] ?? ordens[0];
  const checks = ["Saída", "Chegada", "Execução", "Fotos", "Finalização"];

  return (
    <>
      <PageHero
        eyebrow="Tela de campo"
        title={`Bom dia, ${name.split(" ")[0]}.`}
        description={`${minhas.length} OS para hoje · status: pronto para atendimento`}
        icon={ShieldCheck}
      />

      <section className="mt-5">
        <Header title="Próxima OS" to={`/ordens/${proxima.id}`} />
        <OrderCard ordem={proxima} />
        <div className="mt-4">
          <PrimaryCTA to={`/ordens/${proxima.id}`} icon={Play}>
            Iniciar atendimento
          </PrimaryCTA>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {checks.map((check, index) => (
          <div key={check} className="lemarc-time-block rounded-2xl p-2 text-center">
            <div
              className={
                index < 2
                  ? "mx-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]"
                  : "mx-auto h-2 w-2 rounded-full bg-muted-foreground/45"
              }
            />
            <div className="mt-1 truncate text-[0.56rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
              {check}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <Header title="OS do dia" to="/ordens" />
        <div className="grid gap-4 xl:grid-cols-2">
          {minhas.map((ordem) => (
            <OrderCard key={ordem.id} ordem={ordem} />
          ))}
        </div>
      </section>
    </>
  );
}

function Header({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="section-title flex items-center gap-2">
        <RouteIcon size={14} />
        {title}
      </h2>
      <Link to={to} className="text-xs font-bold text-primary">
        Ver todas
      </Link>
    </div>
  );
}
