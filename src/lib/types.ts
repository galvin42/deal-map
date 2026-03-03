// ─── Email Generator ─────────────────────────────────────────────────────────

export interface EmailField {
  id: string
  label: string
  placeholder: string
  type: 'input' | 'textarea'
  rows?: number
}

export interface EmailTemplate {
  id: string
  name: string
  category: string
  description: string
  fields: EmailField[]
  /** Template string using {fieldId:Field Label} variable syntax */
  template: string
}

// ─── Decision Memo ───────────────────────────────────────────────────────────

export interface MemoOption {
  id: string
  title: string
  details: string
  financial: string
  implementer: string
  time: string
  pros: string
  cons: string
}

export interface MemoData {
  // Stakeholders
  owner: string
  contributors: string
  decisionMaker: string
  // Context
  pastActions: string
  whatChanged: string
  currentProblem: string
  // Business Case
  timeSavings: string
  revenueImpact: string
  nonMonetary: string
  // Use Cases & Integrations
  integrations: string
  coreProblem: string
  techStackFit: string
  // Options
  options: MemoOption[]
  // Recommendation
  recommendation: string
  predictedOutcomes: string
  nextSteps: string
  contributorThoughts: string
  finalDecision: string
}

// ─── Decision Tree ────────────────────────────────────────────────────────────

export interface TreeOption {
  label: string
  description?: string
  nextNode?: string
  outcome?: 'send' | 'needs-work'
  outcomeNote?: string
}

export interface TreeNode {
  id: string
  question: string
  description?: string
  options: TreeOption[]
}

// ─── Deal Stages ─────────────────────────────────────────────────────────────

export interface DealStage {
  id: number
  name: string
  description: string
  exitCriteria: string
  color: string
  bgColor: string
  textColor: string
}

export interface Deal {
  id: string
  name: string
  company: string
  value: string
  stage: number
  exitCriteriaMet: boolean
  notes: string
  createdAt: string
}

// ─── Meeting Prep ─────────────────────────────────────────────────────────────

export interface MeetingAttendee {
  id: string
  name: string
  role: string
  type: 'internal' | 'external'
}

export interface AgendaItem {
  id: string
  time: string
  topic: string
  owner: string
}

export interface ImpactRow {
  id: string
  metric: string
  current: string
  target: string
  delta: string
}

// ─── Pipeline Dashboard ───────────────────────────────────────────────────────

export interface PipelineData {
  ytdClosed: string
  ytdGoal: string
  eoyWorstCase: string
  eoyBaseCase: string
  eoyBestCase: string
  currentQPipeline: string
  currentQTarget: string
  nextQCoverage: string
  priority1: string
  priority2: string
  priority3: string
  blocker1: string
  blocker2: string
  blocker3: string
}
