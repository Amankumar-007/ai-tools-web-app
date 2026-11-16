"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LightningToggle({
  active,
  onToggle,
  size = "sm",
}: {
  active: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? "Turn off Lightning mode" : "Turn on Lightning mode"}
      aria-pressed={active}
      title={active ? "Turn off Lightning mode" : "Turn on Lightning mode"}
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,box-shadow,transform] duration-300 ease-out active:scale-90",
        size === "md" ? "h-10 w-10" : "h-8 w-8",
        active
          ? "scale-105 bg-amber-100 text-amber-700 shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_0_20px_rgba(245,158,11,0.35)] dark:bg-amber-500/20 dark:text-amber-300"
          : "bg-black/5 text-black/50 hover:bg-amber-50 hover:text-amber-700 dark:bg-white/5 dark:text-white/50 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
      )}
    >
      {active && <span aria-hidden="true" className="lightning-activate-ring pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400" />}
      <Zap
        className={cn("relative z-10 transition-transform duration-300 ease-out", size === "md" ? "h-5 w-5" : "h-4 w-4", active && "-rotate-12 scale-110")}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
