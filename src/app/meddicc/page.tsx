'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  Building2,
  DollarSign,
  Zap,
  BookOpen,
  HelpCircle,
  CheckSquare,
  Square,
} from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementKey =
  | 'metrics'
  | 'economicBuyer'
  | 'decisionCriteria'
  | 'decisionProcess'
  | 'identifyPain'
  | 'champion'
  | 'competition'

type ElementStatus = 0 | 1 | 2 | 3
type Stage = 'discovery' | 'demo' | 'proposal' | 'negotiation' | 'closing'
type FeedType = 'call_transcript' | 'email' | 'notes' | 'meeting_summary' | 'other'

interface ElementData {
  status: ElementStatus
  summary: string
  notes: string
  guidance: string
}

interface Extraction {
  element: ElementKey
  type: 'new' | 'update' | 'conflict'
  newStatus: ElementStatus
  extractedContent: string
  sourceQuote: string
  confidence: 'high' | 'medium' | 'low'
}

interface ExtractResult {
  extractions: Extraction[]
  coachingUpdates: Record<ElementKey, string>
  summary: string
}

interface FeedEntry {
  id: string
  type: FeedType
  timestamp: string
  preview: string
  updates: ElementKey[]
  scoreBefore: number
  scoreAfter: number
  summary: string
}

interface Deal {
  id: string
  company: string
  dealName: string
  dealValue: string
  stage: Stage
  productContext: string
  elements: Record<ElementKey, ElementData>
  feedHistory: FeedEntry[]
  createdAt: string
  updatedAt: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ELEMENT_KEYS: ElementKey[] = [
  'metrics',
  'economicBuyer',
  'decisionCriteria',
  'decisionProcess',
  'identifyPain',
  'champion',
  'competition',
]

interface ElementCfg {
  label: string
  letter: string
  weight: number
  accent: string
  accentBg: string
  accentBorder: string
  accentText: string
  tagline: string
  definition: string
  whyMatters: string
  discoveryQuestions: string[]
  validatedLooksLike: string
  commonMistake: string
}

const ELEMENTS: Record<ElementKey, ElementCfg> = {
  metrics: {
    label: 'Metrics',
    letter: 'M',
    weight: 20,
    accent: 'bg-blue-500',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentText: 'text-blue-600',
    tagline: 'Quantify success in their words',
    definition:
      'The measurable business outcome the customer needs to achieve — sourced from them, not your ROI calculator.',
    whyMatters:
      'Deals without metrics stall at procurement. When you know their number, everything else ties to it. Without it, you\'re guessing at value.',
    discoveryQuestions: [
      'How do you currently measure success for this initiative?',
      'What\'s the cost of this problem today — in revenue, time, or risk?',
      'If this goes perfectly, what does your business look like in 12 months?',
    ],
    validatedLooksLike:
      'A specific number in the exec\'s own words: "We lose $50K/month in delayed onboarding revenue."',
    commonMistake:
      'Using your ROI model instead of their stated metric. If they didn\'t say it, it doesn\'t count.',
  },
  economicBuyer: {
    label: 'Economic Buyer',
    letter: 'E',
    weight: 25,
    accent: 'bg-rose-500',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-200',
    accentText: 'text-rose-600',
    tagline: 'Find the check-signer',
    definition:
      'The single person with discretionary authority over this budget. Not IT, not procurement — the person who can say yes and make it stick.',
    whyMatters:
      'Champions can\'t close deals. Only the Economic Buyer can. Every deal that dies in committee was lost at this step.',
    discoveryQuestions: [
      'Who owns the budget for this kind of initiative?',
      'At what dollar threshold does this need executive sign-off?',
      'Have you briefed [exec name] on this project? What\'s their reaction?',
    ],
    validatedLooksLike:
      'You\'ve met them, they\'ve confirmed budget is available, and they\'ve stated a clear point of view on your solution.',
    commonMistake: 'Confusing a champion or sponsor for the EB. Champions advocate — EBs decide.',
  },
  decisionCriteria: {
    label: 'Decision Criteria',
    letter: 'D',
    weight: 12,
    accent: 'bg-purple-500',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    accentText: 'text-purple-600',
    tagline: 'Shape the scorecard before they write it',
    definition:
      'The specific requirements, capabilities, and conditions they will use to evaluate and select a vendor.',
    whyMatters:
      'Whoever writes the criteria wins the deal. If you\'re reacting to an RFP, you\'re probably too late.',
    discoveryQuestions: [
      'What are your must-haves vs. nice-to-haves for this decision?',
      'How are you evaluating vendors? Who\'s involved in that evaluation?',
      'What would disqualify a vendor immediately?',
    ],
    validatedLooksLike:
      'A written scoring matrix where your differentiators are reflected in the criteria — ideally because you helped write them.',
    commonMistake:
      'Letting procurement write criteria you haven\'t shaped. Late-stage surprises live here.',
  },
  decisionProcess: {
    label: 'Decision Process',
    letter: 'D',
    weight: 12,
    accent: 'bg-indigo-500',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    accentText: 'text-indigo-600',
    tagline: 'Map every step from here to signed',
    definition:
      'Every step from current state to signed contract — including legal, InfoSec, procurement, and board approvals.',
    whyMatters:
      'Most deals die in process, not in evaluation. Legal review alone can add 4–6 weeks nobody planned for.',
    discoveryQuestions: [
      'What are all the steps from "yes, we want this" to a signed contract?',
      'Who else needs to weigh in on the final decision?',
      'Have you purchased something similar before? What surprised you?',
    ],
    validatedLooksLike:
      'A mutual action plan — every step, owner, and date — co-created and signed off by your champion.',
    commonMistake:
      'Assuming the process ends when the champion says yes. Procurement, legal, and InfoSec are often invisible until it\'s too late.',
  },
  identifyPain: {
    label: 'Identify Pain',
    letter: 'I',
    weight: 12,
    accent: 'bg-amber-500',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-600',
    tagline: 'Find what\'s bleeding — in numbers',
    definition:
      'The specific, quantified business pain that creates urgency — ideally in the executive\'s own words.',
    whyMatters:
      'Generic pain doesn\'t move budgets. Quantified, exec-level pain tied to a strategic initiative creates urgency to act.',
    discoveryQuestions: [
      'What\'s the business impact of this problem today — in revenue, cost, or risk?',
      'Has this gotten worse over the past 12 months? Why?',
      'If you don\'t solve this in the next 6 months, what happens?',
    ],
    validatedLooksLike:
      'A specific number tied to a specific problem: "This is costing us $2M/yr and the board wants it fixed."',
    commonMistake:
      'Accepting "we need to be more efficient" as pain. Push for the dollar amount and consequences of inaction.',
  },
  champion: {
    label: 'Champion',
    letter: 'C',
    weight: 12,
    accent: 'bg-emerald-500',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-600',
    tagline: 'Find your internal seller',
    definition:
      'An internal advocate with power and influence who has personally invested in your success — not just a friendly contact.',
    whyMatters:
      'Without a champion, you\'re selling into a wall. They get you EB access, shape criteria, and fight budget battles when you\'re not in the room.',
    discoveryQuestions: [
      'Who inside would benefit most if this project succeeds?',
      'Who has tried to solve this before and has the credibility to drive change?',
      'Who can get me 30 minutes with [exec] if the message is right?',
    ],
    validatedLooksLike:
      'They\'ve edited your business case with their own data. They\'ve arranged an EB meeting. They have personal skin in the game.',
    commonMistake:
      'Confusing access with advocacy. A champion opens doors and takes personal risk. A contact just takes your calls.',
  },
  competition: {
    label: 'Competition',
    letter: 'C',
    weight: 7,
    accent: 'bg-slate-500',
    accentBg: 'bg-slate-50',
    accentBorder: 'border-slate-200',
    accentText: 'text-slate-600',
    tagline: 'Know every alternative — especially do-nothing',
    definition:
      'Every alternative being evaluated — other vendors, build vs. buy, and the status quo.',
    whyMatters:
      'You can\'t differentiate in a vacuum. Knowing the competition lets you shape criteria and sharpen your wedge.',
    discoveryQuestions: [
      'Are you evaluating other vendors? What\'s driving that process?',
      'Have you considered building this internally?',
      'What would happen if you just kept doing what you\'re doing today?',
    ],
    validatedLooksLike:
      'You know every option they\'re evaluating and have a confirmed differentiator against each — including status quo.',
    commonMistake:
      'Ignoring "do nothing" as the #1 competitor. Status quo wins more deals than any vendor.',
  },
}

const STATUS_CONFIG = [
  { value: 0 as ElementStatus, label: 'Unknown', shortLabel: 'Unknown', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
  { value: 1 as ElementStatus, label: 'Mentioned', shortLabel: 'Mentioned', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-400' },
  { value: 2 as ElementStatus, label: 'Evidenced', shortLabel: 'Evidenced', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  { value: 3 as ElementStatus, label: 'Validated', shortLabel: 'Validated', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
]

const SCORE_TIERS = [
  { min: 85, max: 100, label: 'Qualified', tag: 'Commit', bg: 'bg-emerald-500', cardBg: 'bg-emerald-50', cardBorder: 'border-emerald-200', textColor: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { min: 60, max: 84, label: 'Needs Work', tag: 'Best Case', bg: 'bg-blue-500', cardBg: 'bg-blue-50', cardBorder: 'border-blue-200', textColor: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { min: 30, max: 59, label: 'At Risk', tag: 'Pipeline', bg: 'bg-amber-500', cardBg: 'bg-amber-50', cardBorder: 'border-amber-200', textColor: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  { min: 0, max: 29, label: 'Unqualified', tag: 'Remove', bg: 'bg-rose-500', cardBg: 'bg-rose-50', cardBorder: 'border-rose-200', textColor: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
]

const STAGES: { value: Stage; label: string }[] = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closing', label: 'Closing' },
]

const FEED_TYPES: { value: FeedType; label: string }[] = [
  { value: 'call_transcript', label: 'Call Transcript' },
  { value: 'email', label: 'Email Thread' },
  { value: 'notes', label: 'Meeting Notes' },
  { value: 'meeting_summary', label: 'Meeting Summary' },
  { value: 'other', label: 'Other Intel' },
]

// Stage minimums: elements below this at a given stage show a ⚠ alert
const STAGE_MINIMUMS: Record<Stage, Partial<Record<ElementKey, ElementStatus>>> = {
  discovery: {},
  demo: { metrics: 1, identifyPain: 1 },
  proposal: { metrics: 2, economicBuyer: 1, identifyPain: 2, champion: 1 },
  negotiation: { metrics: 2, economicBuyer: 2, champion: 2, decisionProcess: 2 },
  closing: { metrics: 2, economicBuyer: 3, champion: 3, decisionProcess: 2 },
}

const LS_KEY = 'sales-hub-meddicc-deal'
const LS_PRODUCT_KEY = 'sales-hub-meddicc-product'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeScore(elements: Record<ElementKey, ElementData>): number {
  return Math.round(
    ELEMENT_KEYS.reduce((sum, key) => sum + (elements[key].status / 3) * ELEMENTS[key].weight, 0),
  )
}

function getTier(score: number) {
  return SCORE_TIERS.find(t => score >= t.min && score <= t.max) ?? SCORE_TIERS[3]
}

function getStageAlerts(elements: Record<ElementKey, ElementData>, stage: Stage): ElementKey[] {
  return (Object.entries(STAGE_MINIMUMS[stage]) as [ElementKey, ElementStatus][])
    .filter(([key, min]) => elements[key].status < min)
    .map(([key]) => key)
}

function emptyElement(): ElementData {
  return { status: 0, summary: '', notes: '', guidance: '' }
}

function newDeal(
  company: string, dealName: string, dealValue: string,
  stage: Stage, productContext: string,
): Deal {
  return {
    id: crypto.randomUUID(),
    company, dealName, dealValue, stage, productContext,
    elements: Object.fromEntries(ELEMENT_KEYS.map(k => [k, emptyElement()])) as Record<ElementKey, ElementData>,
    feedHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
      />
    </div>
  )
}

function StatusPicker({ value, onChange }: { value: ElementStatus; onChange: (s: ElementStatus) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_CONFIG.map(s => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            value === s.value
              ? cn(s.bg, s.text, s.border, 'ring-2 ring-offset-1', s.border.replace('border-', 'ring-'))
              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50',
          )}
        >
          <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', value === s.value ? s.dot : 'bg-slate-300')} />
          {s.label}
        </button>
      ))}
    </div>
  )
}

// MEDDICC Academy bar + expandable panel
function AcademyBar({
  elements,
  open,
  onToggle,
  focusKey,
  onFocus,
}: {
  elements: Record<ElementKey, ElementData>
  open: boolean
  onToggle: () => void
  focusKey: ElementKey | null
  onFocus: (k: ElementKey | null) => void
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/50 mb-6 overflow-hidden">
      {/* Bar header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/5 transition-colors"
      >
        <BookOpen size={15} className="text-slate-400 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">MEDDICC Framework</span>
        <div className="flex gap-1.5 ml-2 flex-1">
          {ELEMENT_KEYS.map(key => {
            const cfg = ELEMENTS[key]
            const s = STATUS_CONFIG[elements[key].status]
            return (
              <div key={key} className="flex flex-col items-center gap-0.5">
                <span className={cn('w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white', cfg.accent)}>
                  {cfg.letter}
                </span>
                <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
              </div>
            )
          })}
        </div>
        <ChevronDown size={14} className={cn('text-slate-400 transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>

      {/* Expanded education panel */}
      {open && (
        <div className="border-t border-slate-700/50">
          {/* Element selector tabs */}
          <div className="flex gap-1 px-5 py-3 border-b border-slate-700/30 flex-wrap">
            {ELEMENT_KEYS.map(key => {
              const cfg = ELEMENTS[key]
              const isActive = focusKey === key
              return (
                <button
                  key={key}
                  onClick={() => onFocus(isActive ? null : key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    isActive ? cn('text-white', cfg.accent) : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <span className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-black', isActive ? 'bg-white/20' : 'bg-slate-700')}>
                    {cfg.letter}
                  </span>
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          {focusKey ? (
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className={cn('text-xs font-bold uppercase tracking-widest mb-2', ELEMENTS[focusKey].accentText)}>
                  {ELEMENTS[focusKey].tagline}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{ELEMENTS[focusKey].definition}</p>
                <div className="mb-3">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Why it matters</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ELEMENTS[focusKey].whyMatters}</p>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Common mistake</div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">{ELEMENTS[focusKey].commonMistake}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Discovery questions</div>
                  <div className="space-y-2">
                    {ELEMENTS[focusKey].discoveryQuestions.map((q, i) => (
                      <div key={i} className="flex gap-2 text-xs text-slate-300">
                        <span className={cn('w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5', ELEMENTS[focusKey].accent)}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">&ldquo;{q}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    What &ldquo;Validated&rdquo; looks like
                  </div>
                  <p className="text-xs text-emerald-400 leading-relaxed italic">{ELEMENTS[focusKey].validatedLooksLike}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 grid grid-cols-7 gap-2">
              {ELEMENT_KEYS.map(key => {
                const cfg = ELEMENTS[key]
                return (
                  <button
                    key={key}
                    onClick={() => onFocus(key)}
                    className="text-center p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className={cn('w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-sm font-black text-white', cfg.accent)}>
                      {cfg.letter}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200 leading-tight">{cfg.label}</div>
                    <div className="text-[9px] text-slate-600 mt-0.5 leading-tight hidden md:block">{cfg.tagline}</div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual MEDDICC element card
function ElementCard({
  elementKey,
  data,
  stageAlert,
  onUpdate,
}: {
  elementKey: ElementKey
  data: ElementData
  stageAlert: boolean
  onUpdate: (updates: Partial<ElementData>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const [draftNotes, setDraftNotes] = useState(data.notes)

  const cfg = ELEMENTS[elementKey]
  const statusCfg = STATUS_CONFIG[data.status]
  const pts = Math.round((data.status / 3) * cfg.weight)

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm overflow-hidden transition-all', stageAlert ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200')}>
      {/* Card header */}
      <div className="px-5 py-4 flex items-start gap-3 border-b border-slate-100">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0', cfg.accent)}>
          {cfg.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{cfg.label}</span>
            {stageAlert && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                <AlertTriangle size={9} /> Needs attention at this stage
              </span>
            )}
          </div>
          <span className={cn('text-[10px] italic', cfg.accentText)}>{cfg.tagline}</span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-black text-slate-800">{pts}<span className="text-xs font-normal text-slate-400">/{cfg.weight}</span></div>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', statusCfg.bg, statusCfg.text)}>
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1', statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Summary or empty state */}
      <div className="px-5 py-4">
        {data.summary ? (
          <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
        ) : (
          <div className={cn('rounded-lg p-3 border', cfg.accentBg, cfg.accentBorder)}>
            <div className={cn('text-xs font-semibold mb-2', cfg.accentText)}>Discovery questions to get started:</div>
            <ul className="space-y-1">
              {cfg.discoveryQuestions.slice(0, 2).map((q, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className={cn('w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white mt-0.5', cfg.accent)}>
                    {i + 1}
                  </span>
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Guidance */}
        {data.guidance && (
          <div className="mt-3 flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Zap size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">{data.guidance}</p>
          </div>
        )}
      </div>

      {/* Editing panel */}
      {editing && (
        <div className="px-5 pb-4 space-y-3 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
            <StatusPicker value={data.status} onChange={s => onUpdate({ status: s })} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea
              value={draftNotes}
              onChange={e => setDraftNotes(e.target.value)}
              rows={3}
              placeholder="What do you know about this element? Names, quotes, specifics..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate({ notes: draftNotes }); setEditing(false) }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Learn More expansion */}
      {learnOpen && (
        <div className={cn('px-5 py-4 border-t space-y-3', cfg.accentBg, cfg.accentBorder)}>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.accentText)}>Definition</div>
            <p className="text-xs text-slate-700 leading-relaxed">{cfg.definition}</p>
          </div>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.accentText)}>Why it matters</div>
            <p className="text-xs text-slate-600 leading-relaxed">{cfg.whyMatters}</p>
          </div>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.accentText)}>All discovery questions</div>
            <ul className="space-y-1.5">
              {cfg.discoveryQuestions.map((q, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className={cn('w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white mt-0.5', cfg.accent)}>{i + 1}</span>
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.accentText)}>What &ldquo;Validated&rdquo; looks like</div>
            <p className="text-xs text-emerald-700 italic leading-relaxed">{cfg.validatedLooksLike}</p>
          </div>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.accentText)}>Common mistake</div>
            <p className="text-xs text-slate-500 italic leading-relaxed">{cfg.commonMistake}</p>
          </div>
        </div>
      )}

      {/* Card footer actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={() => { setEditing(v => !v); setDraftNotes(data.notes) }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          {editing ? 'Close editor' : 'Edit'}
        </button>
        <span className="text-slate-200">·</span>
        <button
          onClick={() => setLearnOpen(v => !v)}
          className={cn('flex items-center gap-1 text-xs font-semibold transition-colors', learnOpen ? cfg.accentText : 'text-slate-400 hover:text-slate-700')}
        >
          <HelpCircle size={12} />
          {learnOpen ? 'Hide' : 'Learn MEDDICC'}
        </button>
      </div>
    </div>
  )
}

// Feed Intel slide-over panel
function FeedPanel({
  deal,
  onClose,
  onApply,
}: {
  deal: Deal
  onClose: () => void
  onApply: (result: ExtractResult, type: FeedType, content: string) => void
}) {
  const [feedType, setFeedType] = useState<FeedType>('call_transcript')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExtractResult | null>(null)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [reviewMode, setReviewMode] = useState(false)

  async function handleAnalyze() {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/meddicc/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: feedType, content, deal }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
      // Pre-accept all non-conflict extractions
      const preAccepted = new Set(data.extractions.filter((e: Extraction) => e.type !== 'conflict').map((e: Extraction) => e.element))
      setAccepted(preAccepted)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAcceptAll() {
    if (!result) return
    const allNonConflict = new Set(result.extractions.filter(e => e.type !== 'conflict').map(e => e.element))
    onApply({ ...result, extractions: result.extractions.filter(e => allNonConflict.has(e.element)) }, feedType, content)
    onClose()
  }

  function handleAcceptSelected() {
    if (!result) return
    onApply({ ...result, extractions: result.extractions.filter(e => accepted.has(e.element)) }, feedType, content)
    onClose()
  }

  const conflictCount = result?.extractions.filter(e => e.type === 'conflict').length ?? 0
  const nonConflictCount = (result?.extractions.length ?? 0) - conflictCount

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Feed Intelligence</h2>
            <p className="text-xs text-slate-500">Paste calls, emails, or notes — AI extracts MEDDICC updates</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Content type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Content Type</label>
            <div className="flex flex-wrap gap-1.5">
              {FEED_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setFeedType(t.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    feedType === t.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="Paste your call transcript, email thread, meeting notes, or any other deal intelligence here..."
              className="w-full px-3 py-3 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">{error}</div>
          )}

          {/* Extraction results */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  AI Extraction Preview
                </div>
                <div className="text-xs text-slate-500">{result.summary}</div>
              </div>

              {/* Extractions list */}
              <div className="space-y-3">
                {result.extractions.map((ext, i) => {
                  const cfg = ELEMENTS[ext.element]
                  const isConflict = ext.type === 'conflict'
                  const isAccepted = accepted.has(ext.element)
                  return (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg border p-3 transition-all',
                        isConflict
                          ? 'bg-rose-50 border-rose-200'
                          : isAccepted
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-black text-white flex-shrink-0', cfg.accent)}>
                          {cfg.letter}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{cfg.label}</span>
                        <span className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto',
                          ext.type === 'new' && 'bg-emerald-100 text-emerald-700',
                          ext.type === 'update' && 'bg-blue-100 text-blue-700',
                          ext.type === 'conflict' && 'bg-rose-100 text-rose-700',
                        )}>
                          {ext.type === 'new' ? '✦ NEW' : ext.type === 'update' ? '↑ UPDATE' : '⚠ CONFLICT'}
                        </span>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border',
                          ext.confidence === 'high' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          ext.confidence === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        )}>
                          {ext.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mb-1.5 leading-relaxed">{ext.extractedContent}</p>
                      {ext.sourceQuote && (
                        <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-300 pl-2 leading-relaxed mb-2">&ldquo;{ext.sourceQuote}&rdquo;</p>
                      )}
                      {reviewMode && !isConflict && (
                        <button
                          onClick={() => setAccepted(prev => {
                            const next = new Set(prev)
                            isAccepted ? next.delete(ext.element) : next.add(ext.element)
                            return next
                          })}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          {isAccepted ? <CheckSquare size={13} className="text-emerald-600" /> : <Square size={13} />}
                          {isAccepted ? 'Accepted' : 'Accept this update'}
                        </button>
                      )}
                      {isConflict && (
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => setAccepted(prev => { const n = new Set(prev); n.add(ext.element); return n })}
                            className={cn('text-[11px] font-semibold px-2 py-1 rounded transition-colors', accepted.has(ext.element) ? 'bg-rose-200 text-rose-800' : 'bg-rose-100 text-rose-600 hover:bg-rose-200')}>
                            Override confirmed data
                          </button>
                          <button onClick={() => setAccepted(prev => { const n = new Set(prev); n.delete(ext.element); return n })}
                            className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {conflictCount > 0 && (
                <p className="text-xs text-rose-600 font-medium">
                  ⚠ {conflictCount} conflict{conflictCount > 1 ? 's' : ''} require{conflictCount === 1 ? 's' : ''} individual review
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 space-y-2">
          {!result ? (
            <button
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {loading ? 'Analyzing with AI...' : 'Analyze with AI'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleAcceptAll}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                <Check size={15} />
                Accept {nonConflictCount} update{nonConflictCount !== 1 ? 's' : ''}
                {conflictCount > 0 && ` · ${conflictCount} conflict${conflictCount > 1 ? 's' : ''} need review`}
              </button>
              <button
                onClick={() => reviewMode ? handleAcceptSelected() : setReviewMode(true)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                {reviewMode ? `Apply ${accepted.size} selected` : 'Review each individually'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewState = 'wizard' | 'loading' | 'dashboard'

interface WizardForm {
  company: string
  dealName: string
  dealValue: string
  stage: Stage
  productContext: string
  elements: Record<ElementKey, { status: ElementStatus; notes: string }>
}

function emptyWizard(): WizardForm {
  return {
    company: '',
    dealName: '',
    dealValue: '',
    stage: 'discovery',
    productContext: '',
    elements: Object.fromEntries(ELEMENT_KEYS.map(k => [k, { status: 0 as ElementStatus, notes: '' }])) as Record<ElementKey, { status: ElementStatus; notes: string }>,
  }
}

export default function MeddiccPage() {
  const [view, setView] = useState<ViewState>('wizard')
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [wizardForm, setWizardForm] = useState<WizardForm>(emptyWizard)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [assessError, setAssessError] = useState('')
  const [feedOpen, setFeedOpen] = useState(false)
  const [academyOpen, setAcademyOpen] = useState(false)
  const [academyFocus, setAcademyFocus] = useState<ElementKey | null>(null)
  const [expandedWizardKey, setExpandedWizardKey] = useState<ElementKey | null>(null)
  const [copied, setCopied] = useState(false)

  // Load persisted deal on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    const savedProduct = localStorage.getItem(LS_PRODUCT_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Deal
        setDeal(parsed)
        setView('dashboard')
      } catch { /* corrupt data, start fresh */ }
    }
    if (savedProduct) {
      setWizardForm(prev => ({ ...prev, productContext: savedProduct }))
    }
  }, [])

  // Persist deal to localStorage whenever it changes
  useEffect(() => {
    if (deal) localStorage.setItem(LS_KEY, JSON.stringify(deal))
  }, [deal])

  function updateWizardField<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setWizardForm(prev => ({ ...prev, [key]: value }))
  }

  function updateWizardElement(key: ElementKey, updates: Partial<{ status: ElementStatus; notes: string }>) {
    setWizardForm(prev => ({
      ...prev,
      elements: { ...prev.elements, [key]: { ...prev.elements[key], ...updates } },
    }))
  }

  async function handleAssess() {
    setView('loading')
    setAssessError('')
    try {
      const res = await fetch('/api/meddicc/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: wizardForm.company,
          dealName: wizardForm.dealName,
          stage: wizardForm.stage,
          productContext: wizardForm.productContext,
          elements: wizardForm.elements,
        }),
      })
      const data = await res.json()
      if (data.error) { setAssessError(data.error); setView('wizard'); setWizardStep(2); return }

      // Save product context for future visits
      localStorage.setItem(LS_PRODUCT_KEY, wizardForm.productContext)

      const initialDeal = newDeal(wizardForm.company, wizardForm.dealName, wizardForm.dealValue, wizardForm.stage, wizardForm.productContext)

      // Merge wizard statuses + notes + AI summaries/guidance
      ELEMENT_KEYS.forEach(key => {
        initialDeal.elements[key].status = wizardForm.elements[key].status
        initialDeal.elements[key].notes = wizardForm.elements[key].notes
        initialDeal.elements[key].summary = data.elements?.[key]?.summary ?? ''
        initialDeal.elements[key].guidance = data.elements?.[key]?.guidance ?? ''
      })

      setDeal(initialDeal)
      setView('dashboard')
    } catch {
      setAssessError('Network error. Please check your connection and try again.')
      setView('wizard')
      setWizardStep(2)
    }
  }

  function handleFeedApply(result: ExtractResult, type: FeedType, content: string) {
    if (!deal) return
    const scoreBefore = computeScore(deal.elements)
    const updatedElements = { ...deal.elements }

    result.extractions.forEach(ext => {
      const current = updatedElements[ext.element]
      updatedElements[ext.element] = {
        ...current,
        status: Math.max(current.status, ext.newStatus) as ElementStatus,
        summary: ext.extractedContent,
        guidance: result.coachingUpdates[ext.element] ?? current.guidance,
      }
    })

    // Apply coaching updates to all elements (auto-coaching)
    ELEMENT_KEYS.forEach(key => {
      if (result.coachingUpdates[key] && !result.extractions.find(e => e.element === key)) {
        updatedElements[key] = { ...updatedElements[key], guidance: result.coachingUpdates[key] }
      }
    })

    const updatedDeal: Deal = {
      ...deal,
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
      feedHistory: [
        {
          id: crypto.randomUUID(),
          type,
          timestamp: new Date().toISOString(),
          preview: content.slice(0, 200),
          updates: result.extractions.map(e => e.element),
          scoreBefore,
          scoreAfter: computeScore(updatedElements),
          summary: result.summary,
        },
        ...deal.feedHistory,
      ],
    }
    setDeal(updatedDeal)
  }

  function handleNewDeal() {
    const savedProduct = localStorage.getItem(LS_PRODUCT_KEY) ?? ''
    setWizardForm({ ...emptyWizard(), productContext: savedProduct })
    setWizardStep(1)
    setView('wizard')
    localStorage.removeItem(LS_KEY)
    setDeal(null)
  }

  async function handleCopyDeal() {
    if (!deal) return
    const score = computeScore(deal.elements)
    const tier = getTier(score)
    const lines = [
      `MEDDICC DEAL QUALIFIER — ${deal.company.toUpperCase()}`,
      `Deal: ${deal.dealName}  |  Value: ${deal.dealValue}  |  Stage: ${deal.stage}`,
      `Score: ${score}/100 — ${tier.label} (${tier.tag})`,
      '',
      '── MEDDICC ELEMENTS ──',
      ...ELEMENT_KEYS.map(key => {
        const el = deal.elements[key]
        const s = STATUS_CONFIG[el.status]
        return `${ELEMENTS[key].label}: ${s.label}\n${el.summary || '(not assessed)'}`
      }),
    ]
    await copyToClipboard(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Wizard Step 1 ───────────────────────────────────────────────────────────

  if (view === 'wizard' && wizardStep === 1) {
    const canProceed = wizardForm.company.trim() && wizardForm.productContext.trim()
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MEDDICC</h1>
            <p className="text-sm text-slate-500">AI-powered deal qualification in under 60 seconds</p>
          </div>
        </div>

        {/* MEDDICC intro strip */}
        <div className="bg-slate-900 rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">The MEDDICC Framework</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {ELEMENT_KEYS.map(key => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={cn('w-6 h-6 rounded flex items-center justify-center text-[11px] font-black text-white', ELEMENTS[key].accent)}>
                  {ELEMENTS[key].letter}
                </span>
                <span className="text-xs text-slate-400">{ELEMENTS[key].label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            MEDDICC is the qualification framework used by the world&apos;s top enterprise sales teams.
            Each element represents a critical piece of buying evidence. The stronger your MEDDICC, the more
            predictable your close — and the more confidently you can forecast.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-sm font-bold text-slate-700">Deal Basics</span>
          </div>

          <InputField label="Company Name" value={wizardForm.company} onChange={v => updateWizardField('company', v)} placeholder="Acme Corp" />
          <InputField label="Deal Name (optional)" value={wizardForm.dealName} onChange={v => updateWizardField('dealName', v)} placeholder="Enterprise Platform Deal" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Deal Value" value={wizardForm.dealValue} onChange={v => updateWizardField('dealValue', v)} placeholder="$250,000" />
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Stage</label>
              <select
                value={wizardForm.stage}
                onChange={e => updateWizardField('stage', e.target.value as Stage)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
              >
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              What do you sell?
              <span className="ml-1.5 text-slate-400 font-normal normal-case">(remembered for future deals)</span>
            </label>
            <textarea
              value={wizardForm.productContext}
              onChange={e => updateWizardField('productContext', e.target.value)}
              rows={2}
              placeholder="e.g. AI-powered sales intelligence platform that helps enterprise reps identify buying signals, build business cases, and forecast accurately"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => setWizardStep(2)}
          disabled={!canProceed}
          className="mt-4 w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          Rate MEDDICC Elements
          <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  // ── Wizard Step 2 ───────────────────────────────────────────────────────────

  if (view === 'wizard' && wizardStep === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setWizardStep(1)} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">← Back</button>
          <div className="flex-1" />
          <span className="text-xs text-slate-400">Step 2 of 2 — {wizardForm.company}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Rate each MEDDICC element</h2>
        <p className="text-sm text-slate-500 mb-6">Be honest — this is your qualification baseline. AI will generate coaching based on your inputs.</p>

        <div className="space-y-4">
          {ELEMENT_KEYS.map(key => {
            const cfg = ELEMENTS[key]
            const el = wizardForm.elements[key]
            const isExpanded = expandedWizardKey === key
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0 mt-0.5', cfg.accent)}>
                      {cfg.letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-800">{cfg.label}</span>
                        <span className={cn('text-[10px] italic', cfg.accentText)}>{cfg.tagline}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{cfg.definition}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">How well do you know this?</label>
                    <StatusPicker value={el.status} onChange={s => updateWizardElement(key, { status: s })} />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quick note (optional)</label>
                    <input
                      value={el.notes}
                      onChange={e => updateWizardElement(key, { notes: e.target.value })}
                      placeholder="Any names, quotes, or specifics you already know..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Discovery questions toggle */}
                <button
                  onClick={() => setExpandedWizardKey(isExpanded ? null : key)}
                  className={cn('w-full flex items-center gap-2 px-5 py-3 border-t text-xs font-semibold transition-colors text-left', cfg.accentBg, cfg.accentBorder, cfg.accentText, 'hover:opacity-80')}
                >
                  <HelpCircle size={12} />
                  {isExpanded ? 'Hide' : 'Show'} discovery questions
                  <ChevronDown size={12} className={cn('ml-auto transition-transform', isExpanded && 'rotate-180')} />
                </button>

                {isExpanded && (
                  <div className={cn('px-5 pb-4 pt-3', cfg.accentBg)}>
                    <ul className="space-y-2">
                      {cfg.discoveryQuestions.map((q, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-600">
                          <span className={cn('w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5', cfg.accent)}>
                            {i + 1}
                          </span>
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {assessError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">{assessError}</div>
        )}

        <button
          onClick={handleAssess}
          className="mt-6 w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          Generate MEDDICC Assessment
        </button>
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Analyzing your MEDDICC...</p>
          <p className="text-xs text-slate-400 mt-1">Generating summaries, gap analysis, and coaching</p>
        </div>
        <div className="flex gap-2 mt-2">
          {ELEMENT_KEYS.map(key => (
            <div key={key} className={cn('w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white animate-pulse', ELEMENTS[key].accent)}>
              {ELEMENTS[key].letter}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────

  if (!deal) return null

  const score = computeScore(deal.elements)
  const tier = getTier(score)
  const stageAlerts = getStageAlerts(deal.elements, deal.stage)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{deal.company}</h1>
              {deal.dealName && <span className="text-slate-400 text-sm">— {deal.dealName}</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              {deal.dealValue && <span className="font-semibold text-slate-700">{deal.dealValue}</span>}
              {deal.dealValue && <span>·</span>}
              <span className="capitalize">{deal.stage}</span>
              <span>·</span>
              <span>Updated {new Date(deal.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFeedOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Feed Intel
          </button>
          <button
            onClick={handleCopyDeal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleNewDeal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={14} />
            New Deal
          </button>
        </div>
      </div>

      {/* MEDDICC Academy Bar */}
      <AcademyBar
        elements={deal.elements}
        open={academyOpen}
        onToggle={() => { setAcademyOpen(v => !v); setAcademyFocus(null) }}
        focusKey={academyFocus}
        onFocus={setAcademyFocus}
      />

      {/* Stage alert banner */}
      {stageAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-700 mb-1">Stage gap detected — {deal.stage}</div>
            <p className="text-xs text-amber-600">
              At the <span className="font-semibold capitalize">{deal.stage}</span> stage, these elements need attention:{' '}
              {stageAlerts.map(k => ELEMENTS[k].label).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Score + Elements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
        {/* LEFT: 7 element cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ELEMENT_KEYS.map(key => (
            <ElementCard
              key={key}
              elementKey={key}
              data={deal.elements[key]}
              stageAlert={stageAlerts.includes(key)}
              onUpdate={updates => {
                setDeal(prev => prev ? {
                  ...prev,
                  elements: { ...prev.elements, [key]: { ...prev.elements[key], ...updates } },
                  updatedAt: new Date().toISOString(),
                } : prev)
              }}
            />
          ))}
        </div>

        {/* RIGHT: Score card + history */}
        <div className="space-y-5">
          {/* Score card */}
          <div className={cn('rounded-xl border p-5 shadow-sm transition-colors duration-300', tier.cardBg, tier.cardBorder)}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">MEDDICC Score</span>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', tier.badge)}>{tier.label}</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className={cn('text-6xl font-black leading-none', tier.textColor)}>{score}</span>
              <span className="text-xl font-medium text-slate-400 mb-1">/ 100</span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden mb-3">
              <div className={cn('h-full rounded-full transition-all duration-500', tier.bg)} style={{ width: `${score}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-bold', tier.textColor)}>Forecast: {tier.tag}</span>
            </div>

            {/* Per-element score breakdown */}
            <div className="mt-4 pt-4 border-t border-white/40 space-y-2">
              {ELEMENT_KEYS.map(key => {
                const el = deal.elements[key]
                const cfg = ELEMENTS[key]
                const pts = Math.round((el.status / 3) * cfg.weight)
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className={cn('w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white flex-shrink-0', cfg.accent)}>
                      {cfg.letter}
                    </span>
                    <span className="text-[11px] text-slate-600 flex-1 truncate">{cfg.label}</span>
                    <div className="w-16 h-1 bg-white/50 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', cfg.accent)} style={{ width: `${(pts / cfg.weight) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{pts}/{cfg.weight}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feed History */}
          {deal.feedHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Activity</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {deal.feedHistory.map(entry => (
                  <div key={entry.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 capitalize">{entry.type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5 leading-relaxed">{entry.summary}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{entry.scoreBefore} → {entry.scoreAfter}</span>
                      {entry.scoreAfter > entry.scoreBefore && (
                        <span className="text-[10px] font-bold text-emerald-600">+{entry.scoreAfter - entry.scoreBefore}</span>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{entry.updates.map(k => ELEMENTS[k].letter).join(' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feed Panel */}
      {feedOpen && (
        <FeedPanel
          deal={deal}
          onClose={() => setFeedOpen(false)}
          onApply={(result, type, content) => handleFeedApply(result, type, content)}
        />
      )}
    </div>
  )
}
