'use client'

import { useState, useMemo } from 'react'
import {
  Mail,
  ChevronRight,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Search,
  Tag,
} from 'lucide-react'
import { emailTemplates, templateCategories } from '@/lib/emailTemplates'
import { parseTemplate, extractPlainText, countTemplateVars, copyToClipboard, cn } from '@/lib/utils'
import type { EmailTemplate } from '@/lib/types'

// ─── Variable-aware preview renderer ─────────────────────────────────────────

function EmailPreviewText({
  template,
  values,
}: {
  template: string
  values: Record<string, string>
}) {
  const parts = parseTemplate(template, values)
  return (
    <span className="font-mono text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i} className="whitespace-pre-wrap text-slate-700">{part.content}</span>
        }
        return part.filled ? (
          <span key={i} className="var-filled">{part.content}</span>
        ) : (
          <span key={i} className="var-empty">{part.content}</span>
        )
      })}
    </span>
  )
}

// ─── Template card in the selector ────────────────────────────────────────────

function TemplateCard({
  template,
  active,
  onClick,
}: {
  template: EmailTemplate
  active: boolean
  onClick: () => void
}) {
  const categoryColors: Record<string, string> = {
    'Pre-Call': 'bg-purple-100 text-purple-700',
    'Mid-Funnel': 'bg-blue-100 text-blue-700',
    'Follow-Up': 'bg-teal-100 text-teal-700',
    'Multithreading': 'bg-indigo-100 text-indigo-700',
    'Executive': 'bg-slate-100 text-slate-700',
    'Objection Handling': 'bg-rose-100 text-rose-700',
    'Pricing': 'bg-amber-100 text-amber-700',
    'Post-Sale': 'bg-emerald-100 text-emerald-700',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group',
        active
          ? 'bg-brand-600 text-white'
          : 'hover:bg-slate-100 text-slate-700',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={cn('text-xs font-semibold truncate', active ? 'text-white' : 'text-slate-900')}>
            {template.name}
          </div>
          <div className={cn('text-[10px] mt-0.5 leading-tight line-clamp-2', active ? 'text-brand-200' : 'text-slate-500')}>
            {template.description}
          </div>
        </div>
        <span
          className={cn(
            'text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5',
            active ? 'bg-white/20 text-white' : (categoryColors[template.category] || 'bg-slate-100 text-slate-600'),
          )}
        >
          {template.category}
        </span>
      </div>
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function EmailGeneratorPage() {
  const [selectedId, setSelectedId] = useState<string>(emailTemplates[0].id)
  const [values, setValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const selected = useMemo(
    () => emailTemplates.find((t) => t.id === selectedId) ?? emailTemplates[0],
    [selectedId],
  )

  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const { filled, total } = countTemplateVars(selected.template, values)
  const plainText = extractPlainText(selected.template, values)
  const progress = total > 0 ? (filled / total) * 100 : 0

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setValues({}) // reset form when switching templates
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(plainText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>${selected.name}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12pt; line-height: 1.6; padding: 40px; color: #1e293b; }
        h1 { font-family: sans-serif; font-size: 16pt; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 24px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
      </style></head>
      <body>
        <h1>${selected.name}</h1>
        <pre>${plainText}</pre>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <Mail size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Email Generator</h1>
          <p className="text-slate-500 text-sm">12 mid-funnel frameworks with variable highlighting</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 h-[calc(100vh-160px)]">
        {/* ─── Template Selector (left) ─────────────────────── */}
        <div className="col-span-3 section-card flex flex-col overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1 flex-wrap">
              {['All', ...templateCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full transition-all',
                    activeCategory === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No templates match</div>
            ) : (
              filteredTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  active={t.id === selectedId}
                  onClick={() => handleSelect(t.id)}
                />
              ))
            )}
          </div>

          {/* Count */}
          <div className="px-3 py-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            {filteredTemplates.length} of {emailTemplates.length} templates
          </div>
        </div>

        {/* ─── Form (middle) ────────────────────────────────── */}
        <div className="col-span-4 section-card flex flex-col overflow-hidden">
          <div className="section-header">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{selected.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selected.description}</p>
            </div>
            <button
              onClick={() => setValues({})}
              className="btn-ghost text-xs p-1.5"
              title="Clear all fields"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 py-2 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-medium">
                <Tag size={11} className="inline mr-1" />
                Variables filled
              </span>
              <span className={cn(
                'font-semibold',
                filled === total && total > 0 ? 'text-emerald-600' : 'text-slate-500',
              )}>
                {filled} / {total}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress === 100 ? 'bg-emerald-500' : 'bg-brand-500',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected.fields.map((field) => (
              <div key={field.id} className="field-group">
                <label className="field-label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="field-textarea"
                    rows={field.rows || 3}
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  />
                ) : (
                  <input
                    type="text"
                    className="field-input"
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Preview (right) ──────────────────────────────── */}
        <div className="col-span-5 section-card flex flex-col overflow-hidden">
          <div className="section-header">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Preview</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="inline-block w-3 h-3 rounded var-filled text-[8px]">A</span>
                  Filled variable
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="inline-block w-3 h-3 rounded var-empty text-[8px]">A</span>
                  Empty placeholder
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="btn-secondary text-xs">
                <Printer size={14} />
                PDF
              </button>
              <button
                onClick={handleCopy}
                className={cn('btn-primary text-xs', copied && 'bg-emerald-600 hover:bg-emerald-700')}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Mock email header */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="text-xs text-slate-500 grid grid-cols-[40px_1fr] gap-2">
                  <span className="font-medium">To:</span>
                  <span className="text-slate-700">
                    {values['prospectName'] || values['championName'] || values['execName']
                      ? (values['prospectName'] || values['championName'] || values['execName']) + ' <prospect@company.com>'
                      : '[Recipient]'
                    }
                  </span>
                  <span className="font-medium">From:</span>
                  <span className="text-slate-700">
                    {values['yourName'] ? values['yourName'] + ' <you@company.com>' : '[Your Name] <you@company.com>'}
                  </span>
                  <span className="font-medium">Re:</span>
                  <span className="text-slate-700 font-medium">{selected.name}</span>
                </div>
              </div>
              <div className="p-5 bg-white">
                <EmailPreviewText template={selected.template} values={values} />
              </div>
            </div>

            {/* Guidance note */}
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-brand-700 mb-1 flex items-center gap-1">
                <ChevronRight size={12} />
                About this framework
              </div>
              <p className="text-xs text-brand-600 leading-relaxed">{selected.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
