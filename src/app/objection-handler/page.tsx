'use client'

import { useState, useEffect } from 'react'
import { ShieldAlert, Zap, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const LS_PRODUCT_KEY = 'sales-hub-objection-product'

type ObjectionCategory = 'pricing' | 'timing' | 'competition' | 'authority' | 'implementation' | 'smokescreen'
type Tone = 'empathetic' | 'challenger' | 'consultative'

interface ResponseSteps {
  acknowledge: string
  explore: string
  reframe: string
  advance: string
}

interface ObjectionResponse {
  id: number
  technique: string
  tone: Tone
  whenToUse: string
  steps: ResponseSteps
  fullScript: string
}

interface ObjectionResult {
  category: ObjectionCategory
  categoryLabel: string
  rootCause: string
  responses: ObjectionResponse[]
  coachingTip: string
  watchOut: string
}

// ─── Config ────────────────────────────────────────────────────────────────

const STAGES = ['Discovery', 'Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closing']

const PERSONAS = ['Economic Buyer', 'Technical Buyer', 'Champion', 'Procurement', 'End User', 'Unknown']

const CATEGORY_CFG: Record<ObjectionCategory, { bg: string; text: string; border: string }> = {
  pricing:        { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200' },
  timing:         { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  competition:    { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  authority:      { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  implementation: { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  smokescreen:    { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-300' },
}

const TONE_CFG: Record<Tone, { label: string; bg: string; text: string }> = {
  empathetic:   { label: 'Empathetic',   bg: 'bg-green-100',  text: 'text-green-700' },
  consultative: { label: 'Consultative', bg: 'bg-blue-100',   text: 'text-blue-700' },
  challenger:   { label: 'Challenger',   bg: 'bg-red-100',    text: 'text-red-700' },
}

const STEP_CFG = [
  { key: 'acknowledge' as const, label: 'ACKNOWLEDGE', border: 'border-green-400',  text: 'text-green-700' },
  { key: 'explore'     as const, label: 'EXPLORE',     border: 'border-blue-400',   text: 'text-blue-700' },
  { key: 'reframe'     as const, label: 'REFRAME',     border: 'border-amber-400',  text: 'text-amber-700' },
  { key: 'advance'     as const, label: 'ADVANCE',     border: 'border-purple-400', text: 'text-purple-700' },
]

// ─── Sub-components ─────────────────────────────────────────────────────────

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800',
      )}
    >
      {label}
    </button>
  )
}

function ResponseCard({ response, index }: { response: ObjectionResponse; index: number }) {
  const [showFull, setShowFull] = useState(false)
  const [copied, setCopied] = useState(false)
  const tone = TONE_CFG[response.tone] ?? TONE_CFG.consultative

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response.fullScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-2 flex-wrap">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-slate-900 flex-1 leading-tight">{response.technique}</span>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0',
            tone.bg,
            tone.text,
          )}
        >
          {tone.label}
        </span>
      </div>

      {/* When to use */}
      <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3 leading-relaxed">
        {response.whenToUse}
      </p>

      {/* L-A-E-R Steps */}
      <div className="flex flex-col gap-3">
        {STEP_CFG.map(({ key, label, border, text }) => (
          <div key={key} className={cn('border-l-2 pl-3', border)}>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', text)}>{label}</div>
            <p className="text-sm text-slate-700 leading-snug">{response.steps[key]}</p>
          </div>
        ))}
      </div>

      {/* Full script toggle */}
      <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
        <button
          onClick={() => setShowFull(!showFull)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showFull ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showFull ? 'Hide' : 'Show'} full script
        </button>
        {showFull && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 leading-relaxed italic">
            "{response.fullScript}"
          </div>
        )}
      </div>

      {/* Copy */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        {copied ? (
          <><Check size={13} className="text-green-600" /> Copied!</>
        ) : (
          <><Copy size={13} /> Copy full script</>
        )}
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ObjectionHandlerPage() {
  const [objection, setObjection]         = useState('')
  const [stage, setStage]                 = useState('Discovery')
  const [persona, setPersona]             = useState('Unknown')
  const [productContext, setProductContext] = useState('')
  const [loading, setLoading]             = useState(false)
  const [result, setResult]               = useState<ObjectionResult | null>(null)
  const [error, setError]                 = useState<string | null>(null)

  // Restore remembered product context
  useEffect(() => {
    const saved = localStorage.getItem(LS_PRODUCT_KEY)
    if (saved) setProductContext(saved)
  }, [])

  const handleSubmit = async () => {
    if (!objection.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    if (productContext.trim()) localStorage.setItem(LS_PRODUCT_KEY, productContext.trim())

    try {
      const res = await fetch('/api/objection/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objection, stage, persona, productContext }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setObjection('')
    setError(null)
  }

  const cat = result ? (CATEGORY_CFG[result.category] ?? CATEGORY_CFG.smokescreen) : null

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Objection Handler</h1>
            <p className="text-sm text-slate-500">3 responses, 3 techniques — empathetic · consultative · challenger</p>
          </div>
        </div>

        {/* ── Input Panel ────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">

          {/* Objection */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              What did they say?
            </label>
            <textarea
              value={objection}
              onChange={e => setObjection(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
              placeholder={`e.g. "Your price is too high" or "We already use a competitor" or "This isn't a priority right now..."`}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
          </div>

          {/* Stage */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Deal Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => (
                <PillButton key={s} label={s} active={stage === s} onClick={() => setStage(s)} />
              ))}
            </div>
          </div>

          {/* Persona */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Buyer Persona
            </label>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map(p => (
                <PillButton key={p} label={p} active={persona === p} onClick={() => setPersona(p)} />
              ))}
            </div>
          </div>

          {/* What do you sell */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              What do you sell?{' '}
              <span className="text-slate-400 font-normal normal-case tracking-normal">
                (remembered for future sessions)
              </span>
            </label>
            <input
              type="text"
              value={productContext}
              onChange={e => setProductContext(e.target.value)}
              placeholder="e.g. AI-powered sales intelligence platform for enterprise revenue teams"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!objection.trim() || loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
              objection.trim() && !loading
                ? 'bg-slate-900 text-white hover:bg-slate-700 shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Generating 3 responses…
              </>
            ) : (
              <>
                <Zap size={15} />
                Handle This Objection
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-2">⌘ + Enter to submit</p>
        </div>

        {/* ── Error ──────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────── */}
        {result && cat && (
          <div className="flex flex-col gap-5">

            {/* Category + Root Cause */}
            <div className={cn('rounded-xl border p-4 flex flex-col gap-1', cat.bg, cat.border)}>
              <span className={cn('text-[11px] font-bold uppercase tracking-widest', cat.text)}>
                {result.categoryLabel}
              </span>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Root cause: </span>
                {result.rootCause}
              </p>
            </div>

            {/* 3 Response Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {result.responses.map((r, i) => (
                <ResponseCard key={r.id} response={r} index={i} />
              ))}
            </div>

            {/* Coaching Tip + Watch Out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Lightbulb size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
                    Coaching Tip
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{result.coachingTip}</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1">
                    Watch Out
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{result.watchOut}</p>
                </div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors self-center"
            >
              <RotateCcw size={13} />
              Handle another objection
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
