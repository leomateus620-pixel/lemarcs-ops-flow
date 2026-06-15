import { useCallback, useEffect, useRef, useState } from "react";
import type { Key, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LemarcSmartCardScrollerProps<T> = {
  items: T[];
  getKey: (item: T, index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
  snap?: "center" | "start";
  showIndicators?: boolean;
};

function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function LemarcSmartCardScroller<T>({
  items,
  getKey,
  renderItem,
  ariaLabel,
  className,
  itemClassName,
  snap = "center",
  showIndicators = true,
}: LemarcSmartCardScrollerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [activeIndex, setActiveIndex] = useState(0);

  const centerItem = useCallback(
    (index: number) => {
      itemRefs.current[index]?.scrollIntoView({
        behavior: scrollBehavior(),
        block: "nearest",
        inline: snap === "center" ? "center" : "start",
      });
    },
    [snap],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;

    const updateActive = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const center = containerRect.left + containerRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(center - itemCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      });
    };

    updateActive();
    container.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items.length]);

  return (
    <div className={cn("relative", className)}>
      <div className="lemarc-scroll-fade">
        <div
          ref={containerRef}
          role="list"
          aria-label={ariaLabel}
          className={cn(
            "lemarc-smart-scroll flex gap-4 overflow-x-auto px-1 pb-4 pt-1",
            snap === "center" ? "snap-x snap-mandatory" : "snap-x snap-proximity",
          )}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            const container = containerRef.current;
            if (!container) return;
            drag.current = {
              active: true,
              startX: event.clientX,
              scrollLeft: container.scrollLeft,
              moved: false,
            };
            container.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const container = containerRef.current;
            if (!container || !drag.current.active) return;
            const delta = event.clientX - drag.current.startX;
            if (Math.abs(delta) > 4) drag.current.moved = true;
            container.scrollLeft = drag.current.scrollLeft - delta;
          }}
          onPointerUp={() => {
            drag.current.active = false;
          }}
          onPointerCancel={() => {
            drag.current.active = false;
          }}
        >
          {items.map((item, index) => (
            <div
              key={getKey(item, index)}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="listitem"
              className={cn(
                "shrink-0 snap-center",
                snap === "start" && "snap-start",
                itemClassName,
              )}
              onClickCapture={(event) => {
                const container = containerRef.current;
                const element = itemRefs.current[index];
                if (!container || !element) return;

                if (drag.current.moved) {
                  event.preventDefault();
                  event.stopPropagation();
                  drag.current.moved = false;
                  return;
                }

                const containerRect = container.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const partlyHidden =
                  elementRect.left < containerRect.left + 16 ||
                  elementRect.right > containerRect.right - 16;
                if (partlyHidden) {
                  event.preventDefault();
                  event.stopPropagation();
                  centerItem(index);
                }
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {showIndicators && items.length > 1 ? (
        <div className="mt-1 flex justify-center gap-1.5" aria-label="Posição dos cards">
          {items.map((item, index) => (
            <button
              key={getKey(item, index)}
              type="button"
              aria-label={`Ir para card ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => centerItem(index)}
              className={cn(
                "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                activeIndex === index ? "w-6 bg-primary" : "w-1.5 bg-white/25",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
