'use client'

import { useState } from 'react'
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Users,
  Lightbulb,
  DollarSign,
  Puzzle,
  List,
  Star,
} from 'lucide-react'
import { generateId, copyToClipboard, cn } from '@/lib/utils'
import type { MemoData, MemoOption } from '@/lib/types'

// ─── Default state ─────────────────────────────────────────────────────────────

const defaultOption = (): MemoOption => ({
  id: generateId(),
  title: '',
  details: '',
  financial: '',
  implementer: '',
  time: '',
  pros: '',
  cons: '',
})

const defaultMemo = (): MemoData => ({
  owner: '',
  contributors: '',
  decisionMaker: '',
  pastActions: '',
  whatChanged: '',
  currentProblem: '',
  timeSavings: '',
  revenueImpact: '',
  nonMonetary: '',
  integrations: '',
  coreProblem: '',
  techStackFit: '',
  options: [
    { ...defaultOption(), id: 'status-quo', title: 'Option 1: Status Quo (Do Nothing)' },
    { ...defaultOption(), id: 'opt-2', title: 'Option 2: ' },
  ],
  recommendation: '',
  predictedOutcomes: '',
  nextSteps: '',
  contributorThoughts: '',
  finalDecision: '',
})

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="section-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="section-header w-full text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center`}>
            <Icon size={15} className={iconColor} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {hint && <p className="text-xs text-slate-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  )
}

// ─── Generate plain text ───────────────────────────────────────────────────────

function generateMemoText(memo: MemoData): string {
  const line = '─'.repeat(60)
  const sectionHead = (title: string) => `\n${line}\n${title.toUpperCase()}\n${line}\n`

  let text = `DECISION MEMO\nGenerated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}\n`

  text += sectionHead('Stakeholders')
  text += `Owner: ${memo.owner || '[Owner]'}\n`
  text += `Contributors: ${memo.contributors || '[Contributors]'}\n`
  text += `Decision Maker: ${memo.decisionMaker || '[Decision Maker]'}\n`

  text += sectionHead('Context')
  text += `Past Actions:\n${memo.pastActions || '[Past Actions]'}\n\n`
  text += `What Changed:\n${memo.whatChanged || '[What Changed]'}\n\n`
  text += `Current Problem / Opportunity:\n${memo.currentProblem || '[Problem Statement]'}\n`

  text += sectionHead('Business Case')
  text += `Time Savings:\n${memo.timeSavings || '[Time Savings]'}\n\n`
  text += `Revenue Impact:\n${memo.revenueImpact || '[Revenue Impact]'}\n\n`
  text += `Non-Monetary Benefits:\n${memo.nonMonetary || '[Non-Monetary Benefits]'}\n`

  text += sectionHead('Use Cases & Integrations')
  text += `Integrations:\n${memo.integrations || '[Integrations]'}\n\n`
  text += `Core Problem Being Solved:\n${memo.coreProblem || '[Core Problem]'}\n\n`
  text += `Tech Stack Fit:\n${memo.techStackFit || '[Tech Stack Fit]'}\n`

  text += sectionHead('Options Analysis')
  memo.options.forEach((opt, i) => {
    text += `\n${opt.title || `Option ${i + 1}`}\n`
    text += `Details: ${opt.details || '[Details]'}\n`
    text += `Resources — Financial: ${opt.financial || '[Cost]'} | Implementer: ${opt.implementer || '[Who]'} | Time: ${opt.time || '[Duration]'}\n`
    text += `Pros: ${opt.pros || '[Pros]'}\n`
    text += `Cons: ${opt.cons || '[Cons]'}\n`
  })

  text += sectionHead('Recommendation')
  text += `Recommended Course of Action:\n${memo.recommendation || '[Recommendation]'}\n\n`
  text += `Predicted Outcomes:\n${memo.predictedOutcomes || '[Outcomes]'}\n\n`
  text += `Next Steps:\n${memo.nextSteps || '[Next Steps]'}\n\n`
  text += `Contributor Thoughts:\n${memo.contributorThoughts || '[Thoughts]'}\n\n`
  text += `Final Decision:\n${memo.finalDecision || '[Pending]'}\n`

  return text
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DecisionMemoPage() {
  const [memo, setMemo] = useState<MemoData>(defaultMemo())
  const [copied, setCopied] = useState(false)

  const set = (field: keyof Omit<MemoData, 'options'>) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMemo((prev) => ({ ...prev, [field]: e.target.value }))
  )

  const setOption = (id: string, field: keyof MemoOption) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMemo((prev) => ({
        ...prev,
        options: prev.options.map((o) =>
          o.id === id ? { ...o, [field]: e.target.value } : o,
        ),
      }))
  )

  const addOption = () => {
    const n = memo.options.length + 1
    const newOpt = { ...defaultOption(), title: `Option ${n}: ` }
    setMemo((prev) => ({ ...prev, options: [...prev.options, newOpt] }))
  }

  const removeOption = (id: string) => {
    setMemo((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== id),
    }))
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(generateMemoText(memo))
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const text = generateMemoText(memo)
    win.document.write(`<html><head><title>Decision Memo</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.6;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;word-wrap:break-word;font-family:monospace;font-size:10pt}
      h1{font-size:18pt;color:#0f172a;margin-bottom:4px}
      p{color:#64748b;font-size:10pt;margin-top:0}</style></head>
      <body><h1>Decision Memo</h1><p>Generated ${new Date().toLocaleDateString()}</p>
      <pre>${text}</pre></body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Decision Memo Builder</h1>
            <p className="text-slate-500 text-sm">Structure a business case with options, analysis, and recommendation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs">
            <Printer size={14} /> PDF
          </button>
          <button
            onClick={handleCopy}
            className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Memo'}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-4xl">
        {/* Stakeholders */}
        <Section title="Stakeholders" icon={Users} iconBg="bg-slate-100" iconColor="text-slate-600">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Owner" hint="Who is responsible for this decision?">
              <input className="field-input" placeholder="e.g. VP of Sales" value={memo.owner} onChange={set('owner')} />
            </Field>
            <Field label="Contributors" hint="Who provides input?">
              <input className="field-input" placeholder="e.g. Sales Ops, Finance, IT" value={memo.contributors} onChange={set('contributors')} />
            </Field>
            <Field label="Decision Maker" hint="Who has final say?">
              <input className="field-input" placeholder="e.g. CRO" value={memo.decisionMaker} onChange={set('decisionMaker')} />
            </Field>
          </div>
        </Section>

        {/* Context */}
        <Section title="Context" icon={Lightbulb} iconBg="bg-amber-100" iconColor="text-amber-600">
          <Field label="Past Actions" hint="What has been done / tried so far?">
            <textarea className="field-textarea" rows={3} placeholder="Describe previous attempts, evaluations, or related decisions..." value={memo.pastActions} onChange={set('pastActions')} />
          </Field>
          <Field label="What Changed" hint="Why is a decision needed now?">
            <textarea className="field-textarea" rows={2} placeholder="A market shift, contract renewal, team growth, executive mandate..." value={memo.whatChanged} onChange={set('whatChanged')} />
          </Field>
          <Field label="Current Problem or Opportunity">
            <textarea className="field-textarea" rows={3} placeholder="Describe the core problem or opportunity being addressed. Be specific — include metrics where possible." value={memo.currentProblem} onChange={set('currentProblem')} />
          </Field>
        </Section>

        {/* Business Case */}
        <Section title="Business Case" icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          <Field label="Time Savings" hint="Hours saved, process steps eliminated, FTE reduction...">
            <textarea className="field-textarea" rows={2} placeholder="e.g. Eliminates 12 hours/week of manual reporting across the revenue team = ~$78K annualized at fully-loaded cost" value={memo.timeSavings} onChange={set('timeSavings')} />
          </Field>
          <Field label="Revenue Impact" hint="Pipeline generated, deals won, churn prevented, upsell unlocked...">
            <textarea className="field-textarea" rows={2} placeholder="e.g. 15% improvement in rep ramp time on 10 new hires = estimated $1.2M in incremental ARR in first 6 months" value={memo.revenueImpact} onChange={set('revenueImpact')} />
          </Field>
          <Field label="Non-Monetary Benefits" hint="Morale, compliance, risk reduction, competitive positioning...">
            <textarea className="field-textarea" rows={2} placeholder="e.g. Reduces compliance risk, improves new rep experience, provides competitive parity with top-quartile sales orgs" value={memo.nonMonetary} onChange={set('nonMonetary')} />
          </Field>
        </Section>

        {/* Use Cases & Integrations */}
        <Section title="Use Cases & Integrations" icon={Puzzle} iconBg="bg-violet-100" iconColor="text-violet-600">
          <Field label="Integrations Required">
            <input className="field-input" placeholder="e.g. Salesforce CRM, Gong, Slack, HRIS (Workday)" value={memo.integrations} onChange={set('integrations')} />
          </Field>
          <Field label="Core Problem Being Solved">
            <textarea className="field-textarea" rows={3} placeholder="In 2-3 sentences: what specific pain does this solve and for which users?" value={memo.coreProblem} onChange={set('coreProblem')} />
          </Field>
          <Field label="Fit with Current Tech Stack">
            <textarea className="field-textarea" rows={2} placeholder="How does this complement (not duplicate) existing tools? Any decommission opportunities?" value={memo.techStackFit} onChange={set('techStackFit')} />
          </Field>
        </Section>

        {/* Options */}
        <Section title="Options" icon={List} iconBg="bg-rose-100" iconColor="text-rose-600">
          <p className="text-xs text-slate-500 -mt-1">Option 1 is always the Status Quo (do nothing). Add as many options as needed.</p>
          <div className="space-y-5">
            {memo.options.map((opt, i) => (
              <div key={opt.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className={cn(
                  'px-4 py-3 flex items-center justify-between border-b border-slate-100',
                  i === 0 ? 'bg-slate-50' : 'bg-white',
                )}>
                  <input
                    className="text-sm font-semibold text-slate-900 bg-transparent border-none outline-none flex-1"
                    value={opt.title}
                    onChange={setOption(opt.id, 'title')}
                    placeholder={`Option ${i + 1}: Give it a descriptive name`}
                  />
                  {i > 0 && (
                    <button onClick={() => removeOption(opt.id)} className="btn-danger p-1 ml-2">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Details">
                      <textarea className="field-textarea" rows={2} placeholder={i === 0 ? "Describe what 'doing nothing' means — the current state and its trajectory..." : "Describe this option in detail..."} value={opt.details} onChange={setOption(opt.id, 'details')} />
                    </Field>
                  </div>
                  <Field label="Financial Resources">
                    <input className="field-input" placeholder="e.g. $120K/yr license + $20K implementation" value={opt.financial} onChange={setOption(opt.id, 'financial')} />
                  </Field>
                  <Field label="Implementer">
                    <input className="field-input" placeholder="e.g. Sales Ops + external vendor" value={opt.implementer} onChange={setOption(opt.id, 'implementer')} />
                  </Field>
                  <Field label="Time to Value">
                    <input className="field-input" placeholder="e.g. 6–8 weeks to full deployment" value={opt.time} onChange={setOption(opt.id, 'time')} />
                  </Field>
                  <div />
                  <Field label="Pros">
                    <textarea className="field-textarea" rows={2} placeholder="List the key advantages..." value={opt.pros} onChange={setOption(opt.id, 'pros')} />
                  </Field>
                  <Field label="Cons">
                    <textarea className="field-textarea" rows={2} placeholder="List the key disadvantages / risks..." value={opt.cons} onChange={setOption(opt.id, 'cons')} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addOption} className="btn-secondary text-xs w-full">
            <Plus size={14} /> Add Option
          </button>
        </Section>

        {/* Recommendation */}
        <Section title="Recommendation & Decision" icon={Star} iconBg="bg-brand-100" iconColor="text-brand-600">
          <Field label="Recommended Course of Action">
            <textarea className="field-textarea" rows={3} placeholder="State which option you recommend and the core rationale..." value={memo.recommendation} onChange={set('recommendation')} />
          </Field>
          <Field label="Predicted Outcomes">
            <textarea className="field-textarea" rows={3} placeholder="What measurable outcomes do you expect in 30/90/180 days?" value={memo.predictedOutcomes} onChange={set('predictedOutcomes')} />
          </Field>
          <Field label="Next Steps">
            <textarea className="field-textarea" rows={3} placeholder="List the 3–5 immediate actions required to move forward, with owners and dates..." value={memo.nextSteps} onChange={set('nextSteps')} />
          </Field>
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <Field label="Contributor Thoughts" hint="Input from stakeholders before final decision">
              <textarea className="field-textarea" rows={3} placeholder="Capture dissenting views, conditions of support, or qualifications from contributors..." value={memo.contributorThoughts} onChange={set('contributorThoughts')} />
            </Field>
            <Field label="Final Decision" hint="Decision Maker's sign-off and any conditions">
              <textarea
                className="field-textarea border-2 border-brand-200 focus:ring-brand-500"
                rows={3}
                placeholder="Decision: [Approved / Deferred / Rejected]\n\nDecision Maker: _________________________  Date: _________\n\nConditions or modifications: ..."
                value={memo.finalDecision}
                onChange={set('finalDecision')}
              />
            </Field>
          </div>
        </Section>
      </div>
    </div>
  )
}
