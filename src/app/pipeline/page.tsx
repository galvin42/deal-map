'use client'

import { useState } from 'react'
import {
  BarChart2,
  Copy,
  Check,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'
import type { PipelineData } from '@/lib/types'

// ─── Default state ─────────────────────────────────────────────────────────────

const defaultPipeline = (): PipelineData => ({
  ytdClosed: '',
  ytdGoal: '',
  eoyWorstCase: '',
  eoyBaseCase: '',
  eoyBestCase: '',
  currentQPipeline: '',
  currentQTarget: '',
  nextQCoverage: '',
  priority1: '',
  priority2: '',
  priority3: '',
  blocker1: '',
  blocker2: '',
  blocker3: '',
})

// ─── Currency parsing helpers ──────────────────────────────────────────────────

function parseNum(val: string): number {
  return parseFloat(val.replace(/[$,KkMm]/g, '')) * (val.toLowerCase().includes('m') ? 1_000_000 : val.toLowerCase().includes('k') ? 1_000 : 1) || 0
}

function pct(a: string, b: string): string {
  const av = parseNum(a), bv = parseNum(b)
  if (!bv) return '—'
  return `${Math.round((av / bv) * 100)}%`
}

// ─── Generate plain text ───────────────────────────────────────────────────────

function generatePipelineText(p: PipelineData): string {
  const now = new Date()
  const weekStr = `Week of ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  const line = '─'.repeat(60)

  let text = `WEEKLY PIPELINE UPDATE\n${weekStr}\n${line}\n\n`

  text += `SUMMARY\n${line}\n`
  text += `YTD Closed ARR:     ${p.ytdClosed || '[TBD]'}\n`
  text += `YTD Goal:           ${p.ytdGoal || '[TBD]'}\n`
  text += `YTD Attainment:     ${pct(p.ytdClosed, p.ytdGoal)}\n\n`
  text += `EOY Scenarios:\n`
  text += `  Worst Case:       ${p.eoyWorstCase || '[TBD]'}\n`
  text += `  Base Case:        ${p.eoyBaseCase || '[TBD]'}\n`
  text += `  Best Case:        ${p.eoyBestCase || '[TBD]'}\n\n`

  text += `PIPELINE DEVELOPMENT\n${line}\n`
  text += `Current Quarter:\n`
  text += `  Discounted Pipeline: ${p.currentQPipeline || '[TBD]'}\n`
  text += `  Target:              ${p.currentQTarget || '[TBD]'}\n`
  text += `  Coverage:            ${pct(p.currentQPipeline, p.currentQTarget)}\n\n`
  text += `Next Quarter Coverage Ratio: ${p.nextQCoverage || '[TBD]'}\n\n`

  text += `TOP PRIORITIES THIS WEEK\n${line}\n`
  if (p.priority1) text += `1. ${p.priority1}\n`
  if (p.priority2) text += `2. ${p.priority2}\n`
  if (p.priority3) text += `3. ${p.priority3}\n`

  text += `\nDEPENDENCIES & BLOCKERS\n${line}\n`
  if (p.blocker1) text += `1. ${p.blocker1}\n`
  if (p.blocker2) text += `2. ${p.blocker2}\n`
  if (p.blocker3) text += `3. ${p.blocker3}\n`

  return text
}

// ─── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  comparison,
  icon: Icon,
  trend,
  accent,
}: {
  label: string
  value: string
  comparison?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  accent: string
}) {
  const pctVal = comparison ? pct(value, comparison) : null
  const isGood = trend === 'up'

  return (
    <div className={cn('bg-white rounded-xl border-2 p-4 shadow-sm', accent)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <div className="text-2xl font-black text-slate-900 leading-none">
        {value || '—'}
      </div>
      {pctVal && pctVal !== '—' && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-xs font-semibold',
          isGood ? 'text-emerald-600' : 'text-rose-600',
        )}>
          {isGood ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {pctVal} of {comparison}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData>(defaultPipeline())
  const [copied, setCopied] = useState(false)

  const set = (field: keyof PipelineData) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }))
  )

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatePipelineText(data))
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const text = generatePipelineText(data)
    win.document.write(`<html><head><title>Pipeline Update</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.7;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${text}</pre></body></html>`)
    win.document.close(); win.print()
  }

  const ytdPct = data.ytdClosed && data.ytdGoal ? parseNum(data.ytdClosed) / parseNum(data.ytdGoal) : null
  const currentQPct = data.currentQPipeline && data.currentQTarget ? parseNum(data.currentQPipeline) / parseNum(data.currentQTarget) : null

  const now = new Date()
  const weekStr = `Week of ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
            <BarChart2 size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Weekly Pipeline Update</h1>
            <p className="text-slate-500 text-sm">{weekStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs"><Printer size={14} /> PDF</button>
          <button onClick={handleCopy} className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Report'}
          </button>
        </div>
      </div>

      {/* Live KPI summary */}
      {(data.ytdClosed || data.ytdGoal || data.currentQPipeline) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard
            label="YTD Closed ARR"
            value={data.ytdClosed}
            comparison={data.ytdGoal}
            icon={TrendingUp}
            trend="up"
            accent={ytdPct !== null && ytdPct >= 1 ? 'border-emerald-200' : ytdPct !== null && ytdPct >= 0.7 ? 'border-amber-200' : 'border-rose-200'}
          />
          <MetricCard
            label="YTD Goal"
            value={data.ytdGoal}
            icon={Target}
            trend="neutral"
            accent="border-slate-200"
          />
          <MetricCard
            label="Current Q Pipeline"
            value={data.currentQPipeline}
            comparison={data.currentQTarget}
            icon={BarChart2}
            trend={currentQPct !== null && currentQPct >= 3 ? 'up' : 'down'}
            accent={currentQPct !== null && currentQPct >= 3 ? 'border-emerald-200' : currentQPct !== null && currentQPct >= 2 ? 'border-amber-200' : 'border-rose-200'}
          />
          <MetricCard
            label="Next Q Coverage"
            value={data.nextQCoverage}
            icon={Target}
            trend="neutral"
            accent="border-slate-200"
          />
        </div>
      )}

      <div className="grid grid-cols-12 gap-5 max-w-6xl">
        {/* ─── Form ─────────────────────────────────────────── */}
        <div className="col-span-7 space-y-4">
          {/* Summary */}
          <div className="section-card">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-brand-100 flex items-center justify-center">
                  <TrendingUp size={15} className="text-brand-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="field-group">
                  <label className="field-label">YTD Closed ARR</label>
                  <input className="field-input" placeholder="e.g. $1.2M" value={data.ytdClosed} onChange={set('ytdClosed')} />
                </div>
                <div className="field-group">
                  <label className="field-label">YTD Goal</label>
                  <input className="field-input" placeholder="e.g. $2M" value={data.ytdGoal} onChange={set('ytdGoal')} />
                </div>
              </div>

              {/* EOQ scenarios */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">End of Quarter Forecast</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="field-group">
                    <label className="field-label flex items-center gap-1">
                      <TrendingDown size={12} className="text-rose-500" />
                      Worst Case
                    </label>
                    <input
                      className="field-input border-rose-200 focus:ring-rose-400"
                      placeholder="e.g. $800K"
                      value={data.eoyWorstCase}
                      onChange={set('eoyWorstCase')}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label flex items-center gap-1">
                      <Minus size={12} className="text-amber-500" />
                      Base Case
                    </label>
                    <input
                      className="field-input border-amber-200 focus:ring-amber-400"
                      placeholder="e.g. $1.1M"
                      value={data.eoyBaseCase}
                      onChange={set('eoyBaseCase')}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label flex items-center gap-1">
                      <TrendingUp size={12} className="text-emerald-500" />
                      Best Case
                    </label>
                    <input
                      className="field-input border-emerald-200 focus:ring-emerald-400"
                      placeholder="e.g. $1.4M"
                      value={data.eoyBestCase}
                      onChange={set('eoyBestCase')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Development */}
          <div className="section-card">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                  <BarChart2 size={15} className="text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Pipeline Development</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Current Quarter</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="field-group">
                    <label className="field-label">Discounted Pipeline (CQ)</label>
                    <input className="field-input" placeholder="e.g. $3.2M" value={data.currentQPipeline} onChange={set('currentQPipeline')} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Pipeline Target (CQ)</label>
                    <input className="field-input" placeholder="e.g. $4M" value={data.currentQTarget} onChange={set('currentQTarget')} />
                  </div>
                </div>
                {data.currentQPipeline && data.currentQTarget && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Coverage ratio</span>
                      <span className="font-semibold">{pct(data.currentQPipeline, data.currentQTarget)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          currentQPct !== null && currentQPct >= 3 ? 'bg-emerald-500' :
                          currentQPct !== null && currentQPct >= 2 ? 'bg-amber-500' : 'bg-rose-500',
                        )}
                        style={{ width: `${Math.min(100, (currentQPct || 0) * 100 / 3)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">3x coverage target for healthy pipeline</div>
                  </div>
                )}
              </div>
              <div className="field-group">
                <label className="field-label">Next Quarter Pipeline Coverage Ratio</label>
                <input className="field-input" placeholder="e.g. 2.1x or $2.8M / $3.2M target" value={data.nextQCoverage} onChange={set('nextQCoverage')} />
              </div>
            </div>
          </div>

          {/* Priorities */}
          <div className="section-card">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                  <Target size={15} className="text-emerald-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Top Priorities / Key Accounts</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {([
                { key: 'priority1', label: 'Priority #1', placeholder: 'e.g. Push Acme Corp to signed MSA — final legal review with their VP Legal on Thursday. Need exec alignment by EOD Wednesday.' },
                { key: 'priority2', label: 'Priority #2', placeholder: 'e.g. Re-engage Globex — deal went dark 3 weeks ago. Have a new insight on their Q3 initiative to lead with.' },
                { key: 'priority3', label: 'Priority #3', placeholder: 'e.g. Close out Initech POC evaluation — success metrics defined, need to deliver ROI summary doc by Friday.' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key} className="field-group">
                  <label className="field-label flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                      {key.slice(-1)}
                    </span>
                    {label}
                  </label>
                  <textarea className="field-textarea" rows={2} placeholder={placeholder} value={data[key]} onChange={set(key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Blockers */}
          <div className="section-card">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-rose-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Dependencies & Blockers</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {([
                { key: 'blocker1', label: 'Blocker #1', placeholder: 'e.g. Need legal to turn around redlined MSA for Acme by Wednesday or we miss Q close window.' },
                { key: 'blocker2', label: 'Blocker #2', placeholder: 'e.g. SE bandwidth — need 4 hours of demo support for 3 deals this week, only 2 hours available.' },
                { key: 'blocker3', label: 'Blocker #3', placeholder: 'e.g. No exec sponsor at Globex since their CRO left. Need BDR to help identify replacement contact.' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key} className="field-group">
                  <label className="field-label flex items-center gap-2">
                    <AlertTriangle size={12} className="text-rose-500" />
                    {label}
                  </label>
                  <textarea className="field-textarea border-rose-200 focus:ring-rose-400" rows={2} placeholder={placeholder} value={data[key]} onChange={set(key)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Live Preview ─────────────────────────────────── */}
        <div className="col-span-5">
          <div className="section-card sticky top-6">
            <div className="section-header">
              <h2 className="text-sm font-semibold text-slate-900">Live Preview</h2>
              <button
                onClick={handleCopy}
                className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(100vh-280px)]">
              <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                {generatePipelineText(data)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
