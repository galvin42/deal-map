'use client'

import { useState } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Target,
  AlertTriangle,
  Users,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { generateId, copyToClipboard, cn } from '@/lib/utils'
import type { MeetingAttendee, AgendaItem, ImpactRow } from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MeetingBriefData {
  // Objectives
  nextBuyingBehavior: string
  evidenceOfSuccess: string
  desiredEmotion: string
  // Problem
  problemStatement: string
  // Why Now
  executives: string
  strategicGoals: string
  compellingEvents: string
  // Impact
  impactRows: ImpactRow[]
  // Threats
  threats: string
  alternatives: string
  // Attendees
  attendees: MeetingAttendee[]
  // Agenda
  agendaItems: AgendaItem[]
  // Account map URL
  accountMapUrl: string
}

const defaultBrief = (): MeetingBriefData => ({
  nextBuyingBehavior: '',
  evidenceOfSuccess: '',
  desiredEmotion: '',
  problemStatement: '',
  executives: '',
  strategicGoals: '',
  compellingEvents: '',
  impactRows: [
    { id: generateId(), metric: '', current: '', target: '', delta: '' },
    { id: generateId(), metric: '', current: '', target: '', delta: '' },
    { id: generateId(), metric: '', current: '', target: '', delta: '' },
  ],
  threats: '',
  alternatives: '',
  attendees: [
    { id: generateId(), name: '', role: '', type: 'external' },
    { id: generateId(), name: '', role: '', type: 'internal' },
  ],
  agendaItems: [
    { id: generateId(), time: '0:00', topic: 'Introductions & agenda review', owner: 'AE' },
    { id: generateId(), time: '0:05', topic: '', owner: '' },
    { id: generateId(), time: '0:20', topic: '', owner: '' },
    { id: generateId(), time: '0:45', topic: 'Next steps', owner: 'AE' },
  ],
  accountMapUrl: '',
})

// ─── Generate plain text ───────────────────────────────────────────────────────

function generateBriefText(brief: MeetingBriefData): string {
  const line = '─'.repeat(60)
  let text = `KEY ACCOUNT MEETING BRIEF\n${line}\n`
  text += `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}\n\n`

  text += `MEETING OBJECTIVES\n${line}\n`
  text += `Next Best Buying Behavior: ${brief.nextBuyingBehavior || '[Define the specific buying action you want them to take]'}\n`
  text += `Evidence of Success: ${brief.evidenceOfSuccess || '[What will you see/hear if the meeting goes perfectly?]'}\n`
  text += `Desired Emotion: ${brief.desiredEmotion || '[How should the buyer feel leaving this meeting?]'}\n\n`

  text += `CUSTOMER PROBLEM STATEMENT\n${line}\n`
  text += `${brief.problemStatement || '[The core problem — written from the customer\'s perspective]'}\n\n`

  text += `WHY NOW\n${line}\n`
  text += `Executive Context: ${brief.executives || '[Which executives own this problem?]'}\n`
  text += `Strategic Goals: ${brief.strategicGoals || '[How does this connect to company strategy?]'}\n`
  text += `Compelling Events: ${brief.compellingEvents || '[What makes inaction costly now?]'}\n\n`

  text += `CUSTOMER IMPACT METRICS\n${line}\n`
  text += `Metric                    Current       Target        Delta\n`
  text += `${'─'.repeat(65)}\n`
  brief.impactRows.forEach((row) => {
    if (row.metric) {
      text += `${row.metric.padEnd(26)}${(row.current || '-').padEnd(14)}${(row.target || '-').padEnd(14)}${row.delta || '-'}\n`
    }
  })
  text += '\n'

  text += `THREATS & ALTERNATIVES\n${line}\n`
  text += `Threats to the Deal: ${brief.threats || '[Competitive threats, internal politics, budget constraints]'}\n`
  text += `Customer Alternatives: ${brief.alternatives || '[What will they do if they don\'t buy from us?]'}\n\n`

  text += `ATTENDEES\n${line}\n`
  const externals = brief.attendees.filter((a) => a.type === 'external' && a.name)
  const internals = brief.attendees.filter((a) => a.type === 'internal' && a.name)
  if (externals.length > 0) {
    text += `Customer: ${externals.map((a) => `${a.name} (${a.role})`).join(', ')}\n`
  }
  if (internals.length > 0) {
    text += `Internal: ${internals.map((a) => `${a.name} (${a.role})`).join(', ')}\n`
  }
  text += '\n'

  text += `AGENDA\n${line}\n`
  brief.agendaItems.forEach((item) => {
    if (item.topic) {
      text += `${item.time.padEnd(8)}${item.topic.padEnd(40)}${item.owner}\n`
    }
  })

  if (brief.accountMapUrl) {
    text += `\nACCOUNT MAP: ${brief.accountMapUrl}\n`
  }

  return text
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function MeetingPrepPage() {
  const [brief, setBrief] = useState<MeetingBriefData>(defaultBrief())
  const [copied, setCopied] = useState(false)

  const set = (field: keyof MeetingBriefData) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setBrief((prev) => ({ ...prev, [field]: e.target.value }))
  )

  const handleCopy = async () => {
    const ok = await copyToClipboard(generateBriefText(brief))
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const text = generateBriefText(brief)
    win.document.write(`<html><head><title>Meeting Brief</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.6;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${text}</pre></body></html>`)
    win.document.close(); win.print()
  }

  // Impact rows
  const setImpactRow = (id: string, field: keyof ImpactRow) => (
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setBrief((prev) => ({
        ...prev,
        impactRows: prev.impactRows.map((r) =>
          r.id === id ? { ...r, [field]: e.target.value } : r,
        ),
      }))
  )

  const addImpactRow = () =>
    setBrief((prev) => ({
      ...prev,
      impactRows: [...prev.impactRows, { id: generateId(), metric: '', current: '', target: '', delta: '' }],
    }))

  const removeImpactRow = (id: string) =>
    setBrief((prev) => ({ ...prev, impactRows: prev.impactRows.filter((r) => r.id !== id) }))

  // Attendees
  const setAttendee = (id: string, field: keyof MeetingAttendee) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setBrief((prev) => ({
        ...prev,
        attendees: prev.attendees.map((a) =>
          a.id === id ? { ...a, [field]: e.target.value } : a,
        ),
      }))
  )

  const addAttendee = () =>
    setBrief((prev) => ({
      ...prev,
      attendees: [...prev.attendees, { id: generateId(), name: '', role: '', type: 'external' }],
    }))

  const removeAttendee = (id: string) =>
    setBrief((prev) => ({ ...prev, attendees: prev.attendees.filter((a) => a.id !== id) }))

  // Agenda
  const setAgendaItem = (id: string, field: keyof AgendaItem) => (
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setBrief((prev) => ({
        ...prev,
        agendaItems: prev.agendaItems.map((item) =>
          item.id === id ? { ...item, [field]: e.target.value } : item,
        ),
      }))
  )

  const addAgendaItem = () =>
    setBrief((prev) => ({
      ...prev,
      agendaItems: [
        ...prev.agendaItems.slice(0, -1),
        { id: generateId(), time: '', topic: '', owner: '' },
        prev.agendaItems[prev.agendaItems.length - 1],
      ],
    }))

  const removeAgendaItem = (id: string) =>
    setBrief((prev) => ({ ...prev, agendaItems: prev.agendaItems.filter((a) => a.id !== id) }))

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
            <Briefcase size={18} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Key Account Meeting Brief</h1>
            <p className="text-slate-500 text-sm">Prepare a comprehensive brief for any strategic conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs"><Printer size={14} /> PDF</button>
          <button onClick={handleCopy} className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Brief'}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-4xl">
        {/* Account Map URL */}
        <div className="section-card">
          <div className="p-4 flex items-center gap-3">
            <ExternalLink size={16} className="text-slate-400 flex-shrink-0" />
            <div className="flex-1 field-group">
              <label className="field-label">Enterprise Account Map URL (optional — e.g., Miro board)</label>
              <input
                className="field-input"
                placeholder="https://miro.com/app/board/..."
                value={brief.accountMapUrl}
                onChange={set('accountMapUrl')}
              />
            </div>
            {brief.accountMapUrl && (
              <a href={brief.accountMapUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                Open <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Meeting Objectives */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-brand-100 flex items-center justify-center">
                <Target size={15} className="text-brand-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Meeting Objectives</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="field-group">
              <label className="field-label">Next Best Buying Behavior</label>
              <p className="text-xs text-slate-400">What specific action do you need them to take by end of meeting?</p>
              <input className="field-input" placeholder="e.g. Agree to schedule a technical deep-dive with their IT team and define POC success criteria" value={brief.nextBuyingBehavior} onChange={set('nextBuyingBehavior')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field-group">
                <label className="field-label">Evidence of Success</label>
                <textarea className="field-textarea" rows={2} placeholder="What will you see / hear if the meeting goes perfectly?" value={brief.evidenceOfSuccess} onChange={set('evidenceOfSuccess')} />
              </div>
              <div className="field-group">
                <label className="field-label">Desired Emotion</label>
                <textarea className="field-textarea" rows={2} placeholder="How should the buyer feel when they leave this meeting?" value={brief.desiredEmotion} onChange={set('desiredEmotion')} />
              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Customer Problem Statement</h2>
            </div>
          </div>
          <div className="p-5">
            <textarea
              className="field-textarea"
              rows={4}
              placeholder="Write the problem from the customer's perspective. Be specific — include the stakeholders who feel this pain, the business impact, and the root cause if known..."
              value={brief.problemStatement}
              onChange={set('problemStatement')}
            />
          </div>
        </div>

        {/* Why Now */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center">
                <Calendar size={15} className="text-rose-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Why Now?</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="field-group">
                <label className="field-label">Executives</label>
                <textarea className="field-textarea" rows={3} placeholder="Which executives own this problem? What's their pressure?" value={brief.executives} onChange={set('executives')} />
              </div>
              <div className="field-group">
                <label className="field-label">Strategic Goals</label>
                <textarea className="field-textarea" rows={3} placeholder="How does this tie to company-wide initiatives or OKRs?" value={brief.strategicGoals} onChange={set('strategicGoals')} />
              </div>
              <div className="field-group">
                <label className="field-label">Compelling Events</label>
                <textarea className="field-textarea" rows={3} placeholder="Contract renewal, board deadline, competitive threat, org change..." value={brief.compellingEvents} onChange={set('compellingEvents')} />
              </div>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                <TrendingUp size={15} className="text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Customer Impact Metrics</h2>
            </div>
          </div>
          <div className="p-5">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px_120px_40px] gap-2 mb-2 px-2">
              {['Metric', 'Current State', 'Target State', 'Delta / Improvement', ''].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            <div className="space-y-2">
              {brief.impactRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_120px_120px_120px_40px] gap-2 items-center">
                  <input className="field-input text-xs" placeholder="e.g. Sales rep ramp time" value={row.metric} onChange={setImpactRow(row.id, 'metric')} />
                  <input className="field-input text-xs" placeholder="e.g. 6 months" value={row.current} onChange={setImpactRow(row.id, 'current')} />
                  <input className="field-input text-xs" placeholder="e.g. 3 months" value={row.target} onChange={setImpactRow(row.id, 'target')} />
                  <input className="field-input text-xs" placeholder="e.g. -50%" value={row.delta} onChange={setImpactRow(row.id, 'delta')} />
                  <button onClick={() => removeImpactRow(row.id)} className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addImpactRow} className="btn-secondary text-xs mt-3">
              <Plus size={13} /> Add Row
            </button>
          </div>
        </div>

        {/* Threats & Alternatives */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-rose-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Threats & Alternatives</h2>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="field-group">
              <label className="field-label">Threats to the Deal</label>
              <textarea className="field-textarea" rows={3} placeholder="Competitive threats, budget cuts, internal champion leaving, deal stall, procurement..." value={brief.threats} onChange={set('threats')} />
            </div>
            <div className="field-group">
              <label className="field-label">Customer Alternatives</label>
              <textarea className="field-textarea" rows={3} placeholder="Build in-house, stick with current vendor, buy from competitor X, delay / do nothing..." value={brief.alternatives} onChange={set('alternatives')} />
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                <Users size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Meeting Attendees</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 mb-2 px-2">
              {['Type', 'Name', 'Title / Role', 'Context / Goal', ''].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            <div className="space-y-2">
              {brief.attendees.map((att) => (
                <div key={att.id} className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center">
                  <select
                    className="field-input text-xs px-1"
                    value={att.type}
                    onChange={(e) => setBrief((prev) => ({
                      ...prev,
                      attendees: prev.attendees.map((a) =>
                        a.id === att.id ? { ...a, type: e.target.value as 'internal' | 'external' } : a,
                      ),
                    }))}
                  >
                    <option value="external">Ext</option>
                    <option value="internal">Int</option>
                  </select>
                  <input className="field-input text-xs" placeholder="Full name" value={att.name} onChange={setAttendee(att.id, 'name')} />
                  <input className="field-input text-xs" placeholder="e.g. VP of Sales" value={att.role} onChange={setAttendee(att.id, 'role')} />
                  <input className="field-input text-xs" placeholder="What they care about / their agenda" value={''} onChange={() => {}} />
                  <button onClick={() => removeAttendee(att.id)} className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addAttendee} className="btn-secondary text-xs mt-3">
              <Plus size={13} /> Add Attendee
            </button>
          </div>
        </div>

        {/* Agenda */}
        <div className="section-card">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-brand-100 flex items-center justify-center">
                <Calendar size={15} className="text-brand-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Meeting Agenda</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-[80px_1fr_120px_40px] gap-2 mb-2 px-2">
              {['Time', 'Topic', 'Owner', ''].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            <div className="space-y-2">
              {brief.agendaItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[80px_1fr_120px_40px] gap-2 items-center">
                  <input className="field-input text-xs font-mono" placeholder="0:00" value={item.time} onChange={setAgendaItem(item.id, 'time')} />
                  <input className="field-input text-xs" placeholder="Agenda item" value={item.topic} onChange={setAgendaItem(item.id, 'topic')} />
                  <input className="field-input text-xs" placeholder="e.g. AE / Customer" value={item.owner} onChange={setAgendaItem(item.id, 'owner')} />
                  <button onClick={() => removeAgendaItem(item.id)} className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addAgendaItem} className="btn-secondary text-xs mt-3">
              <Plus size={13} /> Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
