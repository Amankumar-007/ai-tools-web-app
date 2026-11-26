"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Check, Palette } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Accent themes for the chat. Only the accent changes (buttons, your messages,
 * active items, focus rings); light/dark mode stays separate.
 *
 * `soft`, `ink` and `line` have a light and a dark value so each theme reads well in both modes.
 */
export const ACCENTS = [
  { id: "rose", label: "Rose", accent: "#8b4569", hover: "#773a5a", soft: ["#f9eaf1", "#412b37"], ink: ["#783955", "#f4c7db"], line: ["#c85d92", "#dc77a6"] },
  { id: "ocean", label: "Ocean", accent: "#1d6fa5", hover: "#165a87", soft: ["#e6f2fa", "#1b2f3d"], ink: ["#14527a", "#b9dcf3"], line: ["#4f9fcc", "#6bb6e0"] },
  { id: "forest", label: "Forest", accent: "#2f7a5a", hover: "#256449", soft: ["#e7f4ed", "#1c3328"], ink: ["#1f6246", "#b6e2cc"], line: ["#4fa683", "#6cc49c"] },
  { id: "violet", label: "Violet", accent: "#6d4fc2", hover: "#5a3fa8", soft: ["#efeafb", "#2b2540"], ink: ["#54399e", "#d3c6f5"], line: ["#8f77dc", "#a994ec"] },
  { id: "amber", label: "Amber", accent: "#b86a14", hover: "#9a5710", soft: ["#fbf0df", "#3a2c17"], ink: ["#8a4f0e", "#f5d9a8"], line: ["#d49448", "#e6b36e"] },
  { id: "graphite", label: "Graphite", accent: "#3f3f46", hover: "#27272a", soft: ["#f0f0f1", "#2a2a2d"], ink: ["#3f3f46", "#e4e4e7"], line: ["#85858f", "#a1a1aa"], darkAccent: "#52525b", darkHover: "#63636b" },
] as const

export type AccentId = (typeof ACCENTS)[number]["id"]
export const DEFAULT_ACCENT: AccentId = "rose"
export const ACCENT_STORAGE_KEY = "tomato_ai_accent"

export function isAccentId(value: unknown): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value)
}

/** CSS custom properties for every theme, keyed off `data-accent` and the `dark` class on <html>. */
export function accentCss(): string {
  const block = (selector: string, vars: Record<string, string>) =>
    `${selector}{${Object.entries(vars).map(([name, value]) => `--${name}:${value};`).join("")}}`
  return ACCENTS.map((theme) => {
    const light = { accent: theme.accent, "accent-hover": theme.hover, "accent-soft": theme.soft[0], "accent-ink": theme.ink[0], "accent-line": theme.line[0] }
    const dark: Record<string, string> = { "accent-soft": theme.soft[1], "accent-ink": theme.ink[1], "accent-line": theme.line[1] }
    if ("darkAccent" in theme) { dark.accent = theme.darkAccent; dark["accent-hover"] = theme.darkHover }
    // The default theme is also the fallback when no attribute is set.
    const selector = theme.id === DEFAULT_ACCENT ? `html,html[data-accent="${theme.id}"]` : `html[data-accent="${theme.id}"]`
    const darkSelector = theme.id === DEFAULT_ACCENT ? `html.dark,html.dark[data-accent="${theme.id}"]` : `html.dark[data-accent="${theme.id}"]`
    return block(selector, light) + block(darkSelector, dark)
  }).join("\n")
}

/** A row of colour dots in a small popover. Picking one applies it immediately. */
export function ThemePicker({ value, onChange }: { value: AccentId; onChange: (id: AccentId) => void }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Change accent colour"
          title="Accent colour"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors duration-500 hover:bg-black/10 data-[state=open]:bg-black/10 dark:text-zinc-100 dark:hover:bg-white/10 dark:data-[state=open]:bg-white/10"
        >
          <Palette className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[10000] rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.18)] outline-none dark:border-white/10 dark:bg-[#1b1b1d]"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={(next) => isAccentId(next) && onChange(next)} className="flex gap-1.5">
            {ACCENTS.map((theme) => (
              <DropdownMenu.RadioItem
                key={theme.id}
                value={theme.id}
                aria-label={theme.label}
                title={theme.label}
                // Keep the menu open so several colours can be tried in a row.
                onSelect={(event) => event.preventDefault()}
                className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full outline-none"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform group-data-[highlighted]:scale-110 group-data-[state=checked]:ring-2 group-data-[state=checked]:ring-offset-2 group-data-[state=checked]:ring-offset-[#fcfbfa] dark:group-data-[state=checked]:ring-offset-[#1b1b1d]"
                  )}
                  style={{ backgroundColor: theme.accent, ["--tw-ring-color" as string]: theme.line[0] }}
                >
                  <DropdownMenu.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </DropdownMenu.ItemIndicator>
                </span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
