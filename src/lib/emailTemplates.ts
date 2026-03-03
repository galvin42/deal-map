import type { EmailTemplate } from './types'

export const emailTemplates: EmailTemplate[] = [
  // ─── 1. The Discovery Preview ─────────────────────────────────────────────
  {
    id: 'discovery-preview',
    name: 'The Discovery Preview',
    category: 'Pre-Call',
    description: 'Rebuilds interest before a discovery call by sharing a non-obvious insight about their space.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'company', label: 'Their Company', placeholder: 'e.g. Acme Corp', type: 'input' },
      { id: 'callDateTime', label: 'Call Date & Time', placeholder: 'e.g. Thursday at 2:00 PM ET', type: 'input' },
      { id: 'insight', label: 'Non-Obvious Insight', placeholder: 'A surprising stat, trend, or observation relevant to their business that most people in their space aren\'t talking about yet...', type: 'textarea', rows: 4 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
      { id: 'yourTitle', label: 'Your Title', placeholder: 'e.g. Senior Account Executive', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

Before our call on {callDateTime:Call Date & Time}, I wanted to share something I've been seeing across companies like {company:Their Company} that rarely gets discussed.

{insight:Non-Obvious Insight}

This is something I'd love to explore with you — specifically how it connects to what you're working toward.

Looking forward to our conversation,
{yourName:Your Name}
{yourTitle:Your Title}`,
  },

  // ─── 2. Post Discovery & Pre-Demo ─────────────────────────────────────────
  {
    id: 'post-discovery-pre-demo',
    name: 'Post Discovery & Pre-Demo',
    category: 'Mid-Funnel',
    description: 'Plays back key discovery points to ensure the buyer feels heard before the demo.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'demoDateTime', label: 'Demo Date & Time', placeholder: 'e.g. Friday at 3:00 PM ET', type: 'input' },
      { id: 'problemStatement', label: 'Problem Statement', placeholder: 'Summarize the core problem exactly as you heard it from the prospect...', type: 'textarea', rows: 3 },
      { id: 'logicalApproach', label: 'Logical Approach', placeholder: 'Describe your recommended approach to solving their problem...', type: 'textarea', rows: 3 },
      { id: 'requirements', label: 'Their Requirements', placeholder: 'List the key requirements the prospect mentioned during discovery...', type: 'textarea', rows: 3 },
      { id: 'nextSteps', label: 'Agreed Next Steps', placeholder: 'Outline the specific next steps agreed upon after the demo...', type: 'textarea', rows: 2 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

Wanted to capture our conversation before we go into the demo on {demoDateTime:Demo Date & Time}.

The problem as I understand it:
{problemStatement:Problem Statement}

Our logical approach:
{logicalApproach:Logical Approach}

Your requirements:
{requirements:Their Requirements}

Next steps after the demo:
{nextSteps:Agreed Next Steps}

Please correct anything I've gotten wrong — I want to make sure we're fully aligned before we dive in.

{yourName:Your Name}`,
  },

  // ─── 3. Post-Demo Follow-Up ────────────────────────────────────────────────
  {
    id: 'post-demo-follow-up',
    name: 'Post-Demo Follow-Up',
    category: 'Mid-Funnel',
    description: 'Contrasts current vs. future state, recaps the approach, builds dramatic tension, and drives a CTA.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'currentProcess', label: 'Current Process (Today)', placeholder: 'Describe what their workflow / process looks like today...', type: 'textarea', rows: 3 },
      { id: 'futureProcess', label: 'Future Process (After Implementation)', placeholder: 'Describe what their workflow / process will look like after your solution...', type: 'textarea', rows: 3 },
      { id: 'logicalApproach', label: 'Logical Approach Recap', placeholder: 'Brief recap of the approach you showed in the demo...', type: 'textarea', rows: 3 },
      { id: 'cta', label: 'Call to Action', placeholder: 'e.g. "Can we schedule 30 minutes this week to align on next steps?"', type: 'textarea', rows: 2 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

Today:
{currentProcess:Current Process}

After implementation:
{futureProcess:Future Process}

Here's the logical approach we walked through:
{logicalApproach:Logical Approach Recap}

The gap between where you are and where you want to be is real — and the window to act is narrowing.

{cta:Call to Action}

{yourName:Your Name}`,
  },

  // ─── 4. The "Forwardable" Follow-Up ───────────────────────────────────────
  {
    id: 'forwardable-follow-up',
    name: 'The "Forwardable" Follow-Up',
    category: 'Multithreading',
    description: 'Designed to be forwarded through a champion to a new contact — opens with a company-wide initiative and visual language.',
    fields: [
      { id: 'championName', label: "Champion's First Name", placeholder: 'e.g. Mark', type: 'input' },
      { id: 'keyContact', label: 'Key Contact to Reach', placeholder: 'e.g. Lisa Chen (VP of Marketing)', type: 'input' },
      { id: 'company', label: 'Their Company', placeholder: 'e.g. Acme Corp', type: 'input' },
      { id: 'companyInitiative', label: 'Company-Wide Initiative', placeholder: 'e.g. expanding into mid-market accounts and restructuring the revenue org', type: 'textarea', rows: 2 },
      { id: 'triggerPhrase', label: 'Trigger Phrase', placeholder: 'e.g. "pipeline quality is the #1 lever for hitting Q4 number"', type: 'textarea', rows: 2 },
      { id: 'visualLanguage', label: 'Visual Language / Metaphor', placeholder: 'A concrete visual or story that makes the message memorable — e.g. "Think of it like a GPS that recalculates in real time..."', type: 'textarea', rows: 3 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {championName:Champion's Name},

Would you be able to forward this to {keyContact:Key Contact}?

—

Hi {keyContact:Key Contact},

{company:Company} is {companyInitiative:Company-Wide Initiative} — and one thing I keep hearing is {triggerPhrase:Trigger Phrase}.

{visualLanguage:Visual Language / Metaphor}

Would love to connect for 15 minutes to share what we're seeing across similar teams.

{yourName:Your Name}`,
  },

  // ─── 5. The "Idea" Follow-Up ──────────────────────────────────────────────
  {
    id: 'idea-follow-up',
    name: 'The "Idea" Follow-Up',
    category: 'Follow-Up',
    description: 'Helps buyers get their job done today by sharing a tool or idea tied to something you discussed.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'pastTopic', label: 'Topic from Past Conversation', placeholder: 'e.g. scaling your SDR team without adding headcount', type: 'input' },
      { id: 'ideaOrTool', label: 'The Tool / Idea to Share', placeholder: 'e.g. A 1-page framework we use to help reps prioritize accounts by propensity score — attached here...', type: 'textarea', rows: 4 },
      { id: 'howItHelps', label: 'How It Helps Them Today', placeholder: 'e.g. cut your ramp time for new reps by 30%', type: 'textarea', rows: 2 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

When we talked about {pastTopic:Past Topic}, it reminded me of something.

{ideaOrTool:The Tool / Idea}

This might help you {howItHelps:How It Helps} today — regardless of where we end up together.

No agenda here. Just wanted to pass it along.

{yourName:Your Name}`,
  },

  // ─── 6. The "No-Reply-Required" Follow-Up ────────────────────────────────
  {
    id: 'no-reply-required',
    name: 'The "No-Reply-Required" Follow-Up',
    category: 'Executive',
    description: 'A concise update for executive sponsors — keeps them informed without requiring a response.',
    fields: [
      { id: 'execName', label: "Executive's First Name", placeholder: 'e.g. David', type: 'input' },
      { id: 'dealUpdate', label: 'Deal Progress Update', placeholder: 'e.g. We completed our technical review with the IT team last week. Security sign-off is in progress and we\'re on track for the April kickoff target.', type: 'textarea', rows: 3 },
      { id: 'nextMilestone', label: 'Next Milestone', placeholder: 'e.g. Legal review scheduled for March 15th', type: 'input' },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {execName:Executive Name},

Just a quick update — no reply needed.

{dealUpdate:Deal Progress Update}

Next milestone: {nextMilestone:Next Milestone}

I'll keep you posted as things progress.

{yourName:Your Name}`,
  },

  // ─── 7. The "Consensus" Follow-Up ────────────────────────────────────────
  {
    id: 'consensus-follow-up',
    name: 'The "Consensus" Follow-Up',
    category: 'Multithreading',
    description: 'Ties together goals from multiple buying committee members around a shared deadline.',
    fields: [
      { id: 'prospectName', label: 'Primary Contact First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'contact1Name', label: 'Contact 1 Name', placeholder: 'e.g. James (Head of Sales)', type: 'input' },
      { id: 'contact1Goal', label: "Contact 1's Goal", placeholder: 'e.g. increasing pipeline coverage by 3x in Q2', type: 'textarea', rows: 2 },
      { id: 'contact2Name', label: 'Contact 2 Name', placeholder: 'e.g. Maria (Head of Marketing)', type: 'input' },
      { id: 'contact2Goal', label: "Contact 2's Goal", placeholder: 'e.g. improving MQL-to-SQL conversion rates before the summer campaign', type: 'textarea', rows: 2 },
      { id: 'sharedDeadline', label: 'Shared Deadline / Event', placeholder: 'e.g. Q3 kickoff on July 1st', type: 'input' },
      { id: 'productConnection', label: 'How Your Product Connects Both Goals', placeholder: 'e.g. Our platform surfaces the same buyer intent data to both reps and marketers — James\'s team prioritizes outreach while Maria\'s team personalizes campaigns automatically.', type: 'textarea', rows: 4 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Primary Contact},

Over the past few weeks I've been talking to {contact1Name:Contact 1} about {contact1Goal:Contact 1's Goal} and {contact2Name:Contact 2} about {contact2Goal:Contact 2's Goal}.

What I find interesting is that both goals converge at {sharedDeadline:Shared Deadline}.

Here's why that matters: {productConnection:How Your Product Connects Both Goals}

Would a brief call with all of us make sense before that deadline?

{yourName:Your Name}`,
  },

  // ─── 8. The "Account Team" Follow-Up ─────────────────────────────────────
  {
    id: 'account-team-follow-up',
    name: 'The "Account Team" Follow-Up',
    category: 'Multithreading',
    description: 'An email drafted by an internal account team member (CSM, SE) that the rep forwards to the prospect.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'repName', label: 'Rep Name (You)', placeholder: 'e.g. Alex Johnson', type: 'input' },
      { id: 'teamMemberName', label: 'Account Team Member Name', placeholder: 'e.g. Jordan Kim', type: 'input' },
      { id: 'teamMemberRole', label: 'Account Team Member Role', placeholder: 'e.g. Customer Success Manager', type: 'input' },
      { id: 'specialization', label: "Team Member's Area of Expertise", placeholder: 'e.g. onboarding enterprise revenue teams and driving early adoption', type: 'textarea', rows: 2 },
      { id: 'specificProblem', label: "Prospect's Specific Problem", placeholder: 'e.g. getting cross-functional alignment on your new sales process rollout', type: 'textarea', rows: 2 },
      { id: 'yourName', label: 'Your Name (Rep)', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

I wanted to introduce {teamMemberName:Team Member Name}, our {teamMemberRole:Team Member Role}, who wanted to reach out directly.

—

Hi {prospectName:Prospect Name},

I work with {repName:Rep Name} and specialize in {specialization:Area of Expertise}.

I heard you're working through {specificProblem:Specific Problem} and thought I might be able to help — even separate from the current conversation.

Would you have 20 minutes this week?

{teamMemberName:Team Member Name}`,
  },

  // ─── 9. The "Objections" Follow-Up ───────────────────────────────────────
  {
    id: 'objections-follow-up',
    name: 'The "Objections" Follow-Up',
    category: 'Objection Handling',
    description: 'Acknowledges an objection, isolates the core concern, and seeks context before jumping to solutions.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'objection', label: 'The Objection They Raised', placeholder: 'e.g. the pricing being higher than your current vendor, the implementation timeline being too long', type: 'textarea', rows: 2 },
      { id: 'coreQuestion', label: 'The Core Question You Think They Have', placeholder: 'e.g. "Is the ROI strong enough to justify the switching cost and the risk of change right now?"', type: 'textarea', rows: 3 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

I heard your concern about {objection:The Objection} — and I don't want to jump straight to a response without understanding more.

At the core, it sounds like the real question might be:
{coreQuestion:Core Question}

Is that right?

Before I share any perspective, I'd find it far more useful to understand the full context. Would you have 15 minutes for a quick call?

{yourName:Your Name}`,
  },

  // ─── 10. The "I'm Behind" Follow-Up ──────────────────────────────────────
  {
    id: 'im-behind-follow-up',
    name: 'The "I\'m Behind" Follow-Up',
    category: 'Follow-Up',
    description: 'Used when you need extra time to build a thoughtful recap — buys goodwill and sets expectations.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'reasonForDelay', label: 'Brief Reason for Delay', placeholder: 'e.g. I\'ve been pulling together the full ROI model with our finance team and want to make sure the numbers are accurate before sharing.', type: 'textarea', rows: 3 },
      { id: 'proposedTimeline', label: 'Proposed New Timeline', placeholder: 'e.g. end of day Thursday', type: 'input' },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

I owe you a more thoughtful recap than I've been able to put together yet.

{reasonForDelay:Reason for Delay}

Would it work if I sent that over by {proposedTimeline:Proposed Timeline}? I want to make sure it's worth your time to read.

{yourName:Your Name}`,
  },

  // ─── 11. Reviewing Pricing (The 4A's) ────────────────────────────────────
  {
    id: 'reviewing-pricing-4as',
    name: 'Reviewing Pricing (The 4A\'s)',
    category: 'Pricing',
    description: 'Acknowledges needs, affirms pricing goals, asks for feedback on options, and aligns procurement contacts.',
    fields: [
      { id: 'prospectName', label: 'Prospect First Name', placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'acknowledgedNeeds', label: 'Acknowledged Needs', placeholder: 'e.g. a scalable solution for your 50-person revenue team with full CRM integration and onboarding support', type: 'textarea', rows: 2 },
      { id: 'affirmGoal', label: 'Affirmed Pricing Goal', placeholder: 'e.g. find a structure that fits your H1 budget and gives your team room to expand in H2 without re-negotiating', type: 'textarea', rows: 2 },
      { id: 'pricingOptions', label: 'Pricing Options to Consider', placeholder: 'Option A: Annual license at $X/seat with onboarding included\nOption B: Phased rollout — 20 seats now, 30 at renewal, with locked pricing\nOption C: Pilot program — 10 seats for 90 days at $Y', type: 'textarea', rows: 5 },
      { id: 'alignContact', label: 'Procurement Contact Name', placeholder: 'e.g. Tom Reed', type: 'input' },
      { id: 'alignContactRole', label: 'Procurement Contact Role', placeholder: 'e.g. VP Finance / Procurement', type: 'input' },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {prospectName:Prospect Name},

Acknowledge: Based on what we've discussed, your needs include {acknowledgedNeeds:Acknowledged Needs}. I want to make sure our pricing structure reflects that.

Affirm: My goal is to {affirmGoal:Affirmed Pricing Goal}.

Ask: Here are a few options to consider:

{pricingOptions:Pricing Options}

What's your reaction to these?

Align: I'd also like to loop in {alignContact:Procurement Contact} from {alignContactRole:Their Role} for a brief alignment conversation — would that work on your end?

{yourName:Your Name}`,
  },

  // ─── 12. Closed-Won Feedback Email ────────────────────────────────────────
  {
    id: 'closed-won-feedback',
    name: 'Closed-Won Feedback Email',
    category: 'Post-Sale',
    description: 'Asks a champion for their internal decision process on a recently closed deal to surface hidden buying signals.',
    fields: [
      { id: 'championName', label: "Champion's First Name", placeholder: 'e.g. Sarah', type: 'input' },
      { id: 'company', label: 'Their Company', placeholder: 'e.g. Acme Corp', type: 'input' },
      { id: 'specificQuestion', label: 'Your Specific Question About Their Process', placeholder: 'e.g. What were the 1-2 things that moved this from "interesting" to "we\'re doing this" internally? And was there any moment where the deal nearly fell apart that I wasn\'t aware of?', type: 'textarea', rows: 4 },
      { id: 'yourName', label: 'Your Name', placeholder: 'e.g. Alex Johnson', type: 'input' },
    ],
    template: `Hi {championName:Champion Name},

Congrats again on getting {company:Company} across the line — it was genuinely great working through this with you.

I have an unusual ask: I'd love to understand your internal decision process more clearly — not just the outcome, but how it actually played out inside the room.

Specifically: {specificQuestion:Your Specific Question}

I'm asking because I want to understand what I'm not seeing from the outside — and I know you'd give me an honest answer.

Would you be open to a 20-minute conversation?

{yourName:Your Name}`,
  },
]

export const templateCategories = [
  'Pre-Call',
  'Mid-Funnel',
  'Follow-Up',
  'Multithreading',
  'Executive',
  'Objection Handling',
  'Pricing',
  'Post-Sale',
]
