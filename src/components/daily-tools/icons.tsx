import { ArrowLeftRight, CalendarClock, CalendarDays, CalendarRange, Dumbbell, FileText, FileUser, Files, ListChecks, MailCheck, ScanSearch, GraduationCap, Hash, HeartPulse, ImageDown, KeyRound, Landmark, Languages, Mail, MessageCircle, Percent, PenLine, Plane, QrCode, Receipt, ReceiptIndianRupee, Sparkles, TrendingUp, Type, UserRoundCheck, UtensilsCrossed, Users, Wrench, type LucideIcon } from 'lucide-react'
import { FaFilePdf } from 'react-icons/fa6'
import { SiLinkedin, SiX, SiYoutube } from 'react-icons/si'
import type { IconType } from 'react-icons'

const ICONS: Record<string, LucideIcon> = { FileUser, ListChecks, MailCheck, ScanSearch, ArrowLeftRight, CalendarClock, CalendarDays, CalendarRange, Dumbbell, FileText, Files, GraduationCap, Hash, HeartPulse, ImageDown, KeyRound, Landmark, Languages, Mail, MessageCircle, Percent, PenLine, Plane, QrCode, Receipt, ReceiptIndianRupee, Sparkles, TrendingUp, Type, UserRoundCheck, UtensilsCrossed, Users }

/** Brand marks are used only to say which service a tool works with (LinkedIn, YouTube, PDF), not to imply any partnership. */
const BRANDS: Record<string, IconType> = { 'brand:linkedin': SiLinkedin, 'brand:x': SiX, 'brand:youtube': SiYoutube, 'brand:pdf': FaFilePdf }

export function ToolIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const Brand = BRANDS[name]
  if (Brand) return <Brand className={className} aria-hidden />
  const Icon = ICONS[name] ?? Wrench
  return <Icon className={className} aria-hidden />
}

/** Darken a #rrggbb colour (amount 0..1) for the second stop of the tile gradient. */
export function shade(hex: string, amount: number): string {
  const n = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#f97316'
  const to = (i: number) => Math.round(parseInt(n.slice(i, i + 2), 16) * (1 - amount)).toString(16).padStart(2, '0')
  return `#${to(1)}${to(3)}${to(5)}`
}

/** The coloured square that carries each tool's icon: every tool has its own colour, brand tools use the brand's colour. */
export function ToolTile({ icon, color, size = 'md' }: { icon: string; color: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-11 w-11 rounded-2xl'
  const glyph = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'
  return (
    <span className={`flex shrink-0 items-center justify-center text-white shadow-sm ${box}`} style={{ background: `linear-gradient(135deg, ${color}, ${shade(color, 0.28)})`, boxShadow: `0 6px 16px -6px ${color}99` }}>
      <ToolIcon name={icon} className={glyph} />
    </span>
  )
}
