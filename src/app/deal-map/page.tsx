'use client'

import { useState } from 'react'
import {
  Map,
  Zap,
  RotateCcw,
  Printer,
  Copy,
  Check,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ListSection {
  items?: string[]
  risks?: string[]
  opportunities?: string[]
  connections?: string[]
  gaps?: string[]
  actions?: string[]
  note: string
}

interface DealMapData {
  companyName: string
  generatedAt: string
  executivePriorities: ListSection
  financialMetrics: ListSection
  challengesTrends: ListSection
  strategicInitiatives: ListSection
  desiredOutcomes: ListSection
  solutionFit: ListSection
  nextMoves: ListSection
}

// ─── Card component ────────────────────────────────────────────────────────────

const CARD_CONFIG = [
  {
    key: 'executivePriorities',
    title: 'Executive Priorities',
    subtitle: "What the C-suite is focused on this fiscal",
    icon: '🎯',
    accent: 'border-t-blue-400',
    listKey: 'items',
  },
  {
    key: 'financialMetrics',
    title: 'Financial Metrics',
    subtitle: "Revenue, margins, momentum & pain",
    icon: '📊',
    accent: 'border-t-amber-400',
    listKey: null, // dual list
  },
  {
    key: 'challengesTrends',
    title: 'Challenges & Trends',
    subtitle: "Tension layer — what's at stake",
    icon: '⚡',
    accent: 'border-t-rose-400',
    listKey: 'risks',
  },
  {
    key: 'strategicInitiatives',
    title: 'Strategic Initiatives',
    subtitle: "Big moves & board-mandated outcomes",
    icon: '🚀',
    accent: 'border-t-violet-400',
    listKey: 'items',
  },
  {
    key: 'desiredOutcomes',
    title: 'Desired Outcomes',
    subtitle: "The 'why' behind their decisions",
    icon: '✦',
    accent: 'border-t-emerald-400',
    listKey: 'items',
  },
  {
    key: 'solutionFit',
    title: 'Solution Fit',
    subtitle: "Where your offer intersects their world",
    icon: '🔗',
    accent: 'border-t-teal-400',
    listKey: 'connections',
  },
]

function DealCard({ config, data }: { config: typeof CARD_CONFIG[0]; data: ListSection }) {
  const renderList = (items: string[] | undefined, color: string = 'text-slate-700') => (
    <ul className="space-y-1.5">
      {(items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <span className={cn('text-xs leading-relaxed', color)}>{item}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className={cn('bg-white rounded-xl border-t-4 border border-slate-200 shadow-sm p-4 flex flex-col gap-3', config.accent)}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{config.icon}</span>
        <div>
          <div className="text-sm font-bold text-slate-900">{config.title}</div>
          <div className="text-[10px] text-slate-500">{config.subtitle}</div>
        </div>
      </div>

      {config.key === 'financialMetrics' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Opportunities</div>
            {renderList(data.opportunities, 'text-emerald-700')}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-1.5">Risks</div>
            {renderList(data.risks, 'text-rose-700')}
          </div>
        </div>
      ) : (
        renderList(data[config.listKey as keyof ListSection] as string[] | undefined)
      )}

      {data.note && (
        <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-2 mt-1">
          {data.note}
        </p>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DealMapPage() {
  const [companyName, setCompanyName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dealMap, setDealMap] = useState<DealMapData | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !productDesc.trim()) return
    setLoading(true)
    setError('')
    setDealMap(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim(), productDescription: productDesc.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setDealMap(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!dealMap) return
    const text = generatePlainText(dealMap)
    const ok = await copyToClipboard(text)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const handlePrint = () => {
    if (!dealMap) return
    const win = window.open('', '_blank')
    if (!win) return
    const text = generatePlainText(dealMap)
    win.document.write(`<html><head><title>Deal Map — ${dealMap.companyName}</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.7;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${text}</pre></body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
          <Map size={18} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Deal Map</h1>
          <p className="text-slate-500 text-sm">Powered by Claude — strategic account intelligence in seconds</p>
        </div>
      </div>

      {/* Input form */}
      {!dealMap ? (
        <div className="max-w-xl mx-auto mt-12">
          <div className="section-card">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap size={24} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Generate a Deal Map</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter a company and your solution — Claude will research and return executive priorities, challenges, solution fit, and next moves.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="field-group">
                  <label className="field-label">Target Company</label>
                  <input
                    className="field-input"
                    placeholder="e.g. Salesforce, Nike, JPMorgan Chase"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">What Do You Sell?</label>
                  <textarea
                    className="field-textarea"
                    rows={3}
                    placeholder="e.g. A sales coaching platform that uses AI to analyze rep calls and recommend next-best actions for enterprise revenue teams."
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !companyName.trim() || !productDesc.trim()}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Researching {companyName}...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Generate Deal Map
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Uses Claude Opus · Results based on publicly available information
          </p>
        </div>
      ) : (
        <div className="animate-slide-up">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{dealMap.companyName}</h2>
              <p className="text-xs text-slate-500">
                Generated {new Date(dealMap.generatedAt).toLocaleString()} · Click any cell to edit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDealMap(null)} className="btn-secondary text-xs">
                <RotateCcw size={14} /> New Map
              </button>
              <button onClick={handlePrint} className="btn-secondary text-xs">
                <Printer size={14} /> PDF
              </button>
              <button onClick={handleCopy} className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* 3x2 grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {CARD_CONFIG.map((config) => (
              <DealCard
                key={config.key}
                config={config}
                data={dealMap[config.key as keyof DealMapData] as ListSection}
              />
            ))}
          </div>

          {/* Next Moves — full width */}
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">→</span>
              <div>
                <div className="font-bold">Next Moves</div>
                <div className="text-slate-400 text-[10px]">Gaps to close & actions to take</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-2">Gaps</div>
                <ul className="space-y-1.5">
                  {(dealMap.nextMoves.gaps || []).map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Actions</div>
                <ul className="space-y-1.5">
                  {(dealMap.nextMoves.actions || []).map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {dealMap.nextMoves.note && (
              <p className="text-[10px] text-slate-500 italic mt-3 border-t border-slate-700 pt-3">
                {dealMap.nextMoves.note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Plain text generator ──────────────────────────────────────────────────────

function generatePlainText(d: DealMapData): string {
  const line = '─'.repeat(60)
  let text = `DEAL MAP: ${d.companyName.toUpperCase()}\n${line}\n`
  text += `Generated: ${new Date(d.generatedAt).toLocaleString()}\n\n`

  const section = (title: string, items: string[]) => {
    text += `${title}\n${line}\n`
    items.forEach((item) => { text += `  • ${item}\n` })
    text += '\n'
  }

  section('Executive Priorities', d.executivePriorities.items || [])
  text += `Financial Metrics\n${line}\n`
  text += `Opportunities:\n`
  ;(d.financialMetrics.opportunities || []).forEach((i) => { text += `  + ${i}\n` })
  text += `Risks:\n`
  ;(d.financialMetrics.risks || []).forEach((i) => { text += `  - ${i}\n` })
  text += '\n'
  section('Challenges & Trends', d.challengesTrends.risks || [])
  section('Strategic Initiatives', d.strategicInitiatives.items || [])
  section('Desired Outcomes', d.desiredOutcomes.items || [])
  section('Solution Fit', d.solutionFit.connections || [])
  text += `Next Moves\n${line}\n`
  text += `Gaps:\n`
  ;(d.nextMoves.gaps || []).forEach((i) => { text += `  • ${i}\n` })
  text += `Actions:\n`
  ;(d.nextMoves.actions || []).forEach((i) => { text += `  → ${i}\n` })

  return text
}
