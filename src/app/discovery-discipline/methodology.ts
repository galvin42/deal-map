// ─── Methodology: Discovery Discipline ──────────────────────────────────────
// Based on the "Continuous Discipline" discovery framework.
// All template functions accept TemplateVars and return filled strings.

export interface TemplateVars {
  company: string
  title: string
  product: string
  painArea: string
  valueHypothesis: string
  isInbound: boolean
}

/** Replace known variable tokens with user-supplied values (or keep placeholder). */
export function fill(template: string, v: TemplateVars): string {
  return template
    .replace(/\[Company\]/g, v.company || '[Company]')
    .replace(/\[Title\]/g, v.title || '[Title]')
    .replace(/\[Product\]/g, v.product || '[Product]')
    .replace(/\[Pain\]/g, v.painArea || '[Pain Area]')
    .replace(/\[Hypothesis\]/g, v.valueHypothesis || '[Your Hypothesis]')
}

// ─── RED FLAGS ───────────────────────────────────────────────────────────────

export interface RedFlagItem {
  id: string
  text: string
  severity: 'high' | 'medium'
}

export const RED_FLAGS: RedFlagItem[] = [
  { id: 'rf1', text: "Buyer can't name their personal success metric", severity: 'high' },
  { id: 'rf2', text: 'No clear timeline or urgency established', severity: 'high' },
  { id: 'rf3', text: 'Budget question deflected or completely avoided', severity: 'high' },
  { id: 'rf4', text: 'No path to Economic Buyer established', severity: 'high' },
  { id: 'rf5', text: 'Competitor mentioned with positive sentiment', severity: 'medium' },
  { id: 'rf6', text: '"Just exploring options" or "no urgency" language used', severity: 'medium' },
  { id: 'rf7', text: 'Pain not quantified in dollars, time, or risk', severity: 'high' },
  { id: 'rf8', text: 'Meeting was rescheduled more than once', severity: 'medium' },
  { id: 'rf9', text: 'Only one stakeholder engaged — no access to others', severity: 'medium' },
  { id: 'rf10', text: 'No confirmed next step agreed on the call', severity: 'high' },
]

// ─── PHASE 1: PRE-CALL RESEARCH ─────────────────────────────────────────────

export interface ChecklistItem {
  id: string
  category: string
  item: string
}

export const getPreCallChecklist = (v: TemplateVars): ChecklistItem[] => [
  {
    id: 'pc1',
    category: 'Company Intel',
    item: fill('Review [Company] LinkedIn — recent posts, leadership changes, announcements', v),
  },
  {
    id: 'pc2',
    category: 'Company Intel',
    item: fill('Google: "[Company] layoffs / hiring / expansion / acquisition"', v),
  },
  {
    id: 'pc3',
    category: 'Company Intel',
    item: fill('Google: "[Company] earnings / press release / analyst report"', v),
  },
  {
    id: 'pc4',
    category: 'Trigger Hunt',
    item: fill(
      'Scan LinkedIn for employees posting about "transformation," "scale," or "[Pain]" language',
      v,
    ),
  },
  {
    id: 'pc5',
    category: 'Trigger Hunt',
    item: fill('Check open job postings at [Company] for roles tied to [Pain]', v),
  },
  {
    id: 'pc6',
    category: 'Trigger Hunt',
    item: 'Look for G2, TrustRadius, or Capterra reviews mentioning the pain area',
  },
  {
    id: 'pc7',
    category: 'Contact Intel',
    item: fill("[Title]'s LinkedIn: recent activity, career history, shared connections", v),
  },
  {
    id: 'pc8',
    category: 'Contact Intel',
    item: fill('Check if [Title] has engaged with competitor or industry content', v),
  },
  {
    id: 'pc9',
    category: 'Your Prep',
    item: 'Identify 2–3 peer reference companies (same industry/size) who solved this pain',
  },
  {
    id: 'pc10',
    category: 'Your Prep',
    item: fill('Write your Value Hypothesis in one sentence: [Hypothesis]', v),
  },
]

export const getIntelEmail = (v: TemplateVars): string =>
  fill(
    `Subject: Quick question before we connect, [First Name]

Hi [First Name],

Looking forward to our call. Before we jump in, I did some research on [Company] and noticed [insert specific trigger — recent hire / press release / job posting / LinkedIn post].

I want to make sure our time is focused on what actually matters to you — not a generic pitch.

Quick question: when it comes to [Pain], what's the metric you're most personally accountable for improving this year?

See you soon,
[Your Name]`,
    v,
  )

export const getSetStageEmail = (v: TemplateVars): string =>
  fill(
    `Subject: Our agenda — [Company] × [Product]

Hi [First Name],

Looking forward to our conversation. Here's what I'm thinking for our time together:

1. Quick overview of the current situation at [Company] — you talk, I listen
2. Where [Pain] is creating the most friction — and what solving it would actually mean
3. If it makes sense, a relevant example or two from [Product]
4. An honest conversation about whether there's a fit worth exploring further

No slide deck. No pitch unless it's earned.

Fair?

[Your Name]`,
    v,
  )

// ─── PHASE 2: THE FIRST 5 MINUTES ───────────────────────────────────────────

export interface TalkTrack {
  id: string
  label: string
  script: string
  tip?: string
  type?: 'teach' | 'ask'
}

export const getRulesOfEngagement = (v: TemplateVars): TalkTrack[] => [
  {
    id: 'roe1',
    label: 'The Transition',
    script: fill(
      `"Before we dive in — is there anything that's changed since we scheduled this? Or anything I should know about what's top of mind before we start?"`,
      v,
    ),
    tip: "Opens the door to real intel. Shows you're adaptive, not scripted. Buyers often share something critical here.",
  },
  {
    id: 'roe2',
    label: 'The Softening Statement',
    script: fill(
      `"I want to be upfront with you — I genuinely don't know enough about your specific situation yet to know if [Product] is even the right fit. That's what I'm here to figure out. I'm not going to pitch you something if it doesn't make sense."`,
      v,
    ),
    tip: "This immediately lowers their defenses. Buyers never expect this. It signals you're different from every other rep they've talked to.",
  },
  {
    id: 'roe3',
    label: 'The Upfront Contract',
    script: fill(
      `"Here's what I'd like to suggest: I'll ask you some questions about what's happening at [Company] — the real stuff, not the polished version. At the end, if what you've shared points to a clear fit, I'll tell you honestly what that would look like. If it doesn't fit, I'll tell you that too. Does that work?"`,
      v,
    ),
    tip: 'Sets mutual expectations before discovery begins. Removes selling pressure. Gets implicit agreement to be honest with each other.',
  },
]

// ─── PHASE 3: THE OPENER ─────────────────────────────────────────────────────

export const getMenuOfPain = (v: TemplateVars): string =>
  fill(
    `"[First Name], I talk with a lot of [Title]s at companies like [Company]. When [Pain] comes up, I usually hear one of three things:

Option A — the biggest frustration is on the process and efficiency side
Option B — it's more of a revenue or growth problem in disguise
Option C — it actually turns out to be a people or alignment issue underneath

Which of those, if any, sounds closest to what you're dealing with?"`,
    v,
  )

export const getInboundOpeners = (v: TemplateVars): string[] => [
  fill(
    `"What made you reach out now — as opposed to three months ago or six months from now?"`,
    v,
  ),
  fill(
    `"Walk me through what's been happening with [Pain] on your end. Start wherever feels natural."`,
    v,
  ),
  fill(
    `"When you first came across [Product] — what were you hoping it would solve for you specifically?"`,
    v,
  ),
  fill(`"What have you already tried to fix this? And what happened?"`, v),
  fill(
    `"If we solve this perfectly in the next 90 days — what does that change for you, specifically?"`,
    v,
  ),
]

// ─── PHASE 4: THE SEE-SAW ────────────────────────────────────────────────────

export const getCheatPhrase = (v: TemplateVars): string =>
  fill(
    `"Here's what I'm seeing with other [Title]s in this space — [share a specific, counterintuitive insight]. Does that match what you're experiencing, or is your situation different?"`,
    v,
  )

export const getMagicWand = (v: TemplateVars): string =>
  fill(
    `"Let me ask you something — if you could wave a magic wand and change one thing about how you're currently handling [Pain], what would it be? And what's stopping that from happening today?"`,
    v,
  )

export const getTeachingTracks = (v: TemplateVars): TalkTrack[] => [
  {
    id: 'teach1',
    type: 'teach',
    label: 'The Market Reframe',
    script: fill(
      `"Most [Title]s I talk to are focused on [common approach]. What we're actually seeing, though, is that the companies outperforming their peers are doing something different — they're [reframe]. It's counterintuitive, but the data backs it up."`,
      v,
    ),
    tip: "Lead with an insight they haven't heard before. This earns you the right to ask deeper questions without it feeling like an interrogation.",
  },
  {
    id: 'teach2',
    type: 'teach',
    label: 'The Inconvenient Truth',
    script: fill(
      `"I'm going to share something that most vendors won't tell you — [uncomfortable truth about their current situation or approach]. I'd rather you hear it from me now than figure it out later."`,
      v,
    ),
    tip: 'Counterintuitive and memorable. Creates trust through honesty rather than flattery. Use sparingly — max once per call.',
  },
  {
    id: 'ask1',
    type: 'ask',
    label: 'The Scale Question',
    script: fill(
      `"On a scale of 1–10, how big of a priority is fixing [Pain] for you right now? ... And what would it take to make it a 10?"`,
      v,
    ),
    tip: "The follow-up to the number is where the gold is. Don't skip it — the gap between their score and 10 is your entire selling opportunity.",
  },
  {
    id: 'ask2',
    type: 'ask',
    label: 'The History Question',
    script: fill(
      `"How long has this been a problem? And in that time, what's been tried? Why do you think those attempts didn't stick?"`,
      v,
    ),
    tip: 'Uncovers the graveyard of failed solutions — and lets you position your approach as fundamentally different from what they\'ve already tried.',
  },
]

// ─── PHASE 5: QUANTIFYING IMPACT ─────────────────────────────────────────────

export interface ImpactQuestions {
  business: string[]
  costOfInaction: string[]
  personal: string[]
}

export const getImpactQuestions = (v: TemplateVars): ImpactQuestions => ({
  business: [
    fill(
      'What does [Pain] cost the business in real terms — revenue lost, deals slipped, headcount wasted, efficiency burned?',
      v,
    ),
    fill(
      "How does this show up in your team's output or your department's numbers each quarter?",
      v,
    ),
    fill(
      'If [Pain] stays exactly the same for 12 more months, what happens to [Company]\'s key metrics — ARR, retention, margin, or output?',
      v,
    ),
    fill(
      'Who else in the organization feels the downstream effects when [Pain] goes unsolved?',
      v,
    ),
  ],
  costOfInaction: [
    fill("What's the cost of doing nothing here? Have you put a real number on it?", v),
    fill(
      'If a competitor solves this before [Company] does — what\'s the business impact of that gap?',
      v,
    ),
    fill(
      'Is there a compliance risk, contractual penalty, or regulatory issue if this stays broken?',
      v,
    ),
    fill(
      'What does another 90 days of this cost you — in dollars, time, morale, or talent retention?',
      v,
    ),
  ],
  personal: [
    fill(
      "How does [Pain] show up in your own day-to-day — what's the thing that frustrates you most about it personally?",
      v,
    ),
    fill(
      'Politically — is solving this something that gets you visibility or credit internally?',
      v,
    ),
    fill(
      "Is there a version of this where, if it stays broken, it starts affecting your team's performance or your own goals?",
      v,
    ),
    fill('What would it personally mean for you if this was completely solved by end of quarter?', v),
  ],
})

// ─── PHASE 6: SOLUTION MAPPING ───────────────────────────────────────────────

export const getPermissionToPitch = (v: TemplateVars): string =>
  fill(
    `"Based on everything you've shared — the [Pain] challenge, the impact it's having on [Company], and what solving it would actually mean — I think I have enough context to show you something specific and relevant. Would it be alright if I took two minutes to walk you through how [Product] handles exactly this?"`,
    v,
  )

export const getTailoredPitch = (v: TemplateVars): string =>
  fill(
    `"What you described — [Pain] — is the exact problem [Product] was built to solve.

Here's how we approach it differently: [Hypothesis].

For a [Title] at a company like [Company], what that typically means in practice is:

→ [Outcome 1 — tied to their stated pain and language]
→ [Outcome 2 — tied to their stated impact]
→ [Outcome 3 — tied to their personal stake]

The customers who see results fastest are those who [describe your ideal fit profile]. Based on what you've shared, I'd put [Company] squarely in that category."`,
    v,
  )

// ─── PHASE 7: THE CLOSE ──────────────────────────────────────────────────────

export const getCommitteeQuestions = (v: TemplateVars): string[] => [
  fill('Beyond you, who else needs to be part of a decision like this at [Company]?', v),
  fill(
    "Who controls the budget for something like this — is that you, or does it need to go somewhere else for approval?",
    v,
  ),
  fill('Is there anyone who would need to sign off before you could actually move forward?', v),
  fill(
    "Who on your team would use this day-to-day? Have they seen anything like this before?",
    v,
  ),
  fill(
    'Is there anyone who might push back on making a change — even if you wanted to move forward?',
    v,
  ),
  fill('How have decisions like this been made in the past at [Company]?', v),
  fill('Who else should we be including in the next conversation to keep momentum?', v),
]

export const STAKEHOLDER_ROLES = [
  'Economic Buyer',
  'Champion',
  'Influencer / Coach',
  'End User',
  'Technical Evaluator',
  'Blocker',
  'Legal / Procurement',
  'Executive Sponsor',
  'Unknown',
] as const

export type StakeholderRole = (typeof STAKEHOLDER_ROLES)[number]
