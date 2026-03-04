'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Newspaper,
  HelpCircle,
  FileText,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  Pencil,
  RefreshCw,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  Square,
  RotateCcw,
  Star,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase1Data {
  whoIsCustomer: string
  problemOpportunity: string
  importantBenefit: string
  howYouKnow: string
  experienceLookLike: string
}

interface Phase2Data {
  [key: string]: string
  companyName: string
  productService: string
  targetCustomer: string
  primaryBenefit: string
  subtitleAddition: string
  city: string
  mediaOutlet: string
  proposedLaunchDate: string
  topProblems: string
  howSolvesSimply: string
  existingAlternatives: string
  differentiation: string
  executiveName: string
  executiveReason: string
  fictitiousCustomerName: string
  customerPainGoal: string
  callToAction: string
  ctaUrl: string
}

interface Phase3External {
  price: string
  howItWorks: string
  customerSupport: string
  whereToBuy: string
}

interface Phase3Internal {
  currentAlternatives: string
  tamAndDemand: string
  unitEconomics: string
  upfrontInvestment: string
  thirdPartyDependencies: string
  topFailureReasons: string
}

interface ValidationScore {
  score: number
  comment: string
}

interface ValidationResult {
  passed: boolean
  overallScore: number
  feedback: {
    whoIsCustomer: ValidationScore
    problemOpportunity: ValidationScore
    importantBenefit: ValidationScore
    howYouKnow: ValidationScore
    experienceLookLike: ValidationScore
  }
  summary: string
  coachingNote: string
}

interface GeneratedPR {
  headline: string
  subtitle: string
  launchLine: string
  problemParagraph: string
  solutionParagraph: string
  internalLeaderQuote: string
  customerQuote: string
  callToAction: string
  wordCount: number
}

interface FAQItem {
  question: string
  answer: string
}

interface GeneratedFAQ {
  external: FAQItem[]
  internal: FAQItem[]
}

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: 'Customer Questions', icon: HelpCircle, desc: 'The 5 foundational questions' },
  { id: 1, label: 'Press Release', icon: FileText, desc: 'Build the one-page PR' },
  { id: 2, label: 'FAQ Builder', icon: MessageSquare, desc: 'External + Internal FAQs' },
  { id: 3, label: 'Review & Export', icon: Eye, desc: 'Final document + annotation' },
]

const PHASE1_QUESTIONS = [
  {
    key: 'whoIsCustomer' as const,
    label: 'Who is the customer?',
    hint: 'Be specific. Define their role, industry, company size, and the trigger that makes this relevant to them right now. Avoid "everyone" or "businesses."',
    placeholder: 'e.g. VP of Revenue Cycle at a mid-market health system (200–500 beds) who has just been handed an ARR improvement target for the first time after a CFO change.',
  },
  {
    key: 'problemOpportunity' as const,
    label: 'What is the customer problem or opportunity?',
    hint: 'Name the specific pain with real stakes. What is it costing them — financially, operationally, personally?',
    placeholder: 'e.g. They are unknowingly leaking 8–12% of net patient revenue to denials and write-offs because their current billing workflow lacks automated payer-rule intelligence...',
  },
  {
    key: 'importantBenefit' as const,
    label: 'What is the most important customer benefit?',
    hint: "State the single most meaningful outcome. What specifically changes for them? Avoid generic claims like 'save time' — quantify or anchor it to a real outcome.",
    placeholder: 'e.g. They recover $1.2M–$2.4M in previously lost annual revenue without adding headcount, and can show their CFO a measurable ROI within 90 days.',
  },
  {
    key: 'howYouKnow' as const,
    label: 'How do you know what your customer needs or wants?',
    hint: 'Cite actual evidence. Customer interviews, survey data, support tickets, field observations, or verifiable market signals.',
    placeholder: 'e.g. We interviewed 14 VPs of Revenue Cycle in Q3. 11 cited denial write-offs as a top-3 issue. Average manual review cost was $38/claim — 3x the industry benchmark.',
  },
  {
    key: 'experienceLookLike' as const,
    label: 'What does the experience look like?',
    hint: "Walk through the specific steps. What does the customer actually do, see, and feel? Start from first touchpoint to realized benefit.",
    placeholder: 'e.g. The VP logs into a dashboard showing their denial rate vs. peers, clicks into a claim, sees the AI-flagged payer rule violation, approves the auto-generated appeal in 15 seconds...',
  },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PRFAQPage() {
  const [step, setStep] = useState(0)

  // Phase data
  const [phase1, setPhase1] = useState<Phase1Data>({
    whoIsCustomer: '', problemOpportunity: '', importantBenefit: '',
    howYouKnow: '', experienceLookLike: '',
  })
  const [phase2, setPhase2] = useState<Phase2Data>({
    companyName: '', productService: '', targetCustomer: '', primaryBenefit: '',
    subtitleAddition: '', city: '', mediaOutlet: '', proposedLaunchDate: '',
    topProblems: '', howSolvesSimply: '', existingAlternatives: '', differentiation: '',
    executiveName: '', executiveReason: '', fictitiousCustomerName: '',
    customerPainGoal: '', callToAction: '', ctaUrl: '',
  })
  const [phase3External, setPhase3External] = useState<Phase3External>({
    price: '', howItWorks: '', customerSupport: '', whereToBuy: '',
  })
  const [phase3Internal, setPhase3Internal] = useState<Phase3Internal>({
    currentAlternatives: '', tamAndDemand: '', unitEconomics: '',
    upfrontInvestment: '', thirdPartyDependencies: '', topFailureReasons: '',
  })

  // Generated content
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [generatedPR, setGeneratedPR] = useState<GeneratedPR | null>(null)
  const [generatedFAQ, setGeneratedFAQ] = useState<GeneratedFAQ | null>(null)

  // UI state
  const [loading, setLoading] = useState<string | null>(null)
  const [faqTab, setFaqTab] = useState<'external' | 'internal'>('external')
  const [annotating, setAnnotating] = useState<string | null>(null)
  const [annotationFeedback, setAnnotationFeedback] = useState('')
  const [rewriting, setRewriting] = useState<string | null>(null)
  const [rewrittenSections, setRewrittenSections] = useState<Record<string, string>>({})

  // Timer state
  const [timerDuration, setTimerDuration] = useState(15)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer logic
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const totalSecs = timerDuration * 60
    setTimerSeconds(totalSecs)
    setTimerActive(true)
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerActive(false)
    setTimerSeconds(0)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const timerPct = timerActive && timerDuration > 0
    ? ((timerDuration * 60 - timerSeconds) / (timerDuration * 60)) * 100
    : 0

  // ── API Calls ───────────────────────────────────────────────────────────────

  const callAPI = async (action: string, extra?: Record<string, unknown>) => {
    const res = await fetch('/api/prfaq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, phase1, phase2, phase3External, phase3Internal, ...extra }),
    })
    if (!res.ok) throw new Error('API request failed')
    return res.json()
  }

  const handleValidate = async () => {
    setLoading('validate')
    try {
      const data = await callAPI('validate')
      setValidation(data)
    } catch {
      alert('Validation failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleGeneratePR = async () => {
    setLoading('generate-pr')
    try {
      const data = await callAPI('generate-pr')
      setGeneratedPR(data)
    } catch {
      alert('PR generation failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateFAQ = async () => {
    setLoading('generate-faq')
    try {
      const data = await callAPI('generate-faq')
      setGeneratedFAQ(data)
    } catch {
      alert('FAQ generation failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleRewrite = async (sectionId: string, sectionName: string, originalContent: string) => {
    if (!annotationFeedback.trim()) return
    setRewriting(sectionId)
    try {
      const data = await callAPI('rewrite', {
        rewriteTarget: sectionName,
        currentContent: originalContent,
        rewriteFeedback: annotationFeedback,
      })
      if (data.rewrittenContent) {
        setRewrittenSections((prev) => ({ ...prev, [sectionId]: data.rewrittenContent }))
        setAnnotating(null)
        setAnnotationFeedback('')
      }
    } catch {
      alert('Rewrite failed. Please try again.')
    } finally {
      setRewriting(null)
    }
  }

  const getSectionContent = (id: string, original: string) => rewrittenSections[id] ?? original

  // ── Score helpers ───────────────────────────────────────────────────────────

  const scoreColor = (s: number) =>
    s >= 8 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : s >= 6 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-rose-100 text-rose-700 border-rose-200'

  const scoreBig = (s: number) =>
    s >= 8 ? 'text-emerald-600' : s >= 6 ? 'text-amber-600' : 'text-rose-600'

  // ── Inner Components ────────────────────────────────────────────────────────

  // Mad Lib template preview
  const MadLibLine = ({ template, values }: { template: string; values: Record<string, string> }) => {
    const parts = template.split(/(\{[^}]+\})/)
    return (
      <p className="text-sm leading-relaxed text-slate-500 italic font-mono">
        {parts.map((part, i) => {
          const match = part.match(/^\{(.+)\}$/)
          if (match) {
            const val = values[match[1]]
            return val
              ? <span key={i} className="text-indigo-600 font-semibold not-italic">{val}</span>
              : <span key={i} className="text-slate-400 border-b border-dashed border-slate-300">{part}</span>
          }
          return <span key={i}>{part}</span>
        })}
      </p>
    )
  }

  // Annotation panel (shown inline under a section in Review)
  const AnnotatePanel = ({
    sectionId, sectionName, originalContent,
  }: { sectionId: string; sectionName: string; originalContent: string }) => {
    if (annotating !== sectionId) return null
    const current = getSectionContent(sectionId, originalContent)
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Pencil size={12} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Annotate: {sectionName}
          </span>
        </div>
        <textarea
          className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          rows={3}
          placeholder={`Describe what needs to change… e.g. "Make the problem more specific to mid-market healthcare CFOs — the current version feels too generic."`}
          value={annotationFeedback}
          onChange={(e) => setAnnotationFeedback(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleRewrite(sectionId, sectionName, current)}
            disabled={!annotationFeedback.trim() || rewriting === sectionId}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rewriting === sectionId
              ? <><Loader2 size={12} className="animate-spin" /> Rewriting…</>
              : <><RefreshCw size={12} /> Rewrite Section</>}
          </button>
          <button
            onClick={() => { setAnnotating(null); setAnnotationFeedback('') }}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Reviewable section block in the document
  const SectionBlock = ({
    id, label, content, isQuote = false,
  }: { id: string; label: string; content: string; isQuote?: boolean }) => {
    const display = getSectionContent(id, content)
    const revised = !!rewrittenSections[id]
    return (
      <div className="py-5 border-b border-slate-100 last:border-b-0">
        <div className="flex items-start justify-between gap-4 mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {revised && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                REVISED
              </span>
            )}
            <button
              onClick={() => {
                setAnnotating(annotating === id ? null : id)
                setAnnotationFeedback('')
              }}
              className={cn(
                'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors',
                annotating === id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50',
              )}
            >
              <Pencil size={10} />
              {annotating === id ? 'Annotating' : 'Annotate'}
            </button>
          </div>
        </div>
        {isQuote ? (
          <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-700 text-sm leading-relaxed">
            &ldquo;{display}&rdquo;
          </blockquote>
        ) : (
          <p className="text-sm text-slate-800 leading-relaxed">{display}</p>
        )}
        <AnnotatePanel sectionId={id} sectionName={label} originalContent={content} />
      </div>
    )
  }

  // FAQ block in Review
  const FAQBlock = ({ id, item }: { id: string; item: FAQItem }) => {
    const display = getSectionContent(id, item.answer)
    const revised = !!rewrittenSections[id]
    return (
      <div className="py-4 border-b border-slate-100 last:border-b-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{item.question}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {revised && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                REVISED
              </span>
            )}
            <button
              onClick={() => {
                setAnnotating(annotating === id ? null : id)
                setAnnotationFeedback('')
              }}
              className={cn(
                'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors',
                annotating === id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50',
              )}
            >
              <Pencil size={10} />
              {annotating === id ? 'Annotating' : 'Annotate'}
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{display}</p>
        <AnnotatePanel sectionId={id} sectionName={item.question} originalContent={item.answer} />
      </div>
    )
  }

  // Step progress bar
  const StepBar = () => (
    <div className="flex items-center gap-0 mb-8 print:hidden">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const done = step > s.id
        const active = step === s.id
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => {
                if (done) setStep(s.id)
              }}
              disabled={!done && !active}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : active
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white border-slate-200 text-slate-400',
                )}
              >
                {done ? <Check size={15} /> : <Icon size={15} />}
              </div>
              <div className="text-center hidden sm:block">
                <div
                  className={cn(
                    'text-[10px] font-bold whitespace-nowrap',
                    active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-slate-400',
                  )}
                >
                  {s.label}
                </div>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2', done ? 'bg-emerald-400' : 'bg-slate-200')} />
            )}
          </div>
        )
      })}
    </div>
  )

  // ── Phase 1: Customer Questions ─────────────────────────────────────────────

  const renderPhase1 = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 flex gap-3">
        <Info size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800 leading-relaxed">
          Before drafting a press release, Amazon requires you to answer 5 foundational questions
          about the customer. The AI will validate your answers — vague or generic responses will not
          be accepted. Great PR/FAQs often take 10+ drafts; precision here prevents wasted iteration
          later.
        </p>
      </div>

      <div className="space-y-4">
        {PHASE1_QUESTIONS.map((q, i) => (
          <div key={q.key} className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">{q.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed italic">{q.hint}</p>
              </div>
            </div>
            <div className="p-4">
              <textarea
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none leading-relaxed"
                rows={3}
                placeholder={q.placeholder}
                value={phase1[q.key]}
                onChange={(e) => setPhase1((p) => ({ ...p, [q.key]: e.target.value }))}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Validation result */}
      {validation && (
        <div
          className={cn(
            'rounded-xl border overflow-hidden',
            validation.passed ? 'border-emerald-200' : 'border-rose-200',
          )}
        >
          <div
            className={cn(
              'px-5 py-4 flex items-center gap-4',
              validation.passed ? 'bg-emerald-50' : 'bg-rose-50',
            )}
          >
            {validation.passed
              ? <CheckCircle size={22} className="text-emerald-600 flex-shrink-0" />
              : <XCircle size={22} className="text-rose-600 flex-shrink-0" />}
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900">
                {validation.passed ? 'Answers approved — proceed to Press Release' : 'Not ready yet — answers need more specificity'}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{validation.summary}</p>
            </div>
            <div className={cn('text-3xl font-black flex-shrink-0', scoreBig(validation.overallScore))}>
              {validation.overallScore}<span className="text-base font-semibold text-slate-400">/10</span>
            </div>
          </div>

          <div className="bg-white divide-y divide-slate-100">
            {PHASE1_QUESTIONS.map((q) => {
              const fb = validation.feedback[q.key]
              return (
                <div key={q.key} className="px-5 py-3 flex items-start gap-3">
                  <div className="flex items-center gap-2 w-52 flex-shrink-0">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <Star
                          key={n}
                          size={8}
                          className={n <= fb.score ? scoreBig(fb.score) : 'text-slate-200'}
                          fill={n <= fb.score ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className={cn('text-xs font-bold border rounded-full px-1.5 py-0.5', scoreColor(fb.score))}>
                      {fb.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">{fb.comment}</p>
                </div>
              )
            })}
          </div>

          {!validation.passed && (
            <div className="px-5 py-3.5 bg-amber-50 border-t border-amber-200 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Coaching note: </span>{validation.coachingNote}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          disabled={loading === 'validate'}
          className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading === 'validate'
            ? <><Loader2 size={15} className="animate-spin" /> Validating answers…</>
            : <><Sparkles size={15} /> Validate with AI</>}
        </button>
        {validation?.passed && (
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Proceed to Press Release <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  )

  // ── Phase 2: Press Release Builder ─────────────────────────────────────────

  const renderPhase2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          Fill in the building blocks below. The AI will synthesize your raw inputs into a
          cohesive, Amazon-style narrative press release — no bullet points, no jargon. It will
          write strictly from the customer&apos;s perspective, keeping the total under one page.
        </p>
      </div>

      {/* Headline section */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headline</span>
          <p className="text-[10px] text-slate-600 mt-0.5">Single sentence, immediately understood by a non-expert</p>
        </div>
        <div className="p-5">
          <div className="mb-4 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mad Lib Template</p>
            <MadLibLine
              template="{companyName} announces {productService} to enable {targetCustomer} to {primaryBenefit}."
              values={phase2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'companyName' as const, label: 'Your Company Name', placeholder: 'e.g. RevCycle AI' },
              { key: 'productService' as const, label: 'Product / Service Name', placeholder: 'e.g. DenialGuard Pro' },
              { key: 'targetCustomer' as const, label: 'Target Customer', placeholder: 'e.g. VP of Revenue Cycle' },
              { key: 'primaryBenefit' as const, label: 'Primary Benefit', placeholder: 'e.g. recover lost claim revenue without adding headcount' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  placeholder={f.placeholder}
                  value={phase2[f.key]}
                  onChange={(e) => setPhase2((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtitle + Launch Details */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtitle & Launch Details</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Subtitle — Additional context about the customer or benefit
            </label>
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="e.g. New AI-powered denial prevention platform targets the $8.9B annual revenue leak in mid-market hospitals"
              value={phase2.subtitleAddition}
              onChange={(e) => setPhase2((p) => ({ ...p, subtitleAddition: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'city' as const, label: 'City', placeholder: 'e.g. Nashville, TN' },
              { key: 'mediaOutlet' as const, label: 'Media Outlet', placeholder: 'e.g. Healthcare Finance News' },
              { key: 'proposedLaunchDate' as const, label: 'Proposed Launch Date', placeholder: 'e.g. Q1 2026' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  placeholder={f.placeholder}
                  value={phase2[f.key]}
                  onChange={(e) => setPhase2((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problem paragraph */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Problem Paragraph</span>
          <p className="text-[10px] text-slate-600 mt-0.5">Ranked by pain severity — do NOT mention the solution here</p>
        </div>
        <div className="p-5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Top 2–3 Customer Problems (ranked: most painful first)
          </label>
          <textarea
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none leading-relaxed"
            rows={3}
            placeholder={`1. Denial write-offs averaging 10% of net patient revenue — fully invisible until month-end close\n2. Manual appeal process costs $38/claim and takes 4–8 hours per case\n3. No real-time payer rule visibility — rules change 15x/year and staff find out when claims reject`}
            value={phase2.topProblems}
            onChange={(e) => setPhase2((p) => ({ ...p, topProblems: e.target.value }))}
          />
        </div>
      </div>

      {/* Solution paragraph */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Solution Paragraph</span>
          <p className="text-[10px] text-slate-600 mt-0.5">Must explicitly state how this is better, faster, or cheaper than alternatives</p>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'howSolvesSimply' as const, label: 'How does this solve the problem — simply?', rows: 2, placeholder: 'e.g. DenialGuard ingests claim data in real time, applies a daily-updated payer rule engine, and flags issues before submission — eliminating the denial before it happens.' },
            { key: 'existingAlternatives' as const, label: 'What do customers use today?', rows: 2, placeholder: 'e.g. Manual billing staff review, RCM outsourcing firms at 4–6% of collections, or legacy clearinghouse tools with static rule sets updated quarterly.' },
            { key: 'differentiation' as const, label: 'How is this meaningfully better / faster / cheaper?', rows: 2, placeholder: 'e.g. 3x faster than manual review, 60% lower cost than outsourcing, and the only solution with real-time payer rule ingestion — not quarterly batch updates.' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
              <textarea
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none leading-relaxed"
                rows={f.rows}
                placeholder={f.placeholder}
                value={phase2[f.key]}
                onChange={(e) => setPhase2((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quotes */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quotes</span>
          <p className="text-[10px] text-slate-600 mt-0.5">AI will write both — give it raw material to work from</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Executive Name & Title
              </label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                placeholder="e.g. Sarah Chen, CEO"
                value={phase2.executiveName}
                onChange={(e) => setPhase2((p) => ({ ...p, executiveName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Fictional Customer Name & Title
              </label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                placeholder="e.g. Mark Tillman, VP Revenue Cycle"
              value={phase2.fictitiousCustomerName}
                onChange={(e) => setPhase2((p) => ({ ...p, fictitiousCustomerName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Executive&apos;s strategic reason for building this
            </label>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
              rows={2}
              placeholder="e.g. Revenue leakage is a silent killer for health systems — they often don't see the full scope until year-end. We built this because we believe every dollar of care delivered should be a dollar collected."
              value={phase2.executiveReason}
              onChange={(e) => setPhase2((p) => ({ ...p, executiveReason: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Customer&apos;s specific pain or goal (for the customer quote)
            </label>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
              rows={2}
              placeholder="e.g. Was drowning in denial appeals, spending 30% of team's time on rework. Needed to show CFO a path to margin improvement without hiring."
              value={phase2.customerPainGoal}
              onChange={(e) => setPhase2((p) => ({ ...p, customerPainGoal: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Call to Action</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              One sentence: how to start today
            </label>
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="e.g. Request a free denial audit at"
              value={phase2.callToAction}
              onChange={(e) => setPhase2((p) => ({ ...p, callToAction: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">URL</label>
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="e.g. www.denialguard.com/audit"
              value={phase2.ctaUrl}
              onChange={(e) => setPhase2((p) => ({ ...p, ctaUrl: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={handleGeneratePR}
          disabled={loading === 'generate-pr'}
          className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading === 'generate-pr'
            ? <><Loader2 size={15} className="animate-spin" /> Generating Press Release…</>
            : <><Sparkles size={15} /> Generate Press Release</>}
        </button>
        {generatedPR && (
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Continue to FAQ Builder <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Generated PR preview */}
      {generatedPR && (
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500" />
              <span className="font-semibold text-sm text-slate-900">Press Release Generated</span>
              {generatedPR.wordCount && (
                <span className="text-xs text-slate-400 ml-1">~{generatedPR.wordCount} words</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Preview — full formatting in Review</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Headline</p>
              <p className="text-base font-bold text-slate-900 leading-tight">{generatedPR.headline}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subtitle</p>
              <p className="text-sm text-slate-700 italic">{generatedPR.subtitle}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">The Problem</p>
              <p className="text-sm text-slate-700 leading-relaxed">{generatedPR.problemParagraph}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">The Solution</p>
              <p className="text-sm text-slate-700 leading-relaxed">{generatedPR.solutionParagraph}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── Phase 3: FAQ Builder ────────────────────────────────────────────────────

  const renderPhase3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 flex gap-3">
        <Info size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-800 leading-relaxed">
          The FAQ is the map to your destination. External FAQs address what customers and press will
          ask. Internal FAQs force you to think like an executive and honestly confront the hard
          problems — especially the &ldquo;Dragon&rdquo; question about why this will fail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['external', 'internal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFaqTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-lg transition-all',
              faqTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {t === 'external' ? '🌐 External FAQs' : '🏢 Internal FAQs'}
          </button>
        ))}
      </div>

      {faqTab === 'external' && (
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">External FAQs</span>
            <p className="text-[10px] text-slate-600 mt-0.5">Customer & press-facing — plain language, jargon-free</p>
          </div>
          <div className="p-5 space-y-4">
            {[
              { key: 'price' as const, label: 'What is the price?', placeholder: 'e.g. $2,500/month for up to 5,000 claims/month. Enterprise pricing available for >20,000 claims.' },
              { key: 'howItWorks' as const, label: 'How does it work?', placeholder: 'e.g. Connect your existing billing system in 30 minutes. DenialGuard reads every outgoing claim, checks it against the payer rule engine, and flags issues in real time before submission.' },
              { key: 'customerSupport' as const, label: 'How do I get customer support?', placeholder: 'e.g. Every customer has a dedicated onboarding specialist. After go-live, support is available via in-app chat (2hr SLA) and phone (business hours).' },
              { key: 'whereToBuy' as const, label: 'Where can I buy it?', placeholder: 'e.g. Sign up directly at denialguard.com or through our partner network of 12 certified RCM consulting firms.' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <textarea
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none leading-relaxed"
                  rows={2}
                  placeholder={f.placeholder}
                  value={phase3External[f.key]}
                  onChange={(e) => setPhase3External((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {faqTab === 'internal' && (
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal FAQs</span>
            <p className="text-[10px] text-slate-600 mt-0.5">Stakeholder-facing — data-based, no spin, no wishful thinking</p>
          </div>
          <div className="p-5 space-y-4">
            {[
              { key: 'currentAlternatives' as const, label: 'What products do customers use today to solve this?', placeholder: 'e.g. Manual billing staff (avg 2.3 FTEs dedicated to denial rework), legacy clearinghouses (Availity, Change Healthcare), outsourced RCM at 4–6% of collections.' },
              { key: 'tamAndDemand' as const, label: 'What is the TAM and estimated consumer demand?', placeholder: 'e.g. 1,800 mid-market hospitals in the US (200–500 beds). At $30K ARR average, TAM = $54M. Current pipeline signals 120 qualified leads from field events in Q3.' },
              { key: 'unitEconomics' as const, label: 'What are the per-unit economics (gross profit / contribution margin)?', placeholder: 'e.g. COGS per customer: ~$400/month (cloud infra + support). Gross margin at $2,500 ARR = ~84%. CAC estimate: $8,500 blended. Payback period: ~4.1 months.' },
              { key: 'upfrontInvestment' as const, label: 'What upfront investment is required — people, technology, fixed costs?', placeholder: 'e.g. Engineering: 2 FTE for 6 months to build payer rule API integration layer. Data: $120K for initial payer rule dataset licensing. Sales: 2 dedicated AEs, 1 SDR.' },
              { key: 'thirdPartyDependencies' as const, label: 'What are our third-party dependencies?', placeholder: 'e.g. Payer rule data licensed from TriZetto (renewal risk: high — alternative vendors are Optum360, Waystar). Requires integration with Epic, Cerner, or Meditech — all via HL7 FHIR standard.' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <textarea
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none leading-relaxed"
                  rows={2}
                  placeholder={f.placeholder}
                  value={phase3Internal[f.key]}
                  onChange={(e) => setPhase3Internal((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}

            {/* Dragon question — highlighted */}
            <div className="rounded-xl border border-rose-200 overflow-hidden">
              <div className="px-4 py-3 bg-rose-950 flex items-center gap-2">
                <AlertTriangle size={13} className="text-rose-400" />
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                  🐉 The Dragon Question
                </span>
                <span className="text-[10px] text-rose-700 ml-1">— the most important question in the document</span>
              </div>
              <div className="p-4">
                <label className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block mb-1">
                  What are the top three reasons this product will NOT succeed?
                </label>
                <textarea
                  className="w-full text-sm border border-rose-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none leading-relaxed bg-rose-50"
                  rows={3}
                  placeholder={`1. Payer rule data has a 2-week lag from TriZetto — we claim real-time but can't guarantee it for all payers\n2. Epic integration requires IT involvement on the customer side — avg 6–8 week delay; kills momentum in deals\n3. Buyers at this level (VP RCM) don't own budget — CFO approval required, which we have no champion playbook for yet`}
                  value={phase3Internal.topFailureReasons}
                  onChange={(e) => setPhase3Internal((p) => ({ ...p, topFailureReasons: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={handleGenerateFAQ}
          disabled={loading === 'generate-faq'}
          className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading === 'generate-faq'
            ? <><Loader2 size={15} className="animate-spin" /> Generating FAQs…</>
            : <><Sparkles size={15} /> Generate FAQs</>}
        </button>
        {generatedFAQ && (
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Proceed to Review <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* FAQ preview */}
      {generatedFAQ && (
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-500" />
            <span className="font-semibold text-sm text-slate-900">FAQs Generated</span>
            <span className="text-xs text-slate-400 ml-1">
              {generatedFAQ.external.length} external · {generatedFAQ.internal.length} internal
            </span>
          </div>
          <div className="p-5 space-y-3">
            {generatedFAQ.external.slice(0, 2).map((item, i) => (
              <div key={i} className="pb-3 border-b border-slate-100 last:border-0">
                <p className="text-xs font-semibold text-slate-700 mb-1">{item.question}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.answer}</p>
              </div>
            ))}
            <p className="text-xs text-slate-400 text-center pt-1">+ {generatedFAQ.external.length - 2 + generatedFAQ.internal.length} more — see full document in Review</p>
          </div>
        </div>
      )}
    </div>
  )

  // ── Phase 4: Review & Export ────────────────────────────────────────────────

  const renderReview = () => {
    if (!generatedPR || !generatedFAQ) {
      return (
        <div className="text-center py-16">
          <AlertTriangle size={40} className="text-amber-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Press Release and FAQ must be generated before reviewing.</p>
          <button onClick={() => setStep(2)} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
            ← Go back to FAQ Builder
          </button>
        </div>
      )
    }

    const revisions = Object.keys(rewrittenSections).length

    return (
      <div className="space-y-5">
        {/* Review controls */}
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={14} /> Back to FAQ
          </button>

          {/* Timer control */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2">
            <Clock size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Silent Reading</span>
            {!timerActive ? (
              <>
                <select
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                >
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={25}>25 min</option>
                </select>
                <button
                  onClick={startTimer}
                  className="flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Play size={11} /> Start
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-black text-indigo-700 tabular-nums">{formatTime(timerSeconds)}</span>
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-1 text-xs font-semibold bg-rose-500 text-white px-2.5 py-1 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Square size={10} /> End
                </button>
              </>
            )}
          </div>

          {revisions > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl font-semibold">
              <RefreshCw size={12} />
              {revisions} section{revisions !== 1 ? 's' : ''} revised
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {revisions > 0 && (
              <button
                onClick={() => setRewrittenSections({})}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-rose-200 transition-colors"
              >
                <RotateCcw size={12} /> Reset revisions
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Printer size={14} /> Print / Export
            </button>
          </div>
        </div>

        {/* Timer progress bar */}
        {timerActive && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-800">
                Silent reading in progress — stakeholders should read independently before discussion
              </span>
              <span className="text-sm font-black text-indigo-700 tabular-nums">{formatTime(timerSeconds)} remaining</span>
            </div>
            <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── THE DOCUMENT ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Document header */}
          <div className="border-b border-slate-100 px-8 py-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              FOR IMMEDIATE RELEASE
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {getSectionContent('headline', generatedPR.headline)}
            </h1>
            <p className="text-base text-slate-600 italic leading-snug">
              {getSectionContent('subtitle', generatedPR.subtitle)}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => {
                  setAnnotating(annotating === 'headline' ? null : 'headline')
                  setAnnotationFeedback('')
                }}
                className={cn(
                  'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors print:hidden',
                  annotating === 'headline' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50',
                )}
              >
                <Pencil size={10} />
                {annotating === 'headline' ? 'Annotating headline' : 'Annotate headline'}
              </button>
            </div>
            <AnnotatePanel sectionId="headline" sectionName="Headline" originalContent={generatedPR.headline} />
            <AnnotatePanel sectionId="subtitle" sectionName="Subtitle" originalContent={generatedPR.subtitle} />
          </div>

          {/* Press release body */}
          <div className="px-8 py-2 divide-y divide-slate-100">
            <div className="py-5">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold">{generatedPR.launchLine}</span>
              </p>
            </div>

            <SectionBlock id="problem" label="The Problem" content={generatedPR.problemParagraph} />
            <SectionBlock id="solution" label="The Solution" content={generatedPR.solutionParagraph} />
            <SectionBlock id="leader-quote" label="Leadership Perspective" content={generatedPR.internalLeaderQuote} isQuote />
            <SectionBlock id="customer-quote" label="Customer Voice" content={generatedPR.customerQuote} isQuote />

            <div className="py-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Get Started</span>
              <p className="text-sm text-slate-700 leading-relaxed">
                {getSectionContent('cta', generatedPR.callToAction)}{' '}
                {phase2.ctaUrl && (
                  <a
                    href={phase2.ctaUrl.startsWith('http') ? phase2.ctaUrl : `https://${phase2.ctaUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    {phase2.ctaUrl} <ExternalLink size={11} />
                  </a>
                )}
              </p>
            </div>
          </div>

          {/* ── FAQ Section ───────────────────────────────────────────────────── */}
          <div className="border-t border-slate-200 px-8 py-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Appendix</div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mb-6">
              This document is confidential and intended for stakeholder review only.
            </p>

            {/* External FAQs */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Section A — External FAQs (Customer &amp; Press Facing)
                </h3>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {generatedFAQ.external.map((item, i) => (
                  <FAQBlock key={`ext-${i}`} id={`ext-${i}`} item={item} />
                ))}
              </div>
            </div>

            {/* Internal FAQs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Section B — Internal FAQs (Stakeholder Facing)
                </h3>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {generatedFAQ.internal.map((item, i) => (
                  <FAQBlock key={`int-${i}`} id={`int-${i}`} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Document footer */}
          <div className="border-t border-slate-100 px-8 py-4 flex items-center justify-between text-xs text-slate-400">
            <span>Working Backwards PR/FAQ — {phase2.companyName || 'Company'}</span>
            <span className="text-[10px]">
              This document is a working draft. Successful PR/FAQs typically require 10+ revision cycles.
            </span>
          </div>
        </div>

        {/* Start over */}
        <div className="flex justify-center print:hidden pt-2">
          <button
            onClick={() => {
              setStep(0)
              setValidation(null)
              setGeneratedPR(null)
              setGeneratedFAQ(null)
              setRewrittenSections({})
              setAnnotating(null)
              setAnnotationFeedback('')
              stopTimer()
            }}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={12} /> Start a new PR/FAQ
          </button>
        </div>
      </div>
    )
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Newspaper size={18} className="text-zinc-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Working Backwards / PR-FAQ</h1>
          <p className="text-slate-500 text-sm">
            Amazon&apos;s innovation framework — guided Mad Libs + AI narrative engine
          </p>
        </div>
      </div>

      <StepBar />

      {step === 0 && renderPhase1()}
      {step === 1 && renderPhase2()}
      {step === 2 && renderPhase3()}
      {step === 3 && renderReview()}
    </div>
  )
}
