'use client'

import { useState } from 'react'
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TreeNode, TreeOption } from '@/lib/types'

// ─── Tree definition ───────────────────────────────────────────────────────────

const TREE: Record<string, TreeNode> = {
  q1: {
    id: 'q1',
    question: 'Are you introducing new information into the conversation?',
    description: 'New data, an insight, a resource, a relevant update — something they don\'t already know.',
    options: [
      { label: 'Yes — I have something new to share', nextNode: 'q2' },
      { label: 'No — I don\'t have new information', nextNode: 'q6' },
    ],
  },
  q2: {
    id: 'q2',
    question: 'Will the prospect get better at their job as a result of reading it?',
    description: 'Set aside what you want. Ask: does this email genuinely help them — regardless of whether they buy from you?',
    options: [
      { label: 'Yes — it\'s genuinely useful to them', nextNode: 'q3' },
      {
        label: 'No — it\'s mostly useful to me',
        outcome: 'needs-work',
        outcomeNote:
          'The email centers your needs, not theirs. Reframe it around a real insight or tool that helps them do their job today. If you can\'t, wait.',
      },
    ],
  },
  q3: {
    id: 'q3',
    question: 'Would it be weird for another prospect to read this email?',
    description: 'Is this content so specific to this deal or person that it would feel strange to share with someone else?',
    options: [
      {
        label: 'No — it\'s broadly applicable or a shareable resource',
        description: 'Think: frameworks, articles, research, industry data',
        nextNode: 'q4',
      },
      {
        label: 'Yes — it\'s very specific to this deal or person',
        description: 'Think: highly personalized recap, custom business case, internal reference',
        nextNode: 'q4',
      },
    ],
  },
  q4: {
    id: 'q4',
    question: 'Is your sales cycle under 30 days?',
    description: 'Short-cycle deals move faster and have higher contact frequency expectations. Longer cycles require more discipline.',
    options: [
      {
        label: 'Yes — short cycle (under 30 days)',
        outcome: 'send',
        outcomeNote:
          'You\'re introducing something valuable in a fast-moving context. Send it — and make your ask clear and specific.',
      },
      {
        label: 'No — longer cycle (30+ days)',
        nextNode: 'q5',
      },
    ],
  },
  q5: {
    id: 'q5',
    question: 'Are you asking for a specific conversation or next step?',
    description: 'A follow-up without a clear ask is noise. Even a great resource email should have a thread back to the deal.',
    options: [
      {
        label: 'Yes — there\'s a clear, specific ask',
        outcome: 'send',
        outcomeNote:
          'You have new value AND a clear next step. That\'s a world-class follow-up. Send it.',
      },
      {
        label: 'No — it\'s just sharing something with no specific ask',
        outcome: 'needs-work',
        outcomeNote:
          'Add a light but specific ask before sending. Even "Would this be useful to bring to your team?" creates a thread. Don\'t send value in a vacuum.',
      },
    ],
  },
  q6: {
    id: 'q6',
    question: 'Did they specifically ask you for a reminder or check-in?',
    description: 'Sometimes the honest answer is: they asked you to follow up on a specific date or topic.',
    options: [
      {
        label: 'Yes — they asked me to follow up',
        outcome: 'send',
        outcomeNote:
          'They asked for this. Honor the commitment. Keep it brief, reference what they asked for, and make the next step easy.',
      },
      {
        label: 'No — I just want to know what\'s happening',
        outcome: 'needs-work',
        outcomeNote:
          '"Just checking in" emails tell the prospect you\'re running out of reasons to reach out. Go back to your notes, find something genuinely useful to share, and come back with that.',
      },
    ],
  },
}

const BREADCRUMB_LABELS: Record<string, string> = {
  q1: 'New info?',
  q2: 'Value to them?',
  q3: 'Shareable?',
  q4: 'Short cycle?',
  q5: 'Clear ask?',
  q6: 'They asked?',
}

// ─── Outcome screen ────────────────────────────────────────────────────────────

function OutcomeScreen({
  outcome,
  note,
  onReset,
  history,
}: {
  outcome: 'send' | 'needs-work'
  note: string
  onReset: () => void
  history: { node: TreeNode; choice: TreeOption }[]
}) {
  const isSend = outcome === 'send'

  return (
    <div className="animate-slide-up">
      <div
        className={cn(
          'rounded-2xl p-10 text-center border-2',
          isSend
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200',
        )}
      >
        <div className="flex justify-center mb-6">
          {isSend ? (
            <CheckCircle2 size={64} className="text-emerald-500" />
          ) : (
            <XCircle size={64} className="text-amber-500" />
          )}
        </div>

        <div
          className={cn(
            'text-4xl font-black mb-3 tracking-tight',
            isSend ? 'text-emerald-700' : 'text-amber-700',
          )}
        >
          {isSend ? 'SEND IT' : 'NEEDS WORK'}
        </div>

        <p
          className={cn(
            'text-sm leading-relaxed max-w-lg mx-auto mb-6',
            isSend ? 'text-emerald-700' : 'text-amber-700',
          )}
        >
          {note}
        </p>

        {/* Decision path recap */}
        <div className="bg-white/70 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
          <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Your Decision Path</div>
          {history.map(({ node, choice }, i) => (
            <div key={node.id} className="flex items-start gap-2 mb-2 last:mb-0">
              <span className="text-xs text-slate-400 font-mono w-4 flex-shrink-0 mt-0.5">{i + 1}.</span>
              <div className="min-w-0">
                <div className="text-xs text-slate-600 font-medium leading-tight">{node.question}</div>
                <div
                  className={cn(
                    'text-xs mt-0.5 font-semibold',
                    isSend ? 'text-emerald-600' : 'text-amber-600',
                  )}
                >
                  → {choice.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onReset} className="btn-secondary mx-auto">
          <RotateCcw size={14} /> Start Over
        </button>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FollowUpTreePage() {
  const [currentNodeId, setCurrentNodeId] = useState<string>('q1')
  const [history, setHistory] = useState<{ node: TreeNode; choice: TreeOption }[]>([])
  const [outcome, setOutcome] = useState<{ type: 'send' | 'needs-work'; note: string } | null>(null)

  const currentNode = TREE[currentNodeId]

  const handleChoice = (option: TreeOption) => {
    setHistory((prev) => [...prev, { node: currentNode, choice: option }])

    if (option.outcome) {
      setOutcome({ type: option.outcome, note: option.outcomeNote || '' })
    } else if (option.nextNode) {
      setCurrentNodeId(option.nextNode)
    }
  }

  const handleBack = () => {
    if (history.length === 0) return
    setOutcome(null)
    const prev = [...history]
    prev.pop()
    setHistory(prev)
    if (prev.length === 0) {
      setCurrentNodeId('q1')
    } else {
      setCurrentNodeId(prev[prev.length - 1].node.id)
      // Actually go to the next node that the last choice pointed to
      const lastChoice = history[history.length - 2]?.choice
      if (history[history.length - 1]) {
        const lastNode = history[history.length - 1].node
        setCurrentNodeId(lastNode.id)
      }
    }
  }

  const handleReset = () => {
    setCurrentNodeId('q1')
    setHistory([])
    setOutcome(null)
  }

  const stepNumber = history.length + 1
  const totalSteps = 4 // approximate

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
          <GitBranch size={18} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Follow-Up Decision Tree</h1>
          <p className="text-slate-500 text-sm">World-class follow-ups framework — get a definitive verdict</p>
        </div>
      </div>

      {/* Breadcrumb trail */}
      {history.length > 0 && !outcome && (
        <div className="flex items-center gap-1.5 flex-wrap mb-6 text-xs text-slate-400">
          {history.map(({ node, choice }, i) => (
            <span key={node.id} className="flex items-center gap-1.5">
              <span className="font-medium text-slate-500">{BREADCRUMB_LABELS[node.id] || node.id}</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded font-semibold',
                choice.outcome === 'send' ? 'bg-emerald-100 text-emerald-700' :
                choice.outcome === 'needs-work' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600',
              )}>
                {choice.label.length > 20 ? choice.label.slice(0, 20) + '…' : choice.label}
              </span>
              <ChevronRight size={12} />
            </span>
          ))}
        </div>
      )}

      {outcome ? (
        <OutcomeScreen
          outcome={outcome.type}
          note={outcome.note}
          onReset={handleReset}
          history={history}
        />
      ) : (
        <div className="animate-slide-up">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
            <span>Question {stepNumber}</span>
            <div className="flex items-center gap-1">
              {Object.keys(TREE).map((nodeId, i) => (
                <div
                  key={nodeId}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    nodeId === currentNodeId
                      ? 'bg-brand-600 scale-125'
                      : history.some((h) => h.node.id === nodeId)
                      ? 'bg-brand-300'
                      : 'bg-slate-200',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Question card */}
          <div className="section-card overflow-visible">
            {/* Card top bar */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-t-xl px-6 py-4">
              <div className="flex items-start gap-3">
                <HelpCircle size={20} className="text-brand-200 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">
                    {currentNode.question}
                  </h2>
                  {currentNode.description && (
                    <p className="text-brand-200 text-sm mt-2 leading-relaxed">
                      {currentNode.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-5 space-y-3">
              {currentNode.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(option)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-150 group',
                    option.outcome === 'send'
                      ? 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                      : option.outcome === 'needs-work'
                      ? 'border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                      : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all',
                        option.outcome === 'send'
                          ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white'
                          : option.outcome === 'needs-work'
                          ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-brand-600 group-hover:text-white',
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-slate-500 mt-0.5">{option.description}</div>
                      )}
                    </div>
                    <ArrowRight
                      size={16}
                      className={cn(
                        'flex-shrink-0 transition-all mt-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1',
                        option.outcome === 'send' ? 'text-emerald-600' :
                        option.outcome === 'needs-work' ? 'text-amber-600' : 'text-brand-600',
                      )}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Back / Reset */}
          <div className="flex items-center gap-3 mt-4">
            {history.length > 0 && (
              <button onClick={handleReset} className="btn-ghost text-xs">
                <RotateCcw size={13} /> Start over
              </button>
            )}
            {history.length === 0 && (
              <p className="text-xs text-slate-400 italic">
                Answer each question honestly to get an accurate verdict
              </p>
            )}
          </div>
        </div>
      )}

      {/* Framework explanation */}
      <div className="mt-8 bg-slate-100 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          About This Framework
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Based on the <strong className="text-slate-600">Worldclass Follow-Ups</strong> framework.
          The core principle: every follow-up must introduce new value or respond to an explicit request.
          "Checking in" without a reason is noise — and top performers know the difference.
        </p>
      </div>
    </div>
  )
}
