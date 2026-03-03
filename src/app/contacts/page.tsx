'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users2,
  Plus,
  Search,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Zap,
  Copy,
  ExternalLink,
  ChevronRight,
  UserCircle,
  FileDown,
} from 'lucide-react'
import { generateId, copyToClipboard, cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type ChessboardRole = 'Champion' | 'Influencer' | 'Economic Buyer' | 'Blocker' | 'Unknown'

interface Contact {
  id: string
  name: string
  title: string
  company: string
  linkedInUrl: string
  email: string
  phone: string
  location: string
  summary: string
  recentActivity: string
  chessboardRole: ChessboardRole
  notes: string
  addedAt: string
  updatedAt: string
}

const STORAGE_KEY = 'galvin-ai-hub-contacts'

// ─── Config ──────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<ChessboardRole, { bg: string; text: string; border: string }> = {
  Champion: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Influencer: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  'Economic Buyer': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Blocker: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  Unknown: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
}

const ROLES: ChessboardRole[] = ['Champion', 'Influencer', 'Economic Buyer', 'Blocker', 'Unknown']

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

function avatarColor(name: string): string {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportToCSV(contacts: Contact[]) {
  const headers = [
    'Name', 'Title', 'Company', 'Chessboard Role',
    'Email', 'Phone', 'Location', 'LinkedIn URL',
    'Summary', 'Recent Activity', 'Notes', 'Date Added',
  ]

  const escape = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = contacts.map((c) => [
    c.name, c.title, c.company, c.chessboardRole,
    c.email, c.phone, c.location, c.linkedInUrl,
    c.summary, c.recentActivity, c.notes,
    new Date(c.addedAt).toLocaleDateString('en-US', { dateStyle: 'medium' }),
  ].map(escape).join(','))

  const csv = [headers.map(escape).join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `galvin-ai-contacts-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Empty contact form ───────────────────────────────────────────────────────

function emptyContact(): Omit<Contact, 'id' | 'addedAt' | 'updatedAt'> {
  return {
    name: '', title: '', company: '', linkedInUrl: '', email: '',
    phone: '', location: '', summary: '', recentActivity: '',
    chessboardRole: 'Unknown', notes: '',
  }
}

// ─── Contact Avatar ───────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-bold flex-shrink-0', sizeClass, avatarColor(name || 'U'))}>
      {name ? getInitials(name) : <UserCircle size={size === 'lg' ? 24 : 16} />}
    </div>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ContactModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Contact
  onSave: (data: Omit<Contact, 'id' | 'addedAt' | 'updatedAt'>) => void
  onClose: () => void
}) {
  const isEdit = !!initial
  const [step, setStep] = useState<'parse' | 'form'>(isEdit ? 'form' : 'parse')
  const [linkedInUrl, setLinkedInUrl] = useState(initial?.linkedInUrl ?? '')
  const [profileText, setProfileText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [form, setForm] = useState<Omit<Contact, 'id' | 'addedAt' | 'updatedAt'>>(
    initial
      ? { name: initial.name, title: initial.title, company: initial.company, linkedInUrl: initial.linkedInUrl, email: initial.email, phone: initial.phone, location: initial.location, summary: initial.summary, recentActivity: initial.recentActivity, chessboardRole: initial.chessboardRole, notes: initial.notes }
      : emptyContact()
  )

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleParse = async () => {
    if (!profileText.trim()) { setParseError('Paste the profile text first.'); return }
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/parse-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileText, linkedInUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Parse failed')
      setForm((prev) => ({
        ...prev,
        name: data.name || '',
        title: data.title || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        summary: data.summary || '',
        recentActivity: data.recentActivity || '',
        chessboardRole: (data.chessboardRole as ChessboardRole) || 'Unknown',
        linkedInUrl: linkedInUrl || '',
      }))
      setStep('form')
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Parse failed. Try again.')
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users2 size={16} className="text-cyan-600" />
            <span className="font-semibold text-slate-900">
              {isEdit ? 'Edit Contact' : step === 'parse' ? 'Add Contact from LinkedIn' : 'Review & Save Contact'}
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {step === 'parse' && (
            <>
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3 text-xs text-cyan-800 leading-relaxed">
                <strong>How to get the profile text:</strong> Open the LinkedIn profile in your browser → press <kbd className="bg-white border border-cyan-200 rounded px-1 py-0.5 font-mono">Ctrl+A</kbd> (select all) → <kbd className="bg-white border border-cyan-200 rounded px-1 py-0.5 font-mono">Ctrl+C</kbd> (copy) → paste below.
              </div>
              <div className="field-group">
                <label className="field-label">LinkedIn Profile URL <span className="text-slate-400 font-normal">(optional)</span></label>
                <input className="field-input" placeholder="https://linkedin.com/in/username" value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Paste Profile Text <span className="text-rose-500">*</span></label>
                <textarea className="field-textarea font-mono text-xs" rows={10} placeholder="Paste the full LinkedIn profile text here..." value={profileText} onChange={(e) => setProfileText(e.target.value)} />
              </div>
              {parseError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-4 py-3">{parseError}</div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleParse} disabled={parsing || !profileText.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {parsing ? <><Loader2 size={15} className="animate-spin" /> Parsing with AI...</> : <><Zap size={15} /> Parse with AI</>}
                </button>
                <button onClick={() => setStep('form')} className="btn-secondary text-xs">Enter manually</button>
              </div>
            </>
          )}

          {step === 'form' && (
            <>
              {!isEdit && (
                <button onClick={() => setStep('parse')} className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mb-1">
                  ← Re-parse from LinkedIn
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="field-group col-span-2">
                  <label className="field-label">Full Name <span className="text-rose-500">*</span></label>
                  <input className="field-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Title</label>
                  <input className="field-input" placeholder="VP of Revenue Cycle" value={form.title} onChange={set('title')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Company</label>
                  <input className="field-input" placeholder="Redwood Healthcare" value={form.company} onChange={set('company')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input className="field-input" type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Phone</label>
                  <input className="field-input" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Location</label>
                  <input className="field-input" placeholder="San Francisco, CA" value={form.location} onChange={set('location')} />
                </div>
                <div className="field-group">
                  <label className="field-label">Chessboard Role</label>
                  <select className="field-input" value={form.chessboardRole} onChange={set('chessboardRole')}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field-group col-span-2">
                  <label className="field-label">LinkedIn URL</label>
                  <input className="field-input" placeholder="https://linkedin.com/in/username" value={form.linkedInUrl} onChange={set('linkedInUrl')} />
                </div>
                <div className="field-group col-span-2">
                  <label className="field-label">Summary</label>
                  <textarea className="field-textarea" rows={2} placeholder="Who they are and what they focus on..." value={form.summary} onChange={set('summary')} />
                </div>
                <div className="field-group col-span-2">
                  <label className="field-label">Recent Activity / Posts</label>
                  <textarea className="field-textarea" rows={2} placeholder="What they've been posting or engaging with lately..." value={form.recentActivity} onChange={set('recentActivity')} />
                </div>
                <div className="field-group col-span-2">
                  <label className="field-label">Notes</label>
                  <textarea className="field-textarea" rows={2} placeholder="Context, connection history, things to remember..." value={form.notes} onChange={set('notes')} />
                </div>
              </div>
            </>
          )}
        </div>

        {step === 'form' && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button onClick={() => { if (form.name.trim()) onSave(form) }} disabled={!form.name.trim()} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={15} />
              {isEdit ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Contact Detail Panel ─────────────────────────────────────────────────────

function ContactDetail({
  contact,
  onEdit,
  onDelete,
  onCopy,
}: {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
  onCopy: (text: string) => void
}) {
  const role = ROLE_CONFIG[contact.chessboardRole]
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyField = async (value: string, field: string) => {
    if (!value) return
    await copyToClipboard(value)
    onCopy(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <Avatar name={contact.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{contact.name}</h2>
            <p className="text-sm text-slate-600 mt-0.5">{contact.title}</p>
            {contact.company && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 size={12} className="text-slate-400" />
                <span className="text-sm text-slate-600">{contact.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border', role.bg, role.text, role.border)}>
                {contact.chessboardRole}
              </span>
              {contact.linkedInUrl && (
                <a href={contact.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                  <Linkedin size={12} />
                  LinkedIn
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={onEdit} className="btn-secondary text-xs flex-1 justify-center">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={onDelete} className="btn-ghost text-xs text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="space-y-2">
          {contact.email && (
            <button onClick={() => copyField(contact.email, 'email')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 group text-left">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 flex-1 truncate">{contact.email}</span>
              {copiedField === 'email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          )}
          {contact.phone && (
            <button onClick={() => copyField(contact.phone, 'phone')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 group text-left">
              <Phone size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 flex-1">{contact.phone}</span>
              {copiedField === 'phone' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          )}
          {contact.location && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700">{contact.location}</span>
            </div>
          )}
        </div>

        {contact.summary && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Summary</div>
            <p className="text-sm text-slate-700 leading-relaxed">{contact.summary}</p>
          </div>
        )}
        {contact.recentActivity && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recent Activity</div>
            <p className="text-sm text-slate-600 leading-relaxed italic">"{contact.recentActivity}"</p>
          </div>
        )}
        {contact.notes && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notes</div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}

        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
          Added {new Date(contact.addedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          {contact.updatedAt !== contact.addedAt && ` · Updated ${new Date(contact.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}`}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<ChessboardRole | 'All'>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setContacts(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  }, [contacts, hydrated])

  const saveContact = (data: Omit<Contact, 'id' | 'addedAt' | 'updatedAt'>) => {
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => c.id === editingContact.id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c),
      )
    } else {
      const now = new Date().toISOString()
      const newContact: Contact = { ...data, id: generateId(), addedAt: now, updatedAt: now }
      setContacts((prev) => [newContact, ...prev])
      setSelectedId(newContact.id)
    }
    setShowModal(false)
    setEditingContact(undefined)
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
    setCheckedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    setDeleteConfirmId(null)
  }

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Filtered list (used for select-all scope)
  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    const matchesRole = roleFilter === 'All' || c.chessboardRole === roleFilter
    return matchesSearch && matchesRole
  })

  const allFilteredChecked = filtered.length > 0 && filtered.every((c) => checkedIds.has(c.id))
  const someChecked = checkedIds.size > 0

  const toggleSelectAll = () => {
    if (allFilteredChecked) {
      // Deselect all filtered
      setCheckedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.delete(c.id))
        return next
      })
    } else {
      // Select all filtered
      setCheckedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.add(c.id))
        return next
      })
    }
  }

  const handleExport = () => {
    const toExport = contacts.filter((c) => checkedIds.has(c.id))
    exportToCSV(toExport)
  }

  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null

  if (!hydrated) return null

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Users2 size={18} className="text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
            <p className="text-slate-500 text-sm">
              {contacts.length === 0
                ? 'Your contact database — add from LinkedIn or manually'
                : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {someChecked && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <FileDown size={15} />
              Export {checkedIds.size} to CSV
            </button>
          )}
          <button onClick={() => { setEditingContact(undefined); setShowModal(true) }} className="btn-primary text-sm">
            <Plus size={15} /> Add Contact
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-5 flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
        {/* ── Left: contact list ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              className="field-input pl-9 text-sm"
              placeholder="Search by name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role filter */}
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...ROLES] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  'text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all',
                  roleFilter === r
                    ? r === 'All'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : cn(ROLE_CONFIG[r as ChessboardRole].bg, ROLE_CONFIG[r as ChessboardRole].text, ROLE_CONFIG[r as ChessboardRole].border)
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Select-all row — only shown when there are contacts */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={allFilteredChecked}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-cyan-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 group-hover:text-slate-700 transition-colors">
                  {allFilteredChecked ? 'Deselect all' : `Select all ${filtered.length}`}
                </span>
              </label>
              {someChecked && (
                <button
                  onClick={() => setCheckedIds(new Set())}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Clear {checkedIds.size}
                </button>
              )}
            </div>
          )}

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                {contacts.length === 0 ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto">
                      <Users2 size={22} className="text-cyan-400" />
                    </div>
                    <p className="text-sm text-slate-500">No contacts yet</p>
                    <button onClick={() => { setEditingContact(undefined); setShowModal(true) }} className="btn-primary text-xs mx-auto">
                      <Plus size={13} /> Add your first contact
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No contacts match your search</p>
                )}
              </div>
            ) : (
              filtered.map((contact) => {
                const role = ROLE_CONFIG[contact.chessboardRole]
                const isSelected = selectedId === contact.id
                const isChecked = checkedIds.has(contact.id)
                return (
                  <div
                    key={contact.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-3 rounded-xl border transition-all',
                      isSelected
                        ? 'bg-cyan-50 border-cyan-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm',
                      isChecked && !isSelected && 'bg-emerald-50 border-emerald-200',
                    )}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(contact.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3.5 h-3.5 rounded border-slate-300 accent-cyan-600 cursor-pointer flex-shrink-0"
                    />
                    {/* Card body — clicking opens detail */}
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedId(contact.id)}
                    >
                      <Avatar name={contact.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate leading-tight">{contact.name}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {[contact.title, contact.company].filter(Boolean).join(' · ')}
                        </div>
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block', role.bg, role.text)}>
                          {contact.chessboardRole}
                        </span>
                      </div>
                      {isSelected && <ChevronRight size={13} className="text-cyan-500 flex-shrink-0" />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right: detail panel ── */}
        <div className="flex-1 section-card overflow-hidden">
          {selectedContact ? (
            deleteConfirmId === selectedContact.id ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <Trash2 size={24} className="text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Delete {selectedContact.name}?</p>
                  <p className="text-sm text-slate-500 mt-1">This will remove the contact from your database. This cannot be undone.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">Cancel</button>
                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} /> Delete Contact
                  </button>
                </div>
              </div>
            ) : (
              <ContactDetail
                contact={selectedContact}
                onEdit={() => { setEditingContact(selectedContact); setShowModal(true) }}
                onDelete={() => setDeleteConfirmId(selectedContact.id)}
                onCopy={() => {}}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                <UserCircle size={28} className="text-slate-300" />
              </div>
              <div>
                <p className="font-medium text-slate-500">Select a contact to view details</p>
                <p className="text-sm text-slate-400 mt-1">Or add a new one with the button above</p>
              </div>
              <button onClick={() => { setEditingContact(undefined); setShowModal(true) }} className="btn-primary text-xs mt-2">
                <Plus size={13} /> Add Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ContactModal
          initial={editingContact}
          onSave={saveContact}
          onClose={() => { setShowModal(false); setEditingContact(undefined) }}
        />
      )}
    </div>
  )
}
