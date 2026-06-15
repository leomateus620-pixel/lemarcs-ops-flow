import type { CSSProperties, ReactNode, RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhysicsCard } from "@/hooks/usePhysicsCard";
import type { OrderStatus } from "./StatusBadge";

type LemarcAccent = "orange" | "blue" | "steel" | "amber" | "green" | "red";

type AccentConfig = {
  color: string;
  glow: string;
  iconClass: string;
  ringClass: string;
};

const accentConfig: Record<LemarcAccent, AccentConfig> = {
  orange: {
    color: "var(--primary)",
    glow: "oklch(0.72 0.19 50 / 0.58)",
    iconClass: "from-primary/40 via-primary/18 to-white/5 text-primary",
    ringClass: "ring-primary/35",
  },
  blue: {
    color: "var(--status-transit)",
    glow: "oklch(0.7 0.15 230 / 0.46)",
    iconClass: "from-status-transit/36 via-status-transit/14 to-white/5 text-status-transit",
    ringClass: "ring-status-transit/35",
  },
  steel: {
    color: "var(--status-pending)",
    glow: "oklch(0.72 0.025 250 / 0.34)",
    iconClass: "from-status-pending/24 via-steel/18 to-white/5 text-status-pending",
    ringClass: "ring-white/15",
  },
  amber: {
    color: "var(--status-review)",
    glow: "oklch(0.78 0.16 90 / 0.42)",
    iconClass: "from-status-review/36 via-status-review/14 to-white/5 text-status-review",
    ringClass: "ring-status-review/35",
  },
  green: {
    color: "var(--status-done)",
    glow: "oklch(0.7 0.16 155 / 0.34)",
    iconClass: "from-status-done/30 via-status-done/12 to-white/5 text-status-done",
    ringClass: "ring-status-done/30",
  },
  red: {
    color: "var(--destructive)",
    glow: "oklch(0.62 0.22 25 / 0.42)",
    iconClass: "from-destructive/35 via-destructive/14 to-white/5 text-destructive",
    ringClass: "ring-destructive/35",
  },
};

const statusAccent: Record<OrderStatus, LemarcAccent> = {
  pending: "steel",
  transit: "blue",
  running: "orange",
  finished: "green",
  review: "amber",
  approved: "green",
};

type LemarcMetricCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  footerLabel?: string;
  accent?: LemarcAccent;
  trend?: string | number[];
  status?: OrderStatus;
  pageIndex?: number;
  pageCount?: number;
  onClick?: () => void;
  className?: string;
};

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;

  const width = 90;
  const height = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(data.length - 1, 1);
  const points = data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className="h-6 w-[90px] text-[var(--lemarc-card-accent)]"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <polyline
        fill="none"
        points={points}
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.8"
        opacity="0.35"
      />
    </svg>
  );
}

function CardInner({
  title,
  value,
  subtitle,
  icon: Icon,
  footerLabel,
  trend,
  pageIndex = 0,
  pageCount,
}: LemarcMetricCardProps) {
  return (
    <>
      <div aria-hidden="true" className="lemarc-card-glare" />
      <div
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--lemarc-card-accent)] to-transparent opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-5 bottom-5 w-[5px] rounded-r-full bg-[var(--lemarc-card-accent)] shadow-[0_0_22px_var(--lemarc-card-glow)]"
      />

      <div className="relative flex min-h-[190px] flex-col p-5 sm:min-h-[210px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.66rem] font-black uppercase leading-none tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
            <div className="mt-4 font-display text-[2.65rem] font-black leading-[0.88] text-foreground tabular-nums sm:text-5xl">
              {value}
            </div>
            {subtitle && (
              <p className="mt-3 line-clamp-2 text-[0.78rem] font-semibold leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="lemarc-icon-orb relative grid h-14 w-14 shrink-0 place-items-center rounded-3xl transition-transform duration-300 group-hover/card:[transform:translateZ(26px)_scale(1.06)]">
            <Icon size={23} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            {Array.isArray(trend) ? (
              <Sparkline data={trend} />
            ) : trend ? (
              <span className="inline-flex max-w-full rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--lemarc-card-accent)]">
                <span className="truncate">{trend}</span>
              </span>
            ) : null}
          </div>

          {pageCount && pageCount > 1 ? (
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: pageCount }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === pageIndex
                      ? "w-5 bg-[var(--lemarc-card-accent)]"
                      : "w-1.5 bg-white/25",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {footerLabel && (
        <div className="lemarc-card-footer flex items-center justify-between gap-3 px-5 py-3">
          <span className="truncate font-display text-[0.72rem] font-black uppercase tracking-[0.1em] text-foreground">
            {footerLabel}
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--lemarc-card-accent)] transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
        </div>
      )}
    </>
  );
}

export function LemarcMetricCard(props: LemarcMetricCardProps) {
  const {
    accent = props.status ? statusAccent[props.status] : "orange",
    onClick,
    className,
  } = props;
  const physics = usePhysicsCard<HTMLButtonElement | HTMLElement>({
    maxRotate: 7,
    mobileMaxRotate: 2.4,
    lift: -4,
  });
  const cfg = accentConfig[accent];
  const style = {
    ...physics.style,
    "--lemarc-card-accent": cfg.color,
    "--lemarc-card-glow": cfg.glow,
  } as CSSProperties;

  const classes = cn(
    "group/card lemarc-kinetic-card lemarc-card-shell block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
        aria-label={`${props.title}: ${props.value}`}
        {...physics.handlers}
      >
        <div className="contents">
          <CardInner {...props} />
        </div>
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
      <div className="contents">
        <CardInner {...props} />
      </div>
    </article>
  );
}
