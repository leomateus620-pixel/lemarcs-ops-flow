import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SmartTabItem<T extends string> = {
  key: T;
  label: string;
  count?: number;
  eyebrow?: string;
};

type LemarcSmartTabsProps<T extends string> = {
  items: SmartTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

function reduceMotionBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function LemarcSmartTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel = "Filtros",
  className,
}: LemarcSmartTabsProps<T>) {
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>());

  useEffect(() => {
    const activeButton = buttonRefs.current.get(value);
    activeButton?.scrollIntoView({
      behavior: reduceMotionBehavior(),
      block: "nearest",
      inline: "center",
    });
  }, [value]);

  const moveSelection = (direction: 1 | -1) => {
    const currentIndex = items.findIndex((item) => item.key === value);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    onChange(items[nextIndex].key);
  };

  return (
    <div className={cn("lemarc-scroll-fade -mx-4 px-4", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="lemarc-smart-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 pt-1"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveSelection(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveSelection(-1);
          }
        }}
      >
        {items.map((item) => {
          const active = item.key === value;
          return (
            <button
              key={item.key}
              ref={(node) => {
                if (node) buttonRefs.current.set(item.key, node);
                else buttonRefs.current.delete(item.key);
              }}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.key)}
              className={cn(
                "lemarc-pressable relative shrink-0 snap-center rounded-2xl border px-4 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                active
                  ? "border-primary/70 bg-primary text-primary-foreground shadow-[var(--shadow-glow-orange)]"
                  : "border-white/10 bg-white/7 text-muted-foreground hover:border-primary/35 hover:bg-white/10 hover:text-foreground",
              )}
            >
              {item.eyebrow && (
                <span className="block text-[0.55rem] font-black uppercase tracking-[0.12em] opacity-75">
                  {item.eyebrow}
                </span>
              )}
              <span className="flex items-center gap-2 font-display text-[0.72rem] font-black uppercase tracking-[0.1em]">
                {item.label}
                {typeof item.count === "number" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.62rem] leading-none",
                      active
                        ? "bg-primary-foreground/18 text-primary-foreground"
                        : "bg-white/8 text-muted-foreground",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const LemarcDateRail = LemarcSmartTabs;
