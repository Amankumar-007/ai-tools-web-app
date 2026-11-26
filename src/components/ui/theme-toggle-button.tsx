"use client"

import React from "react"
import { flushSync } from "react-dom"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "./theme-animations"

interface ThemeToggleAnimationProps {
  variant?: AnimationVariant
  start?: AnimationStart
  showLabel?: boolean
  url?: string
}

export default function ThemeToggleButton({
  variant = "circle-blur",
  start = "top-left",
  showLabel = false,
  url = "",
}: ThemeToggleAnimationProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const styleId = "theme-transition-styles"

  const updateStyles = React.useCallback((css: string, name: string) => {
    if (typeof window === "undefined") return

    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css
  }, [])

  const disableTransitionsTemporarily = React.useCallback(() => {
    if (typeof document === "undefined") return
    const css = document.createElement("style")
    css.appendChild(document.createTextNode("*{transition:none !important}"))
    document.head.appendChild(css)
    // Force style flush
    void document.body.offsetHeight
    window.setTimeout(() => {
      css.parentNode && css.parentNode.removeChild(css)
    }, 120)
  }, [])

  const isTogglingRef = React.useRef(false)

  const toggleTheme = React.useCallback(() => {
    if (isTogglingRef.current) return
    isTogglingRef.current = true

    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animation = createAnimation(variant, start, url)
    updateStyles(animation.css, animation.name)

    if (typeof window === "undefined") return

    const switchTheme = () => {
      setTheme(resolvedTheme === "light" ? "dark" : "light")
    }

    if (prefersReduced || !document.startViewTransition) {
      switchTheme()
      isTogglingRef.current = false
      return
    }

    requestAnimationFrame(() => {
      document.startViewTransition(() => {
        disableTransitionsTemporarily()
        flushSync(switchTheme)
      }).finished.then(() => {
        isTogglingRef.current = false
      }, () => {
        isTogglingRef.current = false
      })
    })
  }, [resolvedTheme, setTheme, variant, start, url, updateStyles, disableTransitionsTemporarily])

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="w-9 p-0 h-9 relative group"
      name="Theme Toggle Button"
    >
      <SunIcon className="size-[1.2rem] rotate-0 scale-100 transition-transform duration-[400ms] ease-[ease-in-out] dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-[1.2rem] rotate-90 scale-0 transition-transform duration-[400ms] ease-[ease-in-out] dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Theme Toggle </span>
      {showLabel && (
        <>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -top-10">
            {" "}
            variant = {variant}
          </span>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -bottom-10">
            {" "}
            start = {start}
          </span>
        </>
      )}
    </Button>
  )
}
