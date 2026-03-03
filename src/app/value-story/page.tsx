'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  Copy,
  Check,
  Printer,
  Plus,
  Trash2,
  Globe,
  Wrench,
  Rocket,
} from 'lucide-react'
import { generateId, copyToClipboard, cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BulletItem {
  id: string
  text: string
}

interface ValueStoryData {
  // Where we are today
  industryShift1: string
  industryShift2: string
  industryShift3: string
  keyMetric1: string
  keyMetric1Value: string
  keyMetric2: string
  keyMetric2Value: string
  keyMetric3: string
  keyMetric3Value: string
  // Path forward
  failedSolutions: BulletItem[]
  rootCauses: BulletItem[]
  differentiators: BulletItem[]
  // Timeline & next steps
  budget: string
  timeline: string
  outcomesUnlocked: BulletItem[]
  outcomesAvoided: BulletItem[]
  nextSteps: BulletItem[]
}

const defaultStory = (): ValueStoryData => ({
  industryShift1: '',
  industryShift2: '',
  industryShift3: '',
  keyMetric1: '',
  keyMetric1Value: '',
  keyMetric2: '',
  keyMetric2Value: '',
  keyMetric3: '',
  keyMetric3Value: '',
  failedSolutions: [{ id: generateId(), text: '' }],
  rootCauses: [{ id: generateId(), text: '' }],
  differentiators: [{ id: generateId(), text: '' }],
  budget: '',
  timeline: '',
  outcomesUnlocked: [{ id: generateId(), text: '' }],
  outcomesAvoided: [{ id: generateId(), text: '' }],
  nextSteps: [
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
  ],
})

// ─── Bullet list editor ────────────────────────────────────────────────────────

function BulletList({
  items,
  placeholder,
  onChange,
}: {
  items: BulletItem[]
  placeholder: string
  onChange: (items: BulletItem[]) => void
}) {
  const update = (id: string, text: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)))

  const add = () => onChange([...items, { id: generateId(), text: '' }])
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-start gap-2">
          <span className="text-slate-400 text-sm mt-2.5 w-4 text-right flex-shrink-0">{idx + 1}.</span>
          <textarea
            className="field-textarea flex-1 resize-none"
            rows={2}
            placeholder={placeholder}
            value={item.text}
            onChange={(e) => update(item.id, e.target.value)}
          />
          {items.length > 1 && (
            <button onClick={() => remove(item.id)} className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500 mt-1">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}
      <button onClick={add} className="btn-ghost text-xs text-slate-500 pl-6">
        <Plus size={12} /> Add item
      </button>
    </div>
  )
}

// ─── Generate plain text ───────────────────────────────────────────────────────

function generateValueStoryText(s: ValueStoryData): string {
  const line = '─'.repeat(60)
  let text = `VALUE STORY\n${line}\n`
  text += `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}\n\n`

  text += `PART 1: WHERE WE ARE TODAY\n${line}\n\n`
  text += `Industry Shifts:\n`
  if (s.industryShift1) text += `  • ${s.industryShift1}\n`
  if (s.industryShift2) text += `  • ${s.industryShift2}\n`
  if (s.industryShift3) text += `  • ${s.industryShift3}\n`
  text += `\nKey Metrics:\n`
  if (s.keyMetric1) text += `  • ${s.keyMetric1}: ${s.keyMetric1Value}\n`
  if (s.keyMetric2) text += `  • ${s.keyMetric2}: ${s.keyMetric2Value}\n`
  if (s.keyMetric3) text += `  • ${s.keyMetric3}: ${s.keyMetric3Value}\n`

  text += `\nPART 2: THE PATH FORWARD\n${line}\n\n`
  text += `Failed Solutions (why past attempts didn't work):\n`
  s.failedSolutions.forEach((f) => { if (f.text) text += `  • ${f.text}\n` })
  text += `\nRoot Causes:\n`
  s.rootCauses.forEach((r) => { if (r.text) text += `  • ${r.text}\n` })
  text += `\nOur Unique Differentiators:\n`
  s.differentiators.forEach((d) => { if (d.text) text += `  • ${d.text}\n` })

  text += `\nPART 3: TIMELINE AND NEXT STEPS\n${line}\n\n`
  text += `Budget: ${s.budget || '[TBD]'}\n`
  text += `Timeline: ${s.timeline || '[TBD]'}\n`
  text += `\nOutcomes Unlocked:\n`
  s.outcomesUnlocked.forEach((o) => { if (o.text) text += `  ✓ ${o.text}\n` })
  text += `\nOutcomes Avoided:\n`
  s.outcomesAvoided.forEach((o) => { if (o.text) text += `  ✗ ${o.text}\n` })
  text += `\nNext Steps:\n`
  s.nextSteps.forEach((n, i) => { if (n.text) text += `  ${i + 1}. ${n.text}\n` })

  return text
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function StorySection({
  number,
  title,
  subtitle,
  gradient,
  children,
}: {
  number: string
  title: string
  subtitle: string
  gradient: string
  children: React.ReactNode
}) {
  return (
    <div className="section-card overflow-hidden">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
            {number}
          </span>
          <div>
            <h2 className="text-white font-bold text-base">{title}</h2>
            <p className="text-white/70 text-xs">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ValueStoryPage() {
  const [story, setStory] = useState<ValueStoryData>(defaultStory())
  const [copied, setCopied] = useState(false)

  const set = (field: keyof ValueStoryData) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setStory((prev) => ({ ...prev, [field]: e.target.value }))
  )

  const handleCopy = async () => {
    const ok = await copyToClipboard(generateValueStoryText(story))
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const text = generateValueStoryText(story)
    win.document.write(`<html><head><title>Value Story</title>
      <style>body{font-family:sans-serif;font-size:11pt;line-height:1.7;padding:40px;color:#1e293b}
      pre{white-space:pre-wrap;font-family:monospace;font-size:10pt}</style></head>
      <body><pre>${text}</pre></body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <TrendingUp size={18} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Value Story Builder</h1>
            <p className="text-slate-500 text-sm">Craft a compelling narrative: today → path forward → outcomes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs"><Printer size={14} /> PDF</button>
          <button onClick={handleCopy} className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Story'}
          </button>
        </div>
      </div>

      <div className="space-y-5 max-w-4xl">
        {/* Part 1 */}
        <StorySection
          number="1"
          title="Where We Are Today"
          subtitle="Industry shifts and the current reality — establish shared context"
          gradient="from-slate-700 to-slate-800"
        >
          {/* Industry shifts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={15} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">Industry Shifts</h3>
            </div>
            <div className="space-y-2">
              {(['industryShift1', 'industryShift2', 'industryShift3'] as const).map((field, i) => (
                <div key={field} className="flex items-start gap-2">
                  <span className="text-slate-400 text-sm mt-2.5 w-4 text-right flex-shrink-0">{i + 1}.</span>
                  <textarea
                    className="field-textarea flex-1 resize-none"
                    rows={2}
                    placeholder={[
                      'e.g. Buyers now complete 60%+ of their research before talking to a rep — the traditional sales motion is broken...',
                      'e.g. AI has compressed the timeline for competitor feature parity from 18 months to 6 months...',
                      'e.g. CFOs now own the buying decision in 73% of enterprise software purchases over $100K...',
                    ][i]}
                    value={story[field]}
                    onChange={set(field)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">Key Metrics (Their Current State)</h3>
            </div>
            <div className="grid grid-cols-[1fr_200px] gap-2">
              <div className="text-[10px] font-semibold text-slate-500 uppercase px-2">Metric</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase px-2">Current Value / State</div>
              {(['keyMetric1', 'keyMetric2', 'keyMetric3'] as const).map((mField, i) => (
                <React.Fragment key={mField}>
                  <input
                    className="field-input text-sm"
                    placeholder={['Sales rep ramp time', 'Deal win rate', 'CRM data accuracy'][i]}
                    value={story[mField]}
                    onChange={set(mField)}
                  />
                  <input
                    className="field-input text-sm"
                    placeholder={['6–9 months avg', '22%', '61% clean records'][i]}
                    value={story[(`${mField}Value`) as keyof ValueStoryData] as string}
                    onChange={set((`${mField}Value`) as keyof ValueStoryData)}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </StorySection>

        {/* Part 2 */}
        <StorySection
          number="2"
          title="The Path Forward"
          subtitle="Why past approaches failed and what makes your solution uniquely different"
          gradient="from-brand-600 to-brand-700"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={15} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">Failed Solutions (What They've Tried)</h3>
            </div>
            <BulletList
              items={story.failedSolutions}
              placeholder="e.g. They hired more SDRs but conversion rates didn't improve because the problem was pipeline quality, not quantity..."
              onChange={(items) => setStory((prev) => ({ ...prev, failedSolutions: items }))}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-900">Root Causes</h3>
            </div>
            <BulletList
              items={story.rootCauses}
              placeholder="e.g. Reps lack real-time context on why a deal stalled — they're working off static CRM fields, not actual buyer signals..."
              onChange={(items) => setStory((prev) => ({ ...prev, rootCauses: items }))}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Rocket size={15} className="text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-900">Our Unique Differentiators</h3>
            </div>
            <BulletList
              items={story.differentiators}
              placeholder="e.g. We're the only platform that surfaces next-best-action recommendations based on buying signals from the entire buyer committee, not just the primary contact..."
              onChange={(items) => setStory((prev) => ({ ...prev, differentiators: items }))}
            />
          </div>
        </StorySection>

        {/* Part 3 */}
        <StorySection
          number="3"
          title="Timeline and Next Steps"
          subtitle="Investment, timeframe, and outcomes unlocked vs. avoided"
          gradient="from-emerald-600 to-teal-600"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="field-group">
              <label className="field-label">Investment / Budget Range</label>
              <input className="field-input" placeholder="e.g. $80–120K/year depending on seat count" value={story.budget} onChange={set('budget')} />
            </div>
            <div className="field-group">
              <label className="field-label">Implementation Timeline</label>
              <input className="field-input" placeholder="e.g. 6–8 weeks to full deployment, value in week 1" value={story.timeline} onChange={set('timeline')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">+</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Outcomes Unlocked</h3>
              </div>
              <BulletList
                items={story.outcomesUnlocked}
                placeholder="e.g. Reduce rep ramp time by 40%, from 6 months to 3.5 months on average..."
                onChange={(items) => setStory((prev) => ({ ...prev, outcomesUnlocked: items }))}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">−</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Outcomes Avoided</h3>
              </div>
              <BulletList
                items={story.outcomesAvoided}
                placeholder="e.g. Avoid the $1.2M annual cost of continued rep attrition tied to poor onboarding..."
                onChange={(items) => setStory((prev) => ({ ...prev, outcomesAvoided: items }))}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Recommended Next Steps</h3>
            <BulletList
              items={story.nextSteps}
              placeholder="e.g. Schedule a 45-minute technical deep-dive with IT and Sales Ops by [Date]..."
              onChange={(items) => setStory((prev) => ({ ...prev, nextSteps: items }))}
            />
          </div>
        </StorySection>
      </div>
    </div>
  )
}
