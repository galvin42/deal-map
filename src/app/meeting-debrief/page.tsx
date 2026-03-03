'use client'

import { useState } from 'react'
import {
  ClipboardList,
  Zap,
  RotateCcw,
  Printer,
  Copy,
  Check,
  Loader2,
  Users,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Database,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface HealthScore {
  score: number
  justification: string
}

interface Stakeholder {
  name: string
  role: string
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Unknown'
}

interface ActionItem {
  item: string
  owner: string
  deadline: string
}

interface DebriefData {
  repName: string
  accountName: string
  meetingDate: string
  generatedAt: string
  accountHealthScore: HealthScore
  executiveSummary: string
  keyDiscoveries: string[]
  strategicRisks: string[]
  stakeholderMap: Stakeholder[]
  actionItems: ActionItem[]
  crmSnippet: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Positive: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Neutral: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  Negative: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  Unknown: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
}

function getHealthConfig(score: number) {
  if (score >= 8)
    return {
      bg: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      cardBg: 'bg-emerald-50',
      cardBorder: 'border-emerald-200',
      label: 'Healthy',
      textColor: 'text-emerald-700',
    }
  if (score >= 5)
    return {
      bg: 'bg-amber-500',
      ring: 'ring-amber-200',
      cardBg: 'bg-amber-50',
      cardBorder: 'border-amber-200',
      label: 'At Risk',
      textColor: 'text-amber-700',
    }
  return {
    bg: 'bg-rose-500',
    ring: 'ring-rose-200',
    cardBg: 'bg-rose-50',
    cardBorder: 'border-rose-200',
    label: 'Critical',
    textColor: 'text-rose-700',
  }
}

const PLACEHOLDER_NOTES = `e.g.
met w Patricia @ redwood - she seemed stressed abt budget
boss wants decision by end of q - thats like march 31
they r using legacy system, super clunky
samantha (IT) was on the call too - kinda resistant, kept asking abt security
patricia said theyd lose 2M if they dont fix revenue cycle
need to send her the ROI doc by friday
john from procurement will need to sign off - havent met him yet`

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MeetingDebriefPage() {
  const [rawNotes, setRawNotes] = useState('')
  const [repName, setRepName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debrief, setDebrief] = useState<DebriefData | null>(null)
  const [copied, setCopied] = useState(false)
  const [crmCopied, setCrmCopied] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawNotes.trim()) return
    setLoading(true)
    setError('')
    setDebrief(null)

    try {
      const res = await fetch('/api/meeting-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes: rawNotes.trim(),
          repName: repName.trim(),
          accountName: accountName.trim(),
          meetingDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate debrief')
      setDebrief(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAll = async () => {
    if (!debrief) return
    const ok = await copyToClipboard(generatePlainText(debrief))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyCrm = async () => {
    if (!debrief) return
    const ok = await copyToClipboard(debrief.crmSnippet)
    if (ok) {
      setCrmCopied(true)
      setTimeout(() => setCrmCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    if (!debrief) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(
      `<html><head><title>Meeting Debrief${debrief.accountName ? ' — ' + debrief.accountName : ''}</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.7;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${generatePlainText(debrief)}</pre></body></html>`,
    )
    win.document.close()
    win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <ClipboardList size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meeting Debrief</h1>
          <p className="text-slate-500 text-sm">
            Paste raw notes — AI structures them into a CRM-ready debrief with action items
          </p>
        </div>
      </div>

      {/* ── Input Form ───────────────────────────────────────────────────────── */}
      {!debrief ? (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="section-card">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Transform Your Notes</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Dump messy, raw notes below — Claude cleans the noise, calculates deadlines, maps
                  stakeholders, and writes your CRM entry.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="field-group">
                    <label className="field-label">Your Name</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Alex Rivera"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Account / Company</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Redwood Healthcare"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Meeting Date</label>
                  <input
                    type="date"
                    className="field-input"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Raw Meeting Notes <span className="text-rose-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">
                      — messy is fine, dump everything
                    </span>
                  </label>
                  <textarea
                    className="field-textarea font-mono text-xs leading-relaxed"
                    rows={12}
                    placeholder={PLACEHOLDER_NOTES}
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
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
                  disabled={loading || !rawNotes.trim()}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Structuring your notes…
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Generate Debrief
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Uses Claude Opus · Cleans noise · Infers deadlines · Maps stakeholders · CRM-ready
            output
          </p>
        </div>
      ) : (
        /* ── Results ──────────────────────────────────────────────────────── */
        <div className="animate-slide-up space-y-5">
          {/* Results header bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {debrief.accountName ? `${debrief.accountName} — Meeting Debrief` : 'Meeting Debrief'}
                </h2>
                {(() => {
                  const hc = getHealthConfig(debrief.accountHealthScore.score)
                  return (
                    <span
                      className={cn(
                        'text-xs font-bold px-3 py-1 rounded-full text-white ring-2',
                        hc.bg,
                        hc.ring,
                      )}
                    >
                      Health {debrief.accountHealthScore.score}/10 — {hc.label}
                    </span>
                  )
                })()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {debrief.repName && `${debrief.repName} · `}
                {debrief.meetingDate &&
                  `Meeting: ${new Date(debrief.meetingDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · `}
                Generated {new Date(debrief.generatedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDebrief(null)} className="btn-secondary text-xs">
                <RotateCcw size={14} /> New Debrief
              </button>
              <button onClick={handlePrint} className="btn-secondary text-xs">
                <Printer size={14} /> PDF
              </button>
              <button
                onClick={handleCopyAll}
                className={cn(
                  'btn-primary text-xs',
                  copied && 'bg-emerald-600 hover:bg-emerald-700',
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          </div>

          {/* ── Account Health Score ── */}
          {(() => {
            const hc = getHealthConfig(debrief.accountHealthScore.score)
            return (
              <div
                className={cn(
                  'rounded-xl border p-5 flex items-center gap-5',
                  hc.cardBg,
                  hc.cardBorder,
                )}
              >
                <div
                  className={cn(
                    'w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-md ring-4 ring-white',
                    hc.bg,
                  )}
                >
                  <span className="text-3xl font-black leading-none">
                    {debrief.accountHealthScore.score}
                  </span>
                  <span className="text-[10px] font-semibold opacity-75 mt-0.5">/ 10</span>
                </div>
                <div>
                  <div className={cn('text-sm font-bold mb-1', hc.textColor)}>
                    Account Health — {hc.label}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {debrief.accountHealthScore.justification}
                  </p>
                </div>
              </div>
            )
          })()}

          {/* ── Executive Summary ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <ChevronRight size={15} className="text-violet-500" />
              <span className="font-semibold text-sm text-slate-900">Executive Summary</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{debrief.executiveSummary}</p>
            </div>
          </div>

          {/* ── Discoveries + Risks (2 col) ── */}
          <div className="grid grid-cols-2 gap-5">
            {/* Key Discoveries */}
            <div className="section-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <Lightbulb size={15} className="text-amber-500" />
                <span className="font-semibold text-sm text-slate-900">Key Discoveries</span>
                <span className="text-xs text-slate-400 ml-auto">
                  {debrief.keyDiscoveries.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {debrief.keyDiscoveries.length > 0 ? (
                  debrief.keyDiscoveries.map((d, i) => (
                    <div key={i} className="px-5 py-3 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{d}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-slate-400 italic">None identified</div>
                )}
              </div>
            </div>

            {/* Strategic Risks */}
            <div className="section-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-500" />
                <span className="font-semibold text-sm text-slate-900">Strategic Risks</span>
                <span className="text-xs text-slate-400 ml-auto">
                  {debrief.strategicRisks.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {debrief.strategicRisks.length > 0 ? (
                  debrief.strategicRisks.map((r, i) => (
                    <div key={i} className="px-5 py-3 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{r}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-slate-400 italic">None identified</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stakeholder Map ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Users size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">Stakeholder Map</span>
              <span className="text-xs text-slate-400 ml-1">
                {debrief.stakeholderMap.length} mentioned
              </span>
            </div>
            {debrief.stakeholderMap.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {debrief.stakeholderMap.map((s, i) => {
                  const sc = SENTIMENT_CONFIG[s.sentiment] ?? SENTIMENT_CONFIG.Unknown
                  return (
                    <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.role}</div>
                      </div>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full',
                          sc.bg,
                          sc.text,
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', sc.dot)} />
                        {s.sentiment}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-4 text-xs text-slate-400 italic">
                No stakeholders identified
              </div>
            )}
          </div>

          {/* ── Action Items ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <CheckSquare size={15} className="text-violet-500" />
              <span className="font-semibold text-sm text-slate-900">Action Items</span>
              <span className="text-xs text-slate-400 ml-1">
                {debrief.actionItems.length} tasks
              </span>
            </div>
            {debrief.actionItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {debrief.actionItems.map((a, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-start gap-4">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 leading-relaxed">{a.item}</p>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                          <User size={9} />
                          {a.owner || 'TBD'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                          <Calendar size={9} />
                          {a.deadline || 'No deadline set'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-4 text-xs text-slate-400 italic">
                No action items identified
              </div>
            )}
          </div>

          {/* ── CRM Snippet ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-slate-500" />
                <span className="font-semibold text-sm text-slate-900">CRM-Ready Snippet</span>
                <span className="text-xs text-slate-400">
                  — paste directly into Salesforce or HubSpot
                </span>
              </div>
              <button
                onClick={handleCopyCrm}
                className={cn(
                  'text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                  crmCopied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {crmCopied ? <Check size={12} /> : <Copy size={12} />}
                {crmCopied ? 'Copied!' : 'Copy Snippet'}
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed font-mono bg-slate-50 rounded-lg px-4 py-3.5 border border-slate-200">
                {debrief.crmSnippet}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Plain text generator ────────────────────────────────────────────────────

function generatePlainText(d: DebriefData): string {
  const line = '─'.repeat(60)
  const hc = d.accountHealthScore
  const healthLabel = hc.score >= 8 ? 'Healthy' : hc.score >= 5 ? 'At Risk' : 'Critical'

  let text = `MEETING DEBRIEF\n`
  if (d.accountName) text += `Account: ${d.accountName}\n`
  if (d.repName) text += `Rep: ${d.repName}\n`
  if (d.meetingDate) text += `Meeting Date: ${d.meetingDate}\n`
  text += `Generated: ${new Date(d.generatedAt).toLocaleString()}\n${line}\n\n`

  text += `ACCOUNT HEALTH SCORE: ${hc.score}/10 (${healthLabel})\n`
  text += `${hc.justification}\n\n`

  text += `EXECUTIVE SUMMARY\n${line}\n${d.executiveSummary}\n\n`

  text += `KEY DISCOVERIES\n${line}\n`
  d.keyDiscoveries.forEach((disc, i) => {
    text += `${i + 1}. ${disc}\n`
  })
  text += '\n'

  text += `STRATEGIC RISKS\n${line}\n`
  d.strategicRisks.forEach((r, i) => {
    text += `${i + 1}. ${r}\n`
  })
  text += '\n'

  text += `STAKEHOLDER MAP\n${line}\n`
  d.stakeholderMap.forEach((s) => {
    text += `• ${s.name} — ${s.role} [${s.sentiment}]\n`
  })
  text += '\n'

  text += `ACTION ITEMS\n${line}\n`
  d.actionItems.forEach((a, i) => {
    text += `${i + 1}. ${a.item}\n`
    text += `   Owner: ${a.owner || 'TBD'} | Deadline: ${a.deadline || 'None'}\n`
  })
  text += '\n'

  text += `CRM SNIPPET\n${line}\n${d.crmSnippet}\n`

  return text
}
