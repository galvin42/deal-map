'use client'

import Link from 'next/link'
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
  ShieldCheck,
  ShieldAlert,
  Gauge,
  ArrowRight,
  Zap,
  Users,
} from 'lucide-react'

const modules = [
  {
    label: 'Email Generator',
    href: '/email-generator',
    icon: Mail,
    description: '12 mid-funnel email frameworks with Mad Libs–style variable inputs. Generate ready-to-send emails in seconds.',
    tags: ['Discovery', 'Follow-Up', 'Objections', 'Pricing'],
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
    border: 'border-violet-100',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Decision Memo Builder',
    href: '/decision-memo',
    icon: FileText,
    description: 'Structure a business case with stakeholders, context, options comparison, and a clear recommendation.',
    tags: ['Business Case', 'Options Analysis', 'Sign-off'],
    gradient: 'from-blue-500 to-cyan-600',
    light: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Follow-Up Decision Tree',
    href: '/follow-up-tree',
    icon: GitBranch,
    description: 'Interactive step-by-step guide: should you send that follow-up? Get a definitive "SEND IT" or "NEEDS WORK" verdict.',
    tags: ['Follow-Up', 'World-Class Framework', 'Decision'],
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Deal Stage Manager',
    href: '/deal-stages',
    icon: Kanban,
    description: 'Track deals across 7 buyer-behavior stages with clear exit criteria. Know exactly where each deal stands.',
    tags: ['Kanban', 'Exit Criteria', 'Buyer Behavior'],
    gradient: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Meeting Prep Brief',
    href: '/meeting-prep',
    icon: Briefcase,
    description: 'Generate a comprehensive meeting brief: objectives, problem statement, customer impact metrics, threats, and agenda.',
    tags: ['Account Brief', 'Agenda', 'Impact Metrics'],
    gradient: 'from-rose-500 to-pink-600',
    light: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    label: 'Value Story Builder',
    href: '/value-story',
    icon: TrendingUp,
    description: 'Craft a compelling narrative — where you are today, the path forward, and the timeline with outcomes unlocked.',
    tags: ['Narrative', 'Industry Shifts', 'ROI'],
    gradient: 'from-teal-500 to-emerald-600',
    light: 'bg-teal-50',
    border: 'border-teal-100',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    label: 'Pipeline Update',
    href: '/pipeline',
    icon: BarChart2,
    description: 'Generate a structured weekly pipeline report with ARR vs goal, scenario forecasts, priorities, and blockers.',
    tags: ['Forecasting', 'ARR', 'Coverage', 'Weekly Report'],
    gradient: 'from-indigo-500 to-brand-600',
    light: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'AI Deal Map',
    href: '/deal-map',
    icon: Map,
    description: 'AI-powered strategic account intelligence. Enter a company name and get executive priorities, challenges, and next moves.',
    tags: ['AI-Powered', 'Account Research', 'Claude'],
    gradient: 'from-orange-500 to-red-500',
    light: 'bg-orange-50',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Account Playbook',
    href: '/account-playbook',
    icon: BookOpen,
    description: 'AI-generated new account playbook: Chessboard Method, SCORE grading, Outreach Matrix, and AI Verification Protocol in one place.',
    tags: ['Chessboard', 'SCORE', 'Multi-thread', 'AI-Powered'],
    gradient: 'from-cyan-500 to-blue-500',
    light: 'bg-cyan-50',
    border: 'border-cyan-100',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    label: 'Contacts',
    href: '/contacts',
    icon: Users2,
    description: 'Paste a LinkedIn profile, let AI parse the contact details, and save to a searchable contacts database with Chessboard role tagging.',
    tags: ['LinkedIn', 'AI Parse', 'Contact DB', 'Chessboard'],
    gradient: 'from-sky-500 to-cyan-500',
    light: 'bg-sky-50',
    border: 'border-sky-100',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    label: 'Meeting Debrief',
    href: '/meeting-debrief',
    icon: ClipboardList,
    description: 'Paste raw, messy meeting notes — AI cleans the noise, infers deadlines, maps stakeholders, extracts risks, and writes your CRM entry.',
    tags: ['AI-Powered', 'Action Items', 'CRM Snippet', 'Health Score'],
    gradient: 'from-violet-500 to-indigo-600',
    light: 'bg-violet-50',
    border: 'border-violet-100',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Discovery Discipline',
    href: '/discovery-discipline',
    icon: Target,
    description: 'Phase-by-phase discovery call playbook — 7 phases covering Pre-Call, Opener, See-Saw, Impact Quantification, Solution Mapping, and Committee close.',
    tags: ['7 Phases', 'Click-to-Copy', 'Red Flag Checker', 'Committee Mapper'],
    gradient: 'from-indigo-600 to-blue-700',
    light: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'PR/FAQ Generator',
    href: '/prfaq',
    icon: Newspaper,
    description: "Amazon's Working Backwards framework — guided Mad Libs inputs + AI narrative engine produces a one-page press release and full FAQ in the Amazon style.",
    tags: ['Working Backwards', 'AI-Powered', 'Press Release', 'Silent Reading Timer'],
    gradient: 'from-zinc-600 to-slate-700',
    light: 'bg-zinc-50',
    border: 'border-zinc-200',
    iconBg: 'bg-zinc-100',
    iconColor: 'text-zinc-700',
  },
  {
    label: 'MEDDICC',
    href: '/meddicc',
    icon: ShieldCheck,
    description: 'AI-powered deal qualification. Rate all 7 MEDDICC elements, get an instant score and coaching plan, then feed intel from calls and emails to evolve the deal.',
    tags: ['AI-Powered', 'Qualification', 'Coaching', 'Feed Intel'],
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Deal Review',
    href: '/deal-review',
    icon: Gauge,
    description: '60-second forecast check. Build a deal narrative with three mad-lib headlines, score 7 buying behaviors, and get a clear Forecast-Ready / Progressing / At Risk verdict.',
    tags: ['Forecast', '60 Seconds', 'Buying Behavior', 'Score'],
    gradient: 'from-orange-500 to-amber-500',
    light: 'bg-orange-50',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Objection Handler',
    href: '/objection-handler',
    icon: ShieldAlert,
    description: 'Paste any objection, select deal stage and buyer persona — get 3 AI responses using empathetic, consultative, and challenger techniques with full scripts.',
    tags: ['AI-Powered', 'Empathetic', 'Challenger', 'Scripts'],
    gradient: 'from-red-500 to-rose-600',
    light: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
]

const stats = [
  { label: 'Email Frameworks', value: '12', icon: Mail },
  { label: 'Deal Stages', value: '7', icon: Target },
  { label: 'Decision Nodes', value: '6', icon: GitBranch },
  { label: 'Total Modules', value: '16', icon: Users },
]

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Galvin AI Sales Hub</h1>
            <p className="text-slate-500 text-sm">Your complete toolkit for world-class selling</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Icon size={16} className="text-brand-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 leading-none">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`group bg-white rounded-xl border ${mod.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}
            >
              {/* Card gradient top bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${mod.gradient}`} />

              <div className="p-5 flex-1 flex flex-col">
                {/* Icon + Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${mod.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={18} className={mod.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                      {mod.label}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
                  {mod.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                  Open module
                  <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="mt-10 text-center text-slate-400 text-xs">
        Built on proven sales frameworks · Export any document to clipboard or PDF
      </div>
    </div>
  )
}
