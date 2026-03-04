'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mail,
  FileText,
  GitBranch,
  Kanban,
  Briefcase,
  TrendingUp,
  BarChart2,
  Map,
  BookOpen,
  Users2,
  ClipboardList,
  Target,
  Newspaper,
  ChevronRight,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Deal Map',
    href: '/deal-map',
    icon: Map,
    description: 'AI account intelligence',
    color: 'text-orange-500',
    activeBg: 'bg-orange-500/10',
  },
  {
    label: 'Contacts',
    href: '/contacts',
    icon: Users2,
    description: 'LinkedIn contact database',
    color: 'text-sky-500',
    activeBg: 'bg-sky-500/10',
  },
  {
    label: 'Meeting Prep',
    href: '/meeting-prep',
    icon: Briefcase,
    description: 'Account brief & agenda',
    color: 'text-rose-500',
    activeBg: 'bg-rose-500/10',
  },
  {
    label: 'Discovery Discipline',
    href: '/discovery-discipline',
    icon: Target,
    description: '7-phase discovery playbook',
    color: 'text-indigo-400',
    activeBg: 'bg-indigo-500/10',
  },
  {
    label: 'Meeting Debrief',
    href: '/meeting-debrief',
    icon: ClipboardList,
    description: 'Notes → CRM-ready debrief',
    color: 'text-violet-400',
    activeBg: 'bg-violet-500/10',
  },
  {
    label: 'Account Playbook',
    href: '/account-playbook',
    icon: BookOpen,
    description: 'Chessboard + SCORE + Outreach',
    color: 'text-cyan-500',
    activeBg: 'bg-cyan-500/10',
  },
  {
    label: 'Email Generator',
    href: '/email-generator',
    icon: Mail,
    description: '12 mid-funnel frameworks',
    color: 'text-violet-500',
    activeBg: 'bg-violet-500/10',
  },
  {
    label: 'Deal Stages',
    href: '/deal-stages',
    icon: Kanban,
    description: '7-stage buying behavior',
    color: 'text-amber-500',
    activeBg: 'bg-amber-500/10',
  },
  {
    label: 'Value Story',
    href: '/value-story',
    icon: TrendingUp,
    description: 'Build your narrative',
    color: 'text-teal-500',
    activeBg: 'bg-teal-500/10',
  },
  {
    label: 'Follow-Up Tree',
    href: '/follow-up-tree',
    icon: GitBranch,
    description: 'Should I send that?',
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-500/10',
  },
  {
    label: 'Pipeline Update',
    href: '/pipeline',
    icon: BarChart2,
    description: 'Weekly report generator',
    color: 'text-indigo-500',
    activeBg: 'bg-indigo-500/10',
  },
  {
    label: 'PR/FAQ Generator',
    href: '/prfaq',
    icon: Newspaper,
    description: 'Working Backwards press release',
    color: 'text-zinc-400',
    activeBg: 'bg-zinc-500/10',
  },
  {
    label: 'Decision Memo',
    href: '/decision-memo',
    icon: FileText,
    description: 'Build a business case',
    color: 'text-blue-500',
    activeBg: 'bg-blue-500/10',
  },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
      <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
        Modules
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-150',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150',
                isActive ? item.activeBg : 'bg-slate-700/50 group-hover:bg-slate-700',
              )}
            >
              <Icon
                size={15}
                className={cn(
                  'transition-colors duration-150',
                  isActive ? item.color : 'text-slate-400 group-hover:text-slate-300',
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'text-sm font-medium leading-tight truncate',
                  isActive ? 'text-white' : '',
                )}
              >
                {item.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {item.description}
              </div>
            </div>
            {isActive && (
              <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar (md+) ───────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-slate-900 flex-col z-40 border-r border-slate-700/50">
        <div className="px-5 py-5 border-b border-slate-700/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Galvin AI</div>
              <div className="text-slate-500 text-xs">Sales Hub</div>
            </div>
          </Link>
        </div>
        <NavLinks />
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="text-slate-600 text-[10px] text-center">
            Galvin AI Sales Hub v1.0
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar (< md) ───────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700/50 flex items-center px-4 z-40 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
            <Zap size={15} className="text-white" />
          </div>
          <div className="text-white font-bold text-sm leading-tight">
            Galvin AI <span className="text-slate-400 font-normal">Sales Hub</span>
          </div>
        </Link>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-50"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="md:hidden fixed left-0 top-0 h-screen w-72 bg-slate-900 flex flex-col z-50 border-r border-slate-700/50">
            <div className="px-5 py-5 border-b border-slate-700/50 flex items-center justify-between">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm leading-tight">Galvin AI</div>
                  <div className="text-slate-500 text-xs">Sales Hub</div>
                </div>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="px-4 py-4 border-t border-slate-700/50">
              <div className="text-slate-600 text-[10px] text-center">
                Galvin AI Sales Hub v1.0
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
