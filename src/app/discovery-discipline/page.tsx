'use client'

import { useState, useRef } from 'react'
import {
  Target,
  Search,
  Clock,
  MessageCircle,
  Zap,
  TrendingDown,
  Compass,
  Users,
  Flag,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Plus,
  Trash2,
  Mail,
} from 'lucide-react'
import { copyToClipboard, cn, generateId } from '@/lib/utils'
import {
  type TemplateVars,
  type TalkTrack,
  type StakeholderRole,
  fill,
  RED_FLAGS,
  getPreCallChecklist,
  getIntelEmail,
  getSetStageEmail,
  getRulesOfEngagement,
  getMenuOfPain,
  getInboundOpeners,
  getCheatPhrase,
  getMagicWand,
  getTeachingTracks,
  getImpactQuestions,
  getPermissionToPitch,
  getTailoredPitch,
  getCommitteeQuestions,
  STAKEHOLDER_ROLES,
} from './methodology'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Stakeholder {
  id: string
  name: string
  role: StakeholderRole
  access: 'Confirmed' | 'Pending' | 'Unknown'
  notes: string
}

// ─── Phase Config ────────────────────────────────────────────────────────────

const PHASES = [
  {
    num: 1,
    label: 'Pre-Call Research',
    shortLabel: 'Pre-Call',
    icon: Search,
    desc: 'Intelligence gathering, trigger hunting, and email prep before you dial',
  },
  {
    num: 2,
    label: 'The First 5 Minutes',
    shortLabel: 'Open',
    icon: Clock,
    desc: 'Rules of Engagement that lower defenses and set the tone',
  },
  {
    num: 3,
    label: 'The Opener',
    shortLabel: 'Opener',
    icon: MessageCircle,
    desc: 'Inbound: dig into motivation. Outbound: run the Menu of Pain.',
  },
  {
    num: 4,
    label: 'The See-Saw',
    shortLabel: 'See-Saw',
    icon: Zap,
    desc: 'Alternate teaching and asking — every insight earns a deeper question',
  },
  {
    num: 5,
    label: 'Quantifying Impact',
    shortLabel: 'Quantify',
    icon: TrendingDown,
    desc: 'Business cost, Cost of Inaction, and Personal impact questions',
  },
  {
    num: 6,
    label: 'Solution Mapping',
    shortLabel: 'Solution',
    icon: Compass,
    desc: 'Earn permission to pitch, then deliver a tailored narrative',
  },
  {
    num: 7,
    label: 'The Close',
    shortLabel: 'Close',
    icon: Users,
    desc: 'Map the committee, log stakeholders, confirm the next step',
  },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DiscoveryDisciplinePage() {
  const [vars, setVars] = useState<TemplateVars>({
    company: '',
    title: '',
    product: '',
    painArea: '',
    valueHypothesis: '',
    isInbound: false,
  })
  const [activePhase, setActivePhase] = useState(0)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [redFlags, setRedFlags] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateVar = <K extends keyof TemplateVars>(key: K, val: TemplateVars[K]) =>
    setVars((prev) => ({ ...prev, [key]: val }))

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopiedId(id)
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000)
    }
  }

  const handleRedFlag = (flagId: string, text: string, checked: boolean) => {
    setRedFlags((prev) => {
      const next = new Set(prev)
      checked ? next.add(flagId) : next.delete(flagId)
      return next
    })
    if (checked) {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast({ show: true, msg: text })
      toastTimer.current = setTimeout(() => setToast({ show: false, msg: '' }), 3500)
    }
  }

  const toggleCheck = (id: string) =>
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const addStakeholder = () =>
    setStakeholders((prev) => [
      ...prev,
      { id: generateId(), name: '', role: 'Unknown', access: 'Unknown', notes: '' },
    ])

  const updateStakeholder = (id: string, field: keyof Omit<Stakeholder, 'id'>, val: string) =>
    setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)))

  const removeStakeholder = (id: string) =>
    setStakeholders((prev) => prev.filter((s) => s.id !== id))

  // ── Reusable UI pieces ─────────────────────────────────────────────────────

  const CopyBtn = ({
    id,
    text,
    size = 'sm',
  }: {
    id: string
    text: string
    size?: 'sm' | 'xs'
  }) => (
    <button
      onClick={() => handleCopy(id, text)}
      className={cn(
        'flex items-center gap-1 font-medium rounded-lg transition-colors flex-shrink-0',
        size === 'sm' ? 'text-xs px-2.5 py-1.5' : 'text-[10px] px-2 py-1',
        copiedId === id
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      )}
    >
      {copiedId === id ? <Check size={10} /> : <Copy size={10} />}
      {copiedId === id ? 'Copied' : 'Copy'}
    </button>
  )

  const ScriptCard = ({
    id,
    label,
    script,
    tip,
    badge,
    badgeColor,
  }: {
    id: string
    label: string
    script: string
    tip?: string
    badge?: string
    badgeColor?: string
  }) => (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-slate-900 truncate">{label}</span>
          {badge && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        <CopyBtn id={id} text={script} />
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-800 leading-relaxed border-l-4 border-indigo-400 pl-4 italic whitespace-pre-line">
          {script}
        </p>
        {tip && (
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
            <span className="font-semibold text-slate-700 not-italic">💡 Rep note: </span>
            {tip}
          </p>
        )}
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 0 — Pre-Call Research
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase0 = () => {
    const checklist = getPreCallChecklist(vars)
    const categories = [...new Set(checklist.map((c) => c.category))]
    const intelEmail = getIntelEmail(vars)
    const stageEmail = getSetStageEmail(vars)

    return (
      <div className="space-y-5">
        {/* Research Checklist */}
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">Research Checklist</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {checkedItems.size} / {checklist.length} complete
            </span>
          </div>
          {categories.map((cat) => (
            <div key={cat}>
              <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {cat}
                </span>
              </div>
              {checklist
                .filter((c) => c.category === cat)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                        checkedItems.has(item.id)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-slate-300',
                      )}
                    >
                      {checkedItems.has(item.id) && <Check size={9} className="text-white" />}
                    </div>
                    <span
                      className={cn(
                        'text-xs leading-relaxed',
                        checkedItems.has(item.id) ? 'line-through text-slate-400' : 'text-slate-700',
                      )}
                    >
                      {item.item}
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* Email Templates */}
        <div className="grid grid-cols-2 gap-5">
          {[
            {
              id: 'intel-email',
              label: 'Intel Email',
              subtitle: 'Send 48 hrs before — gather pre-call intel',
              text: intelEmail,
            },
            {
              id: 'stage-email',
              label: 'Set-the-Stage Email',
              subtitle: 'Send day before — set expectations',
              text: stageEmail,
            },
          ].map((email) => (
            <div key={email.id} className="section-card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-500" />
                    <span className="font-semibold text-sm text-slate-900">{email.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{email.subtitle}</p>
                </div>
                <CopyBtn id={email.id} text={email.text} />
              </div>
              <div className="p-4 bg-slate-900 rounded-b-xl">
                <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {email.text}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 1 — The First 5 Minutes
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase1 = () => {
    const tracks = getRulesOfEngagement(vars)
    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 text-sm text-indigo-800 leading-relaxed">
          <span className="font-bold">The goal of the first 5 minutes:</span> Lower defenses,
          establish mutual trust, and earn permission to go deep. Don&apos;t pitch. Don&apos;t demo.
          Don&apos;t rush. Just set the table.
        </div>
        {tracks.map((track) => (
          <ScriptCard
            key={track.id}
            id={track.id}
            label={track.label}
            script={track.script}
            tip={track.tip}
          />
        ))}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 2 — The Opener
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase2 = () => {
    const openers = getInboundOpeners(vars)
    const menuOfPain = getMenuOfPain(vars)

    return (
      <div className="space-y-4">
        <div
          className={cn(
            'rounded-xl border px-5 py-3.5 flex items-center gap-3',
            vars.isInbound ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200',
          )}
        >
          <div
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0',
              vars.isInbound
                ? 'bg-emerald-200 text-emerald-800'
                : 'bg-amber-200 text-amber-800',
            )}
          >
            {vars.isInbound ? 'INBOUND' : 'OUTBOUND'}
          </div>
          <p className="text-sm text-slate-700">
            {vars.isInbound
              ? "They came to you. Lead with motivation — why now, what triggered it, what they hoped to find. Let them talk."
              : "You reached out. Lead with the Menu of Pain — give them 3 options and let them self-select their problem."}
          </p>
        </div>

        {vars.isInbound ? (
          <div className="section-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <MessageCircle size={15} className="text-emerald-500" />
              <span className="font-semibold text-sm text-slate-900">
                Inbound Openers — Digging Deeper
              </span>
              <span className="text-xs text-slate-400 ml-1">use 2–3, not all 5</span>
            </div>
            <div className="divide-y divide-slate-100">
              {openers.map((opener, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm text-slate-800 leading-relaxed italic">{opener}</p>
                  <CopyBtn id={`inbound-${i}`} text={opener} size="xs" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ScriptCard
            id="menu-of-pain"
            label="Menu of Pain"
            script={menuOfPain}
            tip="Give them exactly 3 options. The one they pick reveals the real pain — then ignore the other two and dig deep on that one."
            badge="OUTBOUND"
            badgeColor="bg-amber-100 text-amber-700"
          />
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 3 — The See-Saw
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase3 = () => {
    const cheatPhrase = getCheatPhrase(vars)
    const magicWand = getMagicWand(vars)
    const allTracks = getTeachingTracks(vars)
    const teachTracks = allTracks.filter((t) => t.type === 'teach')
    const askTracks = allTracks.filter((t) => t.type === 'ask')

    return (
      <div className="space-y-5">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 text-sm text-indigo-800 leading-relaxed">
          <span className="font-bold">The See-Saw principle:</span> Every insight you share earns
          you the right to ask a deeper question. Alternate between teaching and asking — never
          string more than 2 consecutive teaching moves without asking something.
        </div>

        {/* Signature Moves */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Signature Moves
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ScriptCard
              id="cheat-phrase"
              label="⚡ The Cheat Phrase"
              script={cheatPhrase}
              tip="Lead with an insight from similar companies, then flip it to their experience. Earns the right to probe deeper."
              badge="SIGNATURE"
              badgeColor="bg-indigo-100 text-indigo-700"
            />
            <ScriptCard
              id="magic-wand"
              label="🪄 The Magic Wand"
              script={magicWand}
              tip="Removing social constraints gets buyers to say what they actually want. The answer to 'what's stopping it' is your entire sales motion."
              badge="SIGNATURE"
              badgeColor="bg-indigo-100 text-indigo-700"
            />
          </div>
        </div>

        {/* Teaching vs Asking columns */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-sm font-bold text-slate-900">Teaching Moves</span>
              <span className="text-xs text-slate-400">— lead with insight</span>
            </div>
            {teachTracks.map((track) => (
              <ScriptCard
                key={track.id}
                id={track.id}
                label={track.label}
                script={track.script}
                tip={track.tip}
                badge="TEACH"
                badgeColor="bg-indigo-100 text-indigo-700"
              />
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-sm font-bold text-slate-900">Asking Moves</span>
              <span className="text-xs text-slate-400">— deepen the discovery</span>
            </div>
            {askTracks.map((track) => (
              <ScriptCard
                key={track.id}
                id={track.id}
                label={track.label}
                script={track.script}
                tip={track.tip}
                badge="ASK"
                badgeColor="bg-slate-100 text-slate-600"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 4 — Quantifying Impact
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase4 = () => {
    const { business, costOfInaction, personal } = getImpactQuestions(vars)

    const columns = [
      {
        title: '💼 Business Impact',
        questions: business,
        prefix: 'biz',
        headerBg: 'bg-blue-900',
        headerText: 'text-blue-100',
        numBg: 'bg-blue-100 text-blue-700',
      },
      {
        title: '⏱️ Cost of Inaction',
        questions: costOfInaction,
        prefix: 'coi',
        headerBg: 'bg-rose-900',
        headerText: 'text-rose-100',
        numBg: 'bg-rose-100 text-rose-700',
      },
      {
        title: '🎯 Personal Impact',
        questions: personal,
        prefix: 'per',
        headerBg: 'bg-violet-900',
        headerText: 'text-violet-100',
        numBg: 'bg-violet-100 text-violet-700',
      },
    ]

    return (
      <div className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <span className="font-bold">The quantification rule:</span> You need a real number —
          dollars, hours, headcount, or risk. Without it, there&apos;s no business case for the
          buyer to take internally. Get specific here before you move to any solution talk.
        </div>
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.prefix} className="section-card overflow-hidden">
              <div className={cn('px-5 py-3.5', col.headerBg)}>
                <span className={cn('font-bold text-sm', col.headerText)}>{col.title}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {col.questions.map((q, i) => (
                  <div key={i} className="px-4 py-3.5 flex items-start gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5',
                        col.numBg,
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">{q}</p>
                    </div>
                    <CopyBtn id={`${col.prefix}-${i}`} text={q} size="xs" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 5 — Solution Mapping
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase5 = () => {
    const permissionScript = getPermissionToPitch(vars)
    const pitchScript = getTailoredPitch(vars)

    return (
      <div className="space-y-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-sm text-emerald-800 leading-relaxed">
          <span className="font-bold">The rule:</span> Never pitch without permission. The
          &ldquo;Permission to Pitch&rdquo; earns the right to present — and the buyer will
          actually listen once they&apos;ve said yes. Wait for the verbal yes before proceeding.
        </div>
        <ScriptCard
          id="permission-pitch"
          label="Step 1 — Permission to Pitch"
          script={permissionScript}
          tip={`Pause after this. Wait for their "yes." The silence is intentional — don't fill it.`}
          badge="SAY THIS FIRST"
          badgeColor="bg-indigo-100 text-indigo-700"
        />
        <ScriptCard
          id="tailored-pitch"
          label="Step 2 — The Tailored Pitch"
          script={pitchScript}
          tip="Replace the bracketed sections with the exact words the buyer used during discovery. Mirror their language back — don't use your marketing copy."
          badge="PERSONALIZE THIS"
          badgeColor="bg-amber-100 text-amber-700"
        />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 6 — The Close / Committee Mapper
  // ─────────────────────────────────────────────────────────────────────────

  const renderPhase6 = () => {
    const questions = getCommitteeQuestions(vars)

    const accessColors: Record<Stakeholder['access'], string> = {
      Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Pending: 'bg-amber-100 text-amber-700 border-amber-200',
      Unknown: 'bg-slate-100 text-slate-600 border-slate-200',
    }

    return (
      <div className="space-y-5">
        {/* Committee Questions */}
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Users size={15} className="text-slate-500" />
            <span className="font-semibold text-sm text-slate-900">
              Committee Mapping Questions
            </span>
            <span className="text-xs text-slate-400 ml-1">— ask these to build your map</span>
          </div>
          <div className="divide-y divide-slate-100">
            {questions.map((q, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="flex-1 text-sm text-slate-800 leading-relaxed italic">{q}</p>
                <CopyBtn id={`cq-${i}`} text={q} size="xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Committee Mapper */}
        <div className="section-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">Committee Mapper</span>
              <span className="text-xs text-slate-400 ml-1">
                {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''} logged
              </span>
            </div>
            <button
              onClick={addStakeholder}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
            >
              <Plus size={13} />
              Add Stakeholder
            </button>
          </div>

          {stakeholders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No stakeholders logged yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Use the questions above to uncover the buying committee, then log them here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stakeholders.map((s) => (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-3 flex-wrap">
                  <input
                    className="field-input text-xs w-32"
                    placeholder="Name"
                    value={s.name}
                    onChange={(e) => updateStakeholder(s.id, 'name', e.target.value)}
                  />
                  <select
                    className="field-input text-xs w-44"
                    value={s.role}
                    onChange={(e) => updateStakeholder(s.id, 'role', e.target.value)}
                  >
                    {STAKEHOLDER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none',
                      accessColors[s.access],
                    )}
                    value={s.access}
                    onChange={(e) =>
                      updateStakeholder(s.id, 'access', e.target.value as Stakeholder['access'])
                    }
                  >
                    <option value="Confirmed">✓ Confirmed Access</option>
                    <option value="Pending">⏳ Pending Access</option>
                    <option value="Unknown">? Access Unknown</option>
                  </select>
                  <input
                    className="field-input text-xs flex-1 min-w-[140px]"
                    placeholder="Notes — concerns, sentiment, next step..."
                    value={s.notes}
                    onChange={(e) => updateStakeholder(s.id, 'notes', e.target.value)}
                  />
                  <button
                    onClick={() => removeStakeholder(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Phase router ───────────────────────────────────────────────────────
  const phaseRenderers = [
    renderPhase0,
    renderPhase1,
    renderPhase2,
    renderPhase3,
    renderPhase4,
    renderPhase5,
    renderPhase6,
  ]

  const currentPhase = PHASES[activePhase]
  const PhaseIcon = currentPhase.icon

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Target size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Discovery Discipline</h1>
          <p className="text-slate-500 text-sm">
            Phase-by-phase discovery playbook — Continuous Discipline methodology
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* ── Left Panel (sticky) ─────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-6 space-y-4">

            {/* Call Variables */}
            <div className="section-card overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Call Variables
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">Fill in to personalise all talk tracks</p>
              </div>
              <div className="p-4 space-y-3">
                {(
                  [
                    { key: 'company', label: 'Target Company', placeholder: 'e.g. Redwood Healthcare' },
                    { key: 'title', label: 'Target Title', placeholder: 'e.g. VP of Revenue Cycle' },
                    { key: 'product', label: 'Your Product / Service', placeholder: 'e.g. RevCycle AI' },
                    { key: 'painArea', label: 'Pain Area', placeholder: 'e.g. Revenue Cycle Leakage' },
                  ] as const
                ).map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {field.label}
                    </label>
                    <input
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      placeholder={field.placeholder}
                      value={vars[field.key]}
                      onChange={(e) => updateVar(field.key, e.target.value)}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Value Hypothesis
                  </label>
                  <textarea
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="e.g. We help mid-market health systems recover 15–20% of lost revenue..."
                    value={vars.valueHypothesis}
                    onChange={(e) => updateVar('valueHypothesis', e.target.value)}
                  />
                </div>

                {/* Inbound / Outbound toggle */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Call Type
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200">
                    {[
                      { value: false, label: '📤 Outbound' },
                      { value: true, label: '📥 Inbound' },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => updateVar('isInbound', opt.value)}
                        className={cn(
                          'flex-1 text-xs font-semibold py-2 transition-colors',
                          vars.isInbound === opt.value
                            ? opt.value
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                            : 'bg-white text-slate-500 hover:bg-slate-50',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Red Flag Checker */}
            <div className="section-card overflow-hidden">
              <div className="px-4 py-3 bg-rose-950 border-b border-rose-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag size={13} className="text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                    Red Flag Checker
                  </span>
                </div>
                {redFlags.size > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    {redFlags.size}
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {RED_FLAGS.map((flag) => {
                  const checked = redFlags.has(flag.id)
                  return (
                    <button
                      key={flag.id}
                      onClick={() => handleRedFlag(flag.id, flag.text, !checked)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left',
                        checked && 'bg-rose-50',
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                          checked ? 'bg-rose-500 border-rose-500' : 'border-slate-300',
                        )}
                      >
                        {checked && <Check size={9} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-[11px] leading-snug',
                            checked ? 'text-rose-700 font-semibold' : 'text-slate-600',
                          )}
                        >
                          {flag.text}
                        </p>
                        {flag.severity === 'high' && (
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                            High Risk
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Phase tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap">
            {PHASES.map((phase, i) => {
              const Icon = phase.icon
              return (
                <button
                  key={i}
                  onClick={() => setActivePhase(i)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border',
                    activePhase === i
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
                  )}
                >
                  <Icon size={13} />
                  <span>
                    {i + 1}. {phase.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Phase header */}
          <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <PhaseIcon size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">
                Phase {activePhase + 1} of {PHASES.length}
              </div>
              <h2 className="text-base font-bold text-slate-900">{currentPhase.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{currentPhase.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePhase((p) => Math.max(0, p - 1))}
                disabled={activePhase === 0}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActivePhase((p) => Math.min(PHASES.length - 1, p + 1))}
                disabled={activePhase === PHASES.length - 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Phase content */}
          {phaseRenderers[activePhase]()}

          {/* Next Phase CTA */}
          {activePhase < PHASES.length - 1 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActivePhase((p) => p + 1)}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors border border-indigo-200"
              >
                Next: Phase {activePhase + 2} — {PHASES[activePhase + 1].label}
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Red Flag Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-rose-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-rose-700 animate-slide-up max-w-sm">
          <AlertTriangle size={16} className="text-rose-300 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
              Red Flag Detected
            </div>
            <p className="text-sm font-medium leading-snug">{toast.msg}</p>
          </div>
        </div>
      )}
    </div>
  )
}
