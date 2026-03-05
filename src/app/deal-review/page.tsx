'use client'

import { useState } from 'react'
import {
  Gauge,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  DollarSign,
  User,
  Building2,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealInfo {
  accountName: string
  closeDate: string
  contractValue: string
  accountOwner: string
}

interface HeadlineVars {
  situationCompany: string
  situationChange: string
  situationOutcome: string
  initiativeExec: string
  initiativeChampion: string
  initiativeProject: string
  initiativeCriticalEvent: string
  diffAlternatives: string
  diffExec: string
  diffDifferentiator: string
  diffOutcome: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  'Do we have a written problem statement built with the buying team\'s own data?',
  'Do we have direct comments or edits from them, either confirming or correcting our POV?',
  'Do we have no less than 3 buying roles confirming our impact to a specific, exec-level metric?',
  'Did the buying team exec fund a project or internal initiative? Do we know that internal project name and team?',
  'Did the project team set a specific go-live date that, if missed, means a worse outcome?',
  'Do we have written confirmation they\'ve stopped exploring other alternatives because of a specific differentiator we have?',
  'Has the buying team stuck to a "backdated" set of tasks/milestones? Are we ahead or behind of where we thought we\'d be?',
]

const DIAGNOSTIC_CLUES = [
  {
    num: '01',
    label: 'The Big Idea',
    question: 'First 20 seconds — does the headline grab attention?',
    desc: 'Can you explain why this matters in 3 sentences or less? If you can\'t, your champion definitely can\'t remember and explain it to their team.',
  },
  {
    num: '02',
    label: 'Champion Redlines',
    question: 'Next 20 — is it their language or yours?',
    desc: 'How many changes did they make to our messaging? Look for redlines, comments, or completely rewritten sections. No changes = no true partnership.',
  },
  {
    num: '03',
    label: 'Unique Language',
    question: 'Last 20 — are there real numbers and dates?',
    desc: 'Does this sound written for a persona, or for this specific person at this specific company? Look for their internal language, phrases, project names, and priorities.',
  },
  {
    num: '04',
    label: 'Numbers & Dates',
    question: null,
    desc: 'Are we using specific data from their environment or a generic ROI calculation? Deals with numbers in the problem statement close at 3× the rate of those without.',
  },
  {
    num: '05',
    label: 'Contrast',
    question: null,
    desc: 'What\'s the gap between current state and future state? Is it wide enough to get above director level — or are we stuck in a manager-level workflow conversation?',
  },
]

const SCORE_TIERS = [
  {
    label: 'Forecast-Ready',
    score: '7 / 7',
    icon: '✓',
    min: 7,
    max: 7,
    bg: 'bg-emerald-500',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    desc: 'All signals present. Forecast this deal with confidence.',
  },
  {
    label: 'Progressing',
    score: '5–6 / 7',
    icon: '→',
    min: 5,
    max: 6,
    bg: 'bg-blue-500',
    cardBg: 'bg-blue-50',
    cardBorder: 'border-blue-200',
    textColor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    desc: 'Strong signals, but gaps exist. Identify missing evidence before the next review.',
  },
  {
    label: 'Needs Work',
    score: '3–4 / 7',
    icon: '!',
    min: 3,
    max: 4,
    bg: 'bg-amber-500',
    cardBg: 'bg-amber-50',
    cardBorder: 'border-amber-200',
    textColor: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    desc: 'Meaningful discovery gaps. This deal should not be in your forecast yet.',
  },
  {
    label: 'Not Real Yet',
    score: '0–2 / 7',
    icon: '✗',
    min: 0,
    max: 2,
    bg: 'bg-rose-500',
    cardBg: 'bg-rose-50',
    cardBorder: 'border-rose-200',
    textColor: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    desc: 'No written narrative, no champion engagement, no evidence of urgency. Remove from forecast.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  placeholder,
  mono = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all',
          mono && 'font-mono',
        )}
      />
    </div>
  )
}

function Var({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim()) {
    return <span className="font-semibold text-slate-900">{value}</span>
  }
  return <span className="italic text-amber-500">[{placeholder}]</span>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTier(score: number) {
  return SCORE_TIERS.find(t => score >= t.min && score <= t.max) ?? SCORE_TIERS[3]
}

const EMPTY_DEAL: DealInfo = { accountName: '', closeDate: '', contractValue: '', accountOwner: '' }
const EMPTY_VARS: HeadlineVars = {
  situationCompany: '', situationChange: '', situationOutcome: '',
  initiativeExec: '', initiativeChampion: '', initiativeProject: '', initiativeCriticalEvent: '',
  diffAlternatives: '', diffExec: '', diffDifferentiator: '', diffOutcome: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealReviewPage() {
  const [deal, setDeal] = useState<DealInfo>(EMPTY_DEAL)
  const [vars, setVars] = useState<HeadlineVars>(EMPTY_VARS)
  const [checks, setChecks] = useState<boolean[]>(Array(7).fill(false))
  const [copied, setCopied] = useState(false)

  const score = checks.filter(Boolean).length
  const tier = getTier(score)

  function setVar(key: keyof HeadlineVars, value: string) {
    setVars(prev => ({ ...prev, [key]: value }))
  }

  function setDealField(key: keyof DealInfo, value: string) {
    setDeal(prev => ({ ...prev, [key]: value }))
  }

  function toggleCheck(i: number) {
    setChecks(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  function handleReset() {
    setDeal(EMPTY_DEAL)
    setVars(EMPTY_VARS)
    setChecks(Array(7).fill(false))
  }

  function buildReviewText(): string {
    const v = vars
    const lines: string[] = []

    lines.push(`60-SECOND DEAL REVIEW${deal.accountName ? ` — ${deal.accountName.toUpperCase()}` : ''}`)
    const meta = [
      deal.closeDate && `Close: ${deal.closeDate}`,
      deal.contractValue && `Value: ${deal.contractValue}`,
      deal.accountOwner && `Owner: ${deal.accountOwner}`,
    ].filter(Boolean).join('  |  ')
    if (meta) lines.push(meta)

    lines.push('', '── HEADLINES ──', '')

    lines.push('SITUATION → STAKES')
    lines.push(`${v.situationCompany || '[Company Name]'} is experiencing ${v.situationChange || '[significant change]'}, which means ${v.situationOutcome || '[negative outcomes]'}.`)
    lines.push('')

    lines.push('INITIATIVE → URGENCY')
    lines.push(`${v.initiativeExec || '[Executive]'} tasked ${v.initiativeChampion || '[Champion]'} with driving ${v.initiativeProject || '[named project]'} in response, with a target rollout date no later than ${v.initiativeCriticalEvent || '[critical event]'}.`)
    lines.push('')

    lines.push('DIFFERENTIATOR → OUTCOME')
    lines.push(`Compared to ${v.diffAlternatives || '[alternatives]'}, ${v.diffExec || '[Executive]'} confirmed "${v.diffDifferentiator || '[differentiator]'}" will enable "${v.diffOutcome || '[outcome]'}".`)
    lines.push('')

    lines.push('── DEAL EVIDENCE ──')
    lines.push(`Score: ${score}/7 — ${tier.label}`)
    CHECKLIST_ITEMS.forEach((item, i) => {
      lines.push(`${checks[i] ? '☑' : '☐'} ${item}`)
    })

    lines.push('', 'The deal is not real unless it\'s in writing.')
    return lines.join('\n')
  }

  async function handleCopy() {
    await copyToClipboard(buildReviewText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Gauge size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">60-Second Deal Review</h1>
            <p className="text-sm text-slate-500">Build your narrative, score deal evidence, and qualify forecast readiness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Review'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* ── Deal Info Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              { label: 'Account Name', key: 'accountName', placeholder: 'Acme Corp', Icon: Building2 },
              { label: 'Close Date', key: 'closeDate', placeholder: 'Q2 2026', Icon: Calendar },
              { label: 'Contract Value', key: 'contractValue', placeholder: '$250,000', Icon: DollarSign },
              { label: 'Account Owner', key: 'accountOwner', placeholder: 'Your name', Icon: User },
            ] as const
          ).map(({ label, key, placeholder, Icon }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                <Icon size={11} />
                {label}
              </label>
              <input
                value={deal[key]}
                onChange={e => setDealField(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* ── LEFT: Headlines + Diagnostics ── */}
        <div className="space-y-5">

          {/* Situation → Stakes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-orange-500 uppercase">Situation</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-[11px] font-bold tracking-widest text-rose-500 uppercase">Stakes</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <InputField
                  label="Company Name"
                  value={vars.situationCompany}
                  onChange={v => setVar('situationCompany', v)}
                  placeholder="e.g. Acme Corp"
                />
                <InputField
                  label="Significant Change in Business / Industry"
                  value={vars.situationChange}
                  onChange={v => setVar('situationChange', v)}
                  placeholder="e.g. a major shift to AI-driven operations"
                />
                <InputField
                  label="Negative Outcomes (if unaddressed)"
                  value={vars.situationOutcome}
                  onChange={v => setVar('situationOutcome', v)}
                  placeholder="e.g. slower deal cycles and lost revenue to competitors"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                <Var value={vars.situationCompany} placeholder="Company Name" />
                {' is experiencing '}
                <Var value={vars.situationChange} placeholder="significant change" />
                {', which means '}
                <Var value={vars.situationOutcome} placeholder="negative outcomes" />
                {'.'}
              </div>
            </div>
          </div>

          {/* Initiative → Urgency */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase">Initiative</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-[11px] font-bold tracking-widest text-indigo-500 uppercase">Urgency</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Executive"
                  value={vars.initiativeExec}
                  onChange={v => setVar('initiativeExec', v)}
                  placeholder="e.g. CFO Sarah Kim"
                />
                <InputField
                  label="High-Influence Champion"
                  value={vars.initiativeChampion}
                  onChange={v => setVar('initiativeChampion', v)}
                  placeholder="e.g. VP Ops Mike Chen"
                />
                <InputField
                  label="Named Project / Strategic Initiative"
                  value={vars.initiativeProject}
                  onChange={v => setVar('initiativeProject', v)}
                  placeholder="e.g. Project Accelerate"
                />
                <InputField
                  label="Critical Event / Hard Deadline"
                  value={vars.initiativeCriticalEvent}
                  onChange={v => setVar('initiativeCriticalEvent', v)}
                  placeholder="e.g. end of Q2 board review"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                <Var value={vars.initiativeExec} placeholder="Executive" />
                {' tasked '}
                <Var value={vars.initiativeChampion} placeholder="high-influence Champion" />
                {' with driving '}
                <Var value={vars.initiativeProject} placeholder="named project" />
                {' in response, with a target rollout date no later than '}
                <Var value={vars.initiativeCriticalEvent} placeholder="critical event" />
                {'.'}
              </div>
            </div>
          </div>

          {/* Differentiator → Outcome */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-emerald-500 uppercase">Differentiator</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-[11px] font-bold tracking-widest text-teal-500 uppercase">Outcome</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Alternatives / Deal Threats"
                  value={vars.diffAlternatives}
                  onChange={v => setVar('diffAlternatives', v)}
                  placeholder="e.g. Vendor X and status quo"
                />
                <InputField
                  label="Executive (who confirmed)"
                  value={vars.diffExec}
                  onChange={v => setVar('diffExec', v)}
                  placeholder="e.g. CFO Sarah Kim"
                />
                <InputField
                  label="Our Differentiator — direct quote"
                  value={vars.diffDifferentiator}
                  onChange={v => setVar('diffDifferentiator', v)}
                  placeholder="e.g. real-time pipeline analytics"
                />
                <InputField
                  label="Positive Outcomes — direct quote"
                  value={vars.diffOutcome}
                  onChange={v => setVar('diffOutcome', v)}
                  placeholder="e.g. 30% faster close cycles by Q3"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                {'Compared to '}
                <Var value={vars.diffAlternatives} placeholder="alternatives, deal threats" />
                {', '}
                <Var value={vars.diffExec} placeholder="Executive" />
                {' confirmed "'}
                <Var value={vars.diffDifferentiator} placeholder="our unique differentiator" />
                {'" will enable "'}
                <Var value={vars.diffOutcome} placeholder="positive outcomes" />
                {'".'}
              </div>
            </div>
          </div>

          {/* The 5 Diagnostic Clues */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">The 5 Diagnostic Clues</h3>
              <p className="text-xs text-slate-500 mt-0.5">Read your 60-second narrative aloud. Grade it against these lenses.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {DIAGNOSTIC_CLUES.map(clue => (
                <div key={clue.num} className="px-5 py-4 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-500">{clue.num}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{clue.label}</div>
                    {clue.question && (
                      <div className="text-[11px] font-medium text-orange-500 italic mt-0.5 mb-1">{clue.question}</div>
                    )}
                    <div className="text-xs text-slate-500 leading-relaxed">{clue.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400 italic">The deal is not real unless it&apos;s in writing.</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Score + Checklist ── */}
        <div className="space-y-5">

          {/* Live Score Card */}
          <div className={cn('rounded-xl border p-5 shadow-sm transition-colors duration-300', tier.cardBg, tier.cardBorder)}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Deal Score</span>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', tier.badge)}>
                {tier.label}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className={cn('text-6xl font-black leading-none', tier.textColor)}>{score}</span>
              <span className="text-xl font-medium text-slate-400 mb-1">/ 7</span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden mb-3">
              <div
                className={cn('h-full rounded-full transition-all duration-500', tier.bg)}
                style={{ width: `${(score / 7) * 100}%` }}
              />
            </div>
            <p className={cn('text-xs leading-relaxed', tier.textColor)}>{tier.desc}</p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Buying Behavior & Deal Evidence</h3>
              <p className="text-xs text-slate-500 mt-0.5">Check each item only if you have written proof</p>
            </div>
            <div className="divide-y divide-slate-100">
              {CHECKLIST_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={cn(
                    'w-full flex items-start gap-3 px-5 py-4 text-left transition-colors',
                    checks[i] ? 'bg-emerald-50 hover:bg-emerald-100/60' : 'hover:bg-slate-50',
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {checks[i]
                      ? <CheckSquare size={16} className="text-emerald-600" />
                      : <Square size={16} className="text-slate-300" />
                    }
                  </div>
                  <span className={cn(
                    'text-xs leading-relaxed',
                    checks[i] ? 'text-emerald-700' : 'text-slate-600',
                  )}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Score Guide */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Score Guide</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {SCORE_TIERS.map(t => {
                const isActive = score >= t.min && score <= t.max
                return (
                  <div
                    key={t.score}
                    className={cn(
                      'px-5 py-3.5 flex items-start gap-3 transition-colors',
                      isActive && t.cardBg,
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold', t.bg)}>
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('text-xs font-bold', isActive ? t.textColor : 'text-slate-700')}>
                          {t.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{t.score}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
