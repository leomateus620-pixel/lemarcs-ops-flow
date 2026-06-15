import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  CalendarClock,
  ChevronRight,
  Factory,
  HardHat,
  MapPin,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhysicsCard } from "@/hooks/usePhysicsCard";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, statusLabels, type OrderStatus } from "./StatusBadge";

type TimelineAccent = "orange" | "blue" | "steel" | "amber" | "green";

const accentColor: Record<TimelineAccent, { color: string; glow: string }> = {
  orange: { color: "var(--primary)", glow: "oklch(0.72 0.19 50 / 0.54)" },
  blue: { color: "var(--status-transit)", glow: "oklch(0.7 0.15 230 / 0.42)" },
  steel: { color: "var(--status-pending)", glow: "oklch(0.72 0.025 250 / 0.32)" },
  amber: { color: "var(--status-review)", glow: "oklch(0.78 0.16 90 / 0.42)" },
  green: { color: "var(--status-done)", glow: "oklch(0.7 0.16 155 / 0.32)" },
};

const statusAccent: Record<OrderStatus, TimelineAccent> = {
  pending: "steel",
  transit: "blue",
  running: "orange",
  finished: "green",
  review: "amber",
  approved: "green",
};

type LemarcTimelineCardProps = {
  startTime: string;
  endTime?: string;
  period?: string;
  title: string;
  client: string;
  location?: string;
  responsible?: string;
  resource?: string;
  team?: string[] | string;
  priority?: Priority;
  status: OrderStatus;
  accent?: TimelineAccent;
  eyebrow?: string;
  safetyLabel?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

function MetaLine({
  icon: Icon,
  children,
  strong,
}: {
  icon: typeof Factory;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-[0.72rem]",
        strong ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--lemarc-card-accent)]" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function TimelineInner({
  startTime,
  endTime,
  period,
  title,
  client,
  location,
  responsible,
  resource,
  team,
  priority,
  status,
  eyebrow,
  safetyLabel = "Segurança OK",
  children,
}: LemarcTimelineCardProps) {
  const teamText = Array.isArray(team) ? team.join(" + ") : team;

  return (
    <>
      <div aria-hidden="true" className="lemarc-card-glare" />
      <div
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--lemarc-card-accent)] to-transparent opacity-65"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-4 bottom-4 w-[6px] rounded-r-full bg-[var(--lemarc-card-accent)] shadow-[0_0_24px_var(--lemarc-card-glow)]"
      />

      <div className="relative flex gap-3 p-4 pl-5 sm:gap-4 sm:p-5 sm:pl-6">
        <div className="lemarc-time-block w-[74px] shrink-0 rounded-3xl px-2.5 py-3 text-center sm:w-[86px]">
          <span className="block font-display text-lg font-black leading-none text-foreground tabular-nums sm:text-xl">
            {startTime}
          </span>
          {endTime && (
            <span className="mt-1 block text-[0.66rem] font-bold text-muted-foreground tabular-nums">
              {endTime}
            </span>
          )}
          {period && (
            <span className="mt-2 inline-flex max-w-full rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.1em] text-[var(--lemarc-card-accent)]">
              <span className="truncate">{period}</span>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p className="truncate text-[0.64rem] font-black uppercase tracking-[0.12em] text-[var(--lemarc-card-accent)]">
                  {eyebrow}
                </p>
              )}
              <h3 className="mt-1 line-clamp-2 font-display text-base font-black leading-tight text-foreground sm:text-lg">
                {title}
              </h3>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/timeline:translate-x-1 group-hover/timeline:text-[var(--lemarc-card-accent)]" />
          </div>

          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            <MetaLine icon={Factory} strong>
              {client}
            </MetaLine>
            {location && <MetaLine icon={MapPin}>{location}</MetaLine>}
            {responsible && <MetaLine icon={HardHat}>{responsible}</MetaLine>}
            {teamText && <MetaLine icon={Users}>{teamText}</MetaLine>}
            {resource && <MetaLine icon={Wrench}>{resource}</MetaLine>}
            <MetaLine icon={CalendarClock}>{statusLabels[status]}</MetaLine>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {priority && <PriorityBadge prioridade={priority} />}
            <StatusBadge status={status} />
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-[var(--lemarc-card-accent)]" />
              {safetyLabel}
            </span>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}

export function LemarcTimelineCard(props: LemarcTimelineCardProps) {
  const { accent = statusAccent[props.status], onClick, className } = props;
  const physics = usePhysicsCard<HTMLButtonElement | HTMLElement>({
    maxRotate: 5.5,
    mobileMaxRotate: 1.8,
    lift: -2,
  });
  const cfg = accentColor[accent];
  const style = {
    ...physics.style,
    "--lemarc-card-accent": cfg.color,
    "--lemarc-card-glow": cfg.glow,
  } as CSSProperties;

  const classes = cn(
    "group/timeline lemarc-kinetic-card lemarc-timeline-card block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  if (onClick) {
    return (
      <button
        ref={physics.ref as RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        className={classes}
        style={style}
        data-kinetic-active={physics.active}
        aria-label={`${props.title}, ${statusLabels[props.status]}, ${props.client}`}
        {...physics.handlers}
      >
        <TimelineInner {...props} />
      </button>
    );
  }

  return (
    <article
      ref={physics.ref as RefObject<HTMLElement>}
      className={classes}
      style={style}
      data-kinetic-active={physics.active}
      {...physics.handlers}
    >
      <TimelineInner {...props} />
    </article>
  );
}
