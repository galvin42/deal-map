'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Zap,
  RotateCcw,
  Printer,
  Copy,
  Check,
  Loader2,
  Users,
  BarChart2,
  Send,
  Shield,
  Brain,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChessboardRole {
  name: string
  title: string
  notes: string
}

interface ScoreCriterion {
  answer: 'YES' | 'NO'
  evidence: string
}

interface OutreachEntry {
  stakeholder: string
  role: string
  primaryChannel: string
  messageAngle: string
  why: string
}

interface VerificationClaim {
  claim: string
  verdict: 'VERIFIED' | 'UNVERIFIED'
  note: string
}

interface PlaybookData {
  repName: string
  accountName: string
  generatedAt: string
  chessboard: {
    economicBuyer: ChessboardRole
    influencer: ChessboardRole
    blocker: ChessboardRole
    champion: ChessboardRole
  }
  scoreCard: {
    signals: ScoreCriterion
    committee: ScoreCriterion
    opportunities: ScoreCriterion
    relationships: ScoreCriterion
    engagement: ScoreCriterion
    totalYes: number
    grade: 'A' | 'B' | 'C'
    rationale: string
  }
  outreachMatrix: OutreachEntry[]
  verificationProtocol: {
    companyPrompt: string
    contactPrompts: string[]
    claims: VerificationClaim[]
  }
  strategicReflection: {
    biggestRisk: string
    adjustment: string
  }
}

// ─── Config ─────────────────────────────────────────────────────────────────

const SCORE_LABELS: Record<string, { label: string; desc: string }> = {
  signals: { label: 'S — Signals', desc: 'Recent trigger event?' },
  committee: { label: 'C — Committee', desc: 'Can name 3+ of 4 roles?' },
  opportunities: { label: 'O — Opportunities', desc: 'Fits our ICP?' },
  relationships: { label: 'R — Relationships', desc: 'Know anyone there?' },
  engagement: { label: 'E — Engagement', desc: 'Prior interaction?' },
}

const CHESS_ROLES = [
  {
    key: 'champion',
    label: 'Champion',
    desc: 'Feels the pain · Advocates for you',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    key: 'economicBuyer',
    label: 'Economic Buyer',
    desc: 'Controls the budget',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    key: 'influencer',
    label: 'Influencer',
    desc: 'Advises the Economic Buyer',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
  },
  {
    key: 'blocker',
    label: 'Blocker',
    desc: 'Could slow things down',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
]

const CHANNEL_COLORS: Record<string, string> = {
  LinkedIn: 'bg-blue-100 text-blue-700',
  Email: 'bg-violet-100 text-violet-700',
  Phone: 'bg-amber-100 text-amber-700',
  'Warm Referral': 'bg-emerald-100 text-emerald-700',
  TBD: 'bg-slate-100 text-slate-600',
}

const GRADE_CONFIG = {
  A: { bg: 'bg-emerald-500', text: 'text-white', label: 'HOT', ring: 'ring-emerald-200' },
  B: { bg: 'bg-amber-500', text: 'text-white', label: 'QUALIFIED', ring: 'ring-amber-200' },
  C: { bg: 'bg-slate-400', text: 'text-white', label: 'COLD', ring: 'ring-slate-200' },
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AccountPlaybookPage() {
  const [repName, setRepName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyContext, setCompanyContext] = useState('')
  const [knownStakeholders, setKnownStakeholders] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [playbook, setPlaybook] = useState<PlaybookData | null>(null)
  const [copied, setCopied] = useState(false)
  const [detectingIndustry, setDetectingIndustry] = useState(false)
  const [industryAiDetected, setIndustryAiDetected] = useState(false)
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Debounced AI industry detection ──────────────────────────────────────
  useEffect(() => {
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current)

    const trimmed = accountName.trim()
    if (trimmed.length < 3) {
      setDetectingIndustry(false)
      return
    }

    setIndustryAiDetected(false)
    detectTimerRef.current = setTimeout(async () => {
      setDetectingIndustry(true)
      try {
        const res = await fetch('/api/detect-industry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: trimmed }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.industry) {
            setIndustry(data.industry)
            setIndustryAiDetected(true)
          }
        }
      } catch {
        // silently fail — industry field stays as-is
      } finally {
        setDetectingIndustry(false)
      }
    }, 800)

    return () => {
      if (detectTimerRef.current) clearTimeout(detectTimerRef.current)
    }
  }, [accountName])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName.trim() || !productDesc.trim()) return
    setLoading(true)
    setError('')
    setPlaybook(null)

    try {
      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repName: repName.trim(),
          accountName: accountName.trim(),
          industry: industry.trim(),
          companyContext: companyContext.trim(),
          knownStakeholders: knownStakeholders.trim(),
          productDescription: productDesc.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setPlaybook(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!playbook) return
    const text = generatePlainText(playbook)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    if (!playbook) return
    const win = window.open('', '_blank')
    if (!win) return
    const text = generatePlainText(playbook)
    win.document.write(
      `<html><head><title>Account Playbook — ${playbook.accountName}</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.7;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${text}</pre></body></html>`,
    )
    win.document.close()
    win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
          <BookOpen size={18} className="text-cyan-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Account Playbook</h1>
          <p className="text-slate-500 text-sm">
            AI-powered Chessboard + SCORE + Outreach Matrix for every new account
          </p>
        </div>
      </div>

      {/* ── Input form ─────────────────────────────────────────────────────── */}
      {!playbook ? (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="section-card">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap size={24} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Build Your Account Playbook</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter what you know — Claude maps the chessboard, scores the account, and builds your outreach strategy.
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
                    <label className="field-label">
                      Target Account <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. Redwood Healthcare Systems"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label flex items-center gap-2">
                    Industry / Sector
                    {detectingIndustry && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                        <Loader2 size={10} className="animate-spin" />
                        Detecting…
                      </span>
                    )}
                    {!detectingIndustry && industryAiDetected && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded-full border border-cyan-100">
                        <Sparkles size={9} />
                        AI detected
                      </span>
                    )}
                  </label>
                  <input
                    className="field-input"
                    placeholder="e.g. Healthcare, FinTech, Manufacturing, SaaS"
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value)
                      setIndustryAiDetected(false)
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    What Do You Sell? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    className="field-textarea"
                    rows={2}
                    placeholder="e.g. A revenue cycle automation platform for mid-market healthcare systems."
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Company Context{' '}
                    <span className="text-slate-400 font-normal">(optional but improves quality)</span>
                  </label>
                  <textarea
                    className="field-textarea"
                    rows={2}
                    placeholder="Signals you've spotted: recent news, job postings, trigger events, expansion plans, press releases..."
                    value={companyContext}
                    onChange={(e) => setCompanyContext(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Known Stakeholders{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="field-textarea"
                    rows={2}
                    placeholder="Any names or titles you already know: e.g. 'Patricia Gomez, CFO' or 'Samantha Lee, Dir. Patient Financial Services'"
                    value={knownStakeholders}
                    onChange={(e) => setKnownStakeholders(e.target.value)}
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
                  disabled={loading || !accountName.trim() || !productDesc.trim()}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Building playbook for {accountName}...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Generate Account Playbook
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Uses Claude Opus · Applies Chessboard Method + SCORE + Outreach Matrix
          </p>
        </div>
      ) : (
        /* ── Results ────────────────────────────────────────────────────── */
        <div className="animate-slide-up space-y-5">
          {/* Results header bar */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {playbook.repName}&apos;s Playbook: {playbook.accountName}
                </h2>
                <span
                  className={cn(
                    'text-xs font-bold px-3 py-1 rounded-full ring-2',
                    GRADE_CONFIG[playbook.scoreCard.grade].bg,
                    GRADE_CONFIG[playbook.scoreCard.grade].text,
                    GRADE_CONFIG[playbook.scoreCard.grade].ring,
                  )}
                >
                  Grade {playbook.scoreCard.grade} — {GRADE_CONFIG[playbook.scoreCard.grade].label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated {new Date(playbook.generatedAt).toLocaleString()} · SCORE:{' '}
                {playbook.scoreCard.totalYes}/5
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPlaybook(null)} className="btn-secondary text-xs">
                <RotateCcw size={14} /> New Playbook
              </button>
              <button onClick={handlePrint} className="btn-secondary text-xs">
                <Printer size={14} /> PDF
              </button>
              <button
                onClick={handleCopy}
                className={cn(
                  'btn-primary text-xs',
                  copied && 'bg-emerald-600 hover:bg-emerald-700',
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* ── Section 1: Chessboard ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Users size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">Section 1 — The Chessboard</span>
              <span className="text-xs text-slate-400 ml-1">4 key roles mapped</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {CHESS_ROLES.map((role) => {
                const person =
                  playbook.chessboard[role.key as keyof typeof playbook.chessboard]
                return (
                  <div
                    key={role.key}
                    className={cn('rounded-xl border p-4 flex flex-col gap-2', role.bg, role.border)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
                          role.badge,
                        )}
                      >
                        {role.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{role.desc}</span>
                    </div>
                    <div>
                      <div className={cn('font-semibold text-sm leading-tight', role.color)}>
                        {person.name}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">{person.title}</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-black/5 pt-2">
                      {person.notes}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Section 2: SCORE Card ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-slate-500" />
                <span className="font-semibold text-sm text-slate-900">Section 2 — SCORE Card</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{playbook.scoreCard.totalYes}/5 criteria met</span>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-0.5 rounded-full',
                    GRADE_CONFIG[playbook.scoreCard.grade].bg,
                    GRADE_CONFIG[playbook.scoreCard.grade].text,
                  )}
                >
                  Grade {playbook.scoreCard.grade}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {(Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map((key) => {
                const criterion =
                  playbook.scoreCard[key as keyof typeof playbook.scoreCard] as ScoreCriterion
                const isYes = criterion.answer === 'YES'
                return (
                  <div key={key} className="px-5 py-3.5 flex items-start gap-4">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5',
                        isYes
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-600',
                      )}
                    >
                      {criterion.answer}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">
                          {SCORE_LABELS[key].label}
                        </span>
                        <span className="text-[10px] text-slate-400">{SCORE_LABELS[key].desc}</span>
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">{criterion.evidence}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-start gap-2">
              <ChevronRight size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 italic">{playbook.scoreCard.rationale}</p>
            </div>
          </div>

          {/* ── Section 3: Outreach Matrix ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Send size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">Section 3 — Outreach Matrix</span>
              <span className="text-xs text-slate-400 ml-1">
                {playbook.outreachMatrix.length} stakeholders planned
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {playbook.outreachMatrix.map((entry, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{entry.stakeholder}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {entry.role}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2.5 py-0.5 rounded-full',
                          CHANNEL_COLORS[entry.primaryChannel] || CHANNEL_COLORS['TBD'],
                        )}
                      >
                        {entry.primaryChannel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mb-1.5 leading-relaxed">
                      <span className="font-semibold text-slate-900">Angle: </span>
                      {entry.messageAngle}
                    </div>
                    <div className="text-xs text-slate-500 italic leading-relaxed">{entry.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 4: AI Verification Protocol ── */}
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Shield size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">
                Section 4 — AI Verification Protocol
              </span>
              <span className="text-xs text-slate-400 ml-1">2 sources required per fact</span>
            </div>
            <div className="p-5 space-y-5">
              {/* Research prompts */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Research Prompts — copy these into your AI tool
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-50 rounded-lg px-4 py-3 font-mono text-xs text-slate-700 border border-slate-200 leading-relaxed">
                    {playbook.verificationProtocol.companyPrompt}
                  </div>
                  {playbook.verificationProtocol.contactPrompts.map((prompt, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-lg px-4 py-3 font-mono text-xs text-slate-700 border border-slate-200 leading-relaxed"
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Truth Check */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Truth Check — verify before you use it
                </div>
                <div className="space-y-2">
                  {playbook.verificationProtocol.claims.map((claim, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg border px-4 py-3 flex items-start gap-3',
                        claim.verdict === 'VERIFIED'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5',
                          claim.verdict === 'VERIFIED'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-rose-200 text-rose-800',
                        )}
                      >
                        {claim.verdict}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 mb-0.5">{claim.claim}</div>
                        <div className="text-xs text-slate-600 leading-relaxed">{claim.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 5: Strategic Reflection ── */}
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-cyan-400" />
              <span className="font-bold text-sm">Section 5 — Strategic Reflection</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-2">
                  Biggest Risk
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {playbook.strategicReflection.biggestRisk}
                </p>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                  How I Will Adjust
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {playbook.strategicReflection.adjustment}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Plain text generator ───────────────────────────────────────────────────

function generatePlainText(p: PlaybookData): string {
  const line = '─'.repeat(60)
  const grade = p.scoreCard.grade
  const gradeLabel = grade === 'A' ? 'HOT' : grade === 'B' ? 'QUALIFIED' : 'COLD'

  let text = `${p.repName.toUpperCase()} AI-ASSISTED ACCOUNT PLAYBOOK\n`
  text += `Account: ${p.accountName} | Grade: ${grade} (${gradeLabel}) | SCORE: ${p.scoreCard.totalYes}/5\n`
  text += `Generated: ${new Date(p.generatedAt).toLocaleString()}\n${line}\n\n`

  // Section 1
  text += `SECTION 1: THE CHESSBOARD\n${line}\n`
  const roles = [
    { label: 'Champion', data: p.chessboard.champion },
    { label: 'Economic Buyer', data: p.chessboard.economicBuyer },
    { label: 'Influencer', data: p.chessboard.influencer },
    { label: 'Blocker', data: p.chessboard.blocker },
  ]
  roles.forEach((r) => {
    text += `${r.label}: ${r.data.name}, ${r.data.title}\n`
    text += `  Notes: ${r.data.notes}\n\n`
  })

  // Section 2
  text += `SECTION 2: SCORE CARD — Grade ${p.scoreCard.grade} (${p.scoreCard.totalYes}/5)\n${line}\n`
  const scoreKeys = ['signals', 'committee', 'opportunities', 'relationships', 'engagement'] as const
  const scoreLabels: Record<string, string> = {
    signals: 'S — Signals',
    committee: 'C — Committee',
    opportunities: 'O — Opportunities',
    relationships: 'R — Relationships',
    engagement: 'E — Engagement',
  }
  scoreKeys.forEach((k) => {
    const criterion = p.scoreCard[k]
    text += `${scoreLabels[k]}: ${criterion.answer}\n`
    text += `  Evidence: ${criterion.evidence}\n\n`
  })
  text += `Rationale: ${p.scoreCard.rationale}\n\n`

  // Section 3
  text += `SECTION 3: OUTREACH MATRIX\n${line}\n`
  p.outreachMatrix.forEach((entry, i) => {
    text += `${i + 1}. ${entry.stakeholder} (${entry.role})\n`
    text += `   Primary Channel: ${entry.primaryChannel}\n`
    text += `   Angle: ${entry.messageAngle}\n`
    text += `   Why: ${entry.why}\n\n`
  })

  // Section 4
  text += `SECTION 4: AI VERIFICATION PROTOCOL\n${line}\n`
  text += `Company Research Prompt:\n  ${p.verificationProtocol.companyPrompt}\n\n`
  p.verificationProtocol.contactPrompts.forEach((prompt, i) => {
    text += `Contact Prompt ${i + 1}:\n  ${prompt}\n\n`
  })
  text += `TRUTH CHECK (2 sources required per fact):\n`
  p.verificationProtocol.claims.forEach((claim) => {
    text += `[${claim.verdict}] ${claim.claim}\n  ${claim.note}\n\n`
  })

  // Section 5
  text += `SECTION 5: STRATEGIC REFLECTION\n${line}\n`
  text += `Biggest Risk:\n  ${p.strategicReflection.biggestRisk}\n\n`
  text += `How I Will Adjust:\n  ${p.strategicReflection.adjustment}\n`

  return text
}
