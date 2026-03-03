'use client'

import { useState, useEffect } from 'react'
import {
  Kanban,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  DollarSign,
  Building2,
  Clock,
  X,
} from 'lucide-react'
import { generateId, cn } from '@/lib/utils'
import type { Deal, DealStage } from '@/lib/types'

// ─── Stage definitions ─────────────────────────────────────────────────────────

const STAGES: DealStage[] = [
  {
    id: 1,
    name: 'Framing',
    description: 'Define a high-cost problem worth solving',
    exitCriteria: 'Buyer shares a written problem statement',
    color: 'border-t-slate-400',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
  },
  {
    id: 2,
    name: 'Validation',
    description: 'Multithreaded agreement on the problem',
    exitCriteria: 'At least 3 buyers agree on the problem statement and confirm it aligns with an exec metric',
    color: 'border-t-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    id: 3,
    name: 'Sponsorship',
    description: 'Executive takes ownership of the evaluation',
    exitCriteria: 'Exec tasks team with evaluating recommendations',
    color: 'border-t-violet-400',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
  },
  {
    id: 4,
    name: 'Committee',
    description: 'Buying committee alignment on a solution',
    exitCriteria: 'Committee decides on an external solution with requirements matching yours',
    color: 'border-t-amber-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    id: 5,
    name: 'Provider',
    description: 'You become the provider of choice',
    exitCriteria: 'Committee stops other discussions',
    color: 'border-t-orange-400',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    id: 6,
    name: 'Compelling Event',
    description: 'Timeline and kickoff committed',
    exitCriteria: 'Target kickoff date set with backdated tasks',
    color: 'border-t-rose-400',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
  {
    id: 7,
    name: 'Closed',
    description: 'Terms finalized',
    exitCriteria: 'Dried ink accepting all terms',
    color: 'border-t-emerald-400',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
]

// ─── Add Deal Modal ────────────────────────────────────────────────────────────

function AddDealModal({
  initialStage,
  onAdd,
  onClose,
}: {
  initialStage: number
  onAdd: (deal: Deal) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState(initialStage)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !company.trim()) return
    onAdd({
      id: generateId(),
      name: name.trim(),
      company: company.trim(),
      value: value.trim(),
      stage,
      exitCriteriaMet: false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Add Deal</h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="field-group">
            <label className="field-label">Deal / Opportunity Name *</label>
            <input className="field-input" placeholder="e.g. Acme Corp — Revenue Intelligence" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field-group">
              <label className="field-label">Company *</label>
              <input className="field-input" placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">Deal Value</label>
              <input className="field-input" placeholder="e.g. $125,000" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Initial Stage</label>
            <select
              className="field-input"
              value={stage}
              onChange={(e) => setStage(Number(e.target.value))}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>Stage {s.id}: {s.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Notes</label>
            <textarea className="field-textarea" rows={2} placeholder="Key context, next action, blockers..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Deal</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Deal card ─────────────────────────────────────────────────────────────────

function DealCard({
  deal,
  onToggleExit,
  onAdvance,
  onRetreat,
  onDelete,
}: {
  deal: Deal
  onToggleExit: () => void
  onAdvance: () => void
  onRetreat: () => void
  onDelete: () => void
}) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 shadow-sm p-3 group hover:shadow-md transition-all duration-200',
      deal.exitCriteriaMet && 'border-emerald-200 bg-emerald-50/30',
    )}>
      {/* Deal name + company */}
      <div className="flex items-start gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 leading-tight">{deal.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-500">{deal.company}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2.5">
        {deal.value && (
          <div className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold">
            <DollarSign size={10} className="text-slate-400" />
            {deal.value}
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock size={10} />
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
        </div>
      </div>

      {deal.notes && (
        <div className="text-[10px] text-slate-500 italic mb-2.5 line-clamp-2 leading-relaxed">
          {deal.notes}
        </div>
      )}

      {/* Exit criteria toggle */}
      <button
        onClick={onToggleExit}
        className={cn(
          'w-full flex items-center gap-2 text-[10px] font-medium py-1.5 px-2 rounded-lg transition-all',
          deal.exitCriteriaMet
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
        )}
      >
        {deal.exitCriteriaMet ? (
          <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
        ) : (
          <Circle size={12} className="text-slate-400 flex-shrink-0" />
        )}
        <span className="text-left leading-tight truncate">
          {deal.exitCriteriaMet ? 'Exit criteria met ✓' : 'Mark exit criteria met'}
        </span>
      </button>

      {/* Stage navigation */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={onRetreat}
          disabled={deal.stage <= 1}
          className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={12} /> Back
        </button>
        <span className="text-[10px] text-slate-400">Stage {deal.stage}</span>
        <button
          onClick={onAdvance}
          disabled={deal.stage >= 7}
          className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Advance <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'galvin-ai-hub-deals'

export default function DealStagesPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [addingToStage, setAddingToStage] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setDeals(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deals)) } catch {}
  }, [deals, hydrated])

  const addDeal = (deal: Deal) => {
    setDeals((prev) => [...prev, deal])
    setAddingToStage(null)
  }

  const removeDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }

  const updateDeal = (id: string, changes: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)))
  }

  const dealsInStage = (stageId: number) =>
    deals.filter((d) => d.stage === stageId)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
            <Kanban size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Deal Stage Manager</h1>
            <p className="text-slate-500 text-sm">7 buyer-behavior stages · Track exit criteria · {deals.length} deals total</p>
          </div>
        </div>
        <button onClick={() => setAddingToStage(1)} className="btn-primary text-sm">
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {STAGES.map((stage) => {
            const stageDeals = dealsInStage(stage.id)
            return (
              <div key={stage.id} className="flex-1 min-w-0 flex flex-col">
                {/* Stage header */}
                <div className={cn(
                  'rounded-t-xl border-t-4 px-3 py-3 border border-b-0 border-slate-200 bg-white',
                  stage.color,
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center', stage.bgColor, stage.textColor)}>
                        {stage.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{stage.name}</span>
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      stageDeals.length > 0 ? `${stage.bgColor} ${stage.textColor}` : 'bg-slate-100 text-slate-400',
                    )}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{stage.description}</p>
                </div>

                {/* Exit criteria banner */}
                <div className="bg-slate-50 border-x border-slate-200 px-3 py-2">
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Exit Criteria</div>
                  <p className="text-[10px] text-slate-600 leading-tight">{stage.exitCriteria}</p>
                </div>

                {/* Deals */}
                <div className="flex-1 border border-t-0 border-slate-200 rounded-b-xl bg-slate-50/50 p-2 space-y-2 min-h-[200px]">
                  {stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onToggleExit={() => updateDeal(deal.id, { exitCriteriaMet: !deal.exitCriteriaMet })}
                      onAdvance={() => updateDeal(deal.id, { stage: Math.min(7, deal.stage + 1), exitCriteriaMet: false })}
                      onRetreat={() => updateDeal(deal.id, { stage: Math.max(1, deal.stage - 1), exitCriteriaMet: false })}
                      onDelete={() => removeDeal(deal.id)}
                    />
                  ))}

                  <button
                    onClick={() => setAddingToStage(stage.id)}
                    className="w-full py-2 rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={12} /> Add deal
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary row */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Pipeline Summary</div>
        <div className="grid grid-cols-7 gap-3">
          {STAGES.map((stage) => {
            const count = dealsInStage(stage.id).length
            return (
              <div key={stage.id} className="text-center">
                <div className="text-lg font-bold text-slate-900">{count}</div>
                <div className="text-[10px] text-slate-500">{stage.name}</div>
                <div className={cn(
                  'h-1 rounded-full mt-1.5 mx-auto transition-all',
                  count > 0 ? stage.bgColor.replace('bg-', 'bg-') : 'bg-slate-100',
                )} style={{ width: count > 0 ? `${Math.min(100, count * 25)}%` : '20%' }} />
              </div>
            )
          })}
        </div>
      </div>

      {addingToStage !== null && (
        <AddDealModal
          initialStage={addingToStage}
          onAdd={addDeal}
          onClose={() => setAddingToStage(null)}
        />
      )}
    </div>
  )
}
