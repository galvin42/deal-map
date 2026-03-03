import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    let systemPrompt = ''
    let userPrompt = ''

    // ── Action: Validate Phase 1 answers ────────────────────────────────────
    if (action === 'validate') {
      systemPrompt = `You are a strict Amazon Working Backwards coach. Your job is to evaluate whether the 5 Customer Questions have been answered with enough specificity and depth to begin drafting a PR/FAQ.

REJECTION CRITERIA — automatically score 1–5 if any of these are present:
- Uses vague segments like "everyone", "businesses", "clients", "customers", "save time", "improve efficiency" without meaningful context
- No measurable or scoped problem defined
- Benefit described generically without a specific outcome
- No evidence of customer research (no interviews, data, or observable signals)
- Experience description is vague ("they would use it", "it would be easy")

PASSING CRITERIA — score 6–10:
- Specific persona with context: industry, role, company size, trigger event
- Quantified or clearly scoped problem with real stakes
- Concrete, specific benefit tied to a clear outcome
- Evidence: customer interviews, survey data, field observation, or verifiable signal
- Concrete experience description with specific steps and touchpoints

passed = true ONLY if ALL five individual scores are 6 or higher AND overallScore >= 7.

Return ONLY valid JSON, no markdown, no code fences, no commentary:
{
  "passed": false,
  "overallScore": 5,
  "feedback": {
    "whoIsCustomer": { "score": 5, "comment": "Be specific about their role, industry, and context." },
    "problemOpportunity": { "score": 5, "comment": "Name the specific problem with stakes." },
    "importantBenefit": { "score": 5, "comment": "What specifically changes for them?" },
    "howYouKnow": { "score": 5, "comment": "Cite real evidence — interviews, data, signals." },
    "experienceLookLike": { "score": 5, "comment": "Walk through the actual steps a user takes." }
  },
  "summary": "Two-sentence honest assessment of where the answers stand.",
  "coachingNote": "The single most important thing to strengthen before proceeding."
}`

      userPrompt = `Evaluate these Working Backwards answers:

Q1. Who is the customer?
${body.phase1?.whoIsCustomer || '(not answered)'}

Q2. What is the customer problem or opportunity?
${body.phase1?.problemOpportunity || '(not answered)'}

Q3. What is the most important customer benefit?
${body.phase1?.importantBenefit || '(not answered)'}

Q4. How do you know what your customer needs or wants?
${body.phase1?.howYouKnow || '(not answered)'}

Q5. What does the experience look like?
${body.phase1?.experienceLookLike || '(not answered)'}`

    // ── Action: Generate Press Release ───────────────────────────────────────
    } else if (action === 'generate-pr') {
      systemPrompt = `You are an expert Amazon Working Backwards press release writer. Synthesize the provided inputs into a polished, Amazon-style Press Release written from the perspective of a future launch day.

ABSOLUTE RULES — violating any of these disqualifies the output:
1. NARRATIVE PARAGRAPHS ONLY — zero bullet points, zero numbered lists, zero bold headers within section content
2. Plain language — no corporate jargon, no buzzwords, write as if explaining to a smart non-expert
3. Optimistic but realistic — no hype, no empty superlatives, no claims without grounding
4. The problemParagraph must describe the customer's world and pain WITHOUT ever mentioning the product or solution
5. The solutionParagraph must explicitly state HOW it is better, faster, or cheaper than what customers use today
6. Both quotes must sound like real humans said them — not marketing copy
7. Total word count across all body sections combined must be under 600 words

Return ONLY valid JSON, no markdown, no code fences:
{
  "headline": "Single sentence. Must be immediately understood by a non-expert reader.",
  "subtitle": "One sentence adding customer context or a secondary benefit.",
  "launchLine": "City, Media Outlet — Date — Opening sentence of the first paragraph.",
  "problemParagraph": "2–3 sentences. The customer's world, the pain, the stakes. No mention of the solution.",
  "solutionParagraph": "2–3 sentences. What the product does. How it is specifically better than alternatives.",
  "internalLeaderQuote": "Quote from the executive. Why this problem matters strategically.",
  "customerQuote": "Quote from the fictional customer. How their pain was relieved or goal achieved.",
  "callToAction": "One sentence with the URL. How to start today.",
  "wordCount": 450
}`

      userPrompt = `Generate a press release from these inputs:

CUSTOMER CONTEXT (Phase 1):
- Who: ${body.phase1?.whoIsCustomer}
- Problem: ${body.phase1?.problemOpportunity}
- Benefit: ${body.phase1?.importantBenefit}
- Evidence: ${body.phase1?.howYouKnow}
- Experience: ${body.phase1?.experienceLookLike}

PRESS RELEASE INPUTS (Phase 2):
- Company: ${body.phase2?.companyName}
- Product/Service: ${body.phase2?.productService}
- Target Customer: ${body.phase2?.targetCustomer}
- Primary Benefit: ${body.phase2?.primaryBenefit}
- Subtitle addition: ${body.phase2?.subtitleAddition}
- City: ${body.phase2?.city}
- Media Outlet: ${body.phase2?.mediaOutlet}
- Proposed Launch Date: ${body.phase2?.proposedLaunchDate}
- Top Problems (ranked by pain): ${body.phase2?.topProblems}
- How it solves simply: ${body.phase2?.howSolvesSimply}
- What customers use today: ${body.phase2?.existingAlternatives}
- Differentiation: ${body.phase2?.differentiation}
- Executive name: ${body.phase2?.executiveName}
- Executive's reason for this: ${body.phase2?.executiveReason}
- Fictional customer name: ${body.phase2?.fictitiousCustomerName}
- Customer's pain or goal: ${body.phase2?.customerPainGoal}
- Call to action: ${body.phase2?.callToAction}
- URL: ${body.phase2?.ctaUrl}`

    // ── Action: Generate FAQ ─────────────────────────────────────────────────
    } else if (action === 'generate-faq') {
      systemPrompt = `You are an Amazon-style FAQ writer. Generate two distinct sets of FAQs from the provided inputs.

EXTERNAL FAQ RULES:
- Tone: plain, helpful, like a knowledgeable friend — not a brochure
- Length: 2–4 sentences per answer, cohesive prose, NO bullet points
- Be concrete and specific; avoid vague reassurances

INTERNAL FAQ RULES:
- Tone: rigorous, executive-level, honest
- The "Dragon" question (top failure reasons) must be brutally candid — this is the most important question in the document; do not soften it
- Acknowledge uncertainty and data gaps honestly
- Length: 3–5 sentences per answer, cohesive prose, NO bullet points
- No wishful thinking or spin

Return ONLY valid JSON, no markdown, no code fences:
{
  "external": [
    { "question": "What is the price?", "answer": "..." },
    { "question": "How does it work?", "answer": "..." },
    { "question": "How do I get customer support?", "answer": "..." },
    { "question": "Where can I buy it?", "answer": "..." }
  ],
  "internal": [
    { "question": "What products do customers use today to solve this?", "answer": "..." },
    { "question": "What is the Total Addressable Market (TAM) and estimated consumer demand?", "answer": "..." },
    { "question": "What are the per-unit economics (gross profit / contribution margin)?", "answer": "..." },
    { "question": "What upfront investment is required — people, technology, and fixed costs?", "answer": "..." },
    { "question": "What are our third-party dependencies?", "answer": "..." },
    { "question": "What are the top three reasons this product will not succeed?", "answer": "..." }
  ]
}`

      userPrompt = `Generate FAQs from these inputs:

PRODUCT CONTEXT:
- Company: ${body.phase2?.companyName}
- Product: ${body.phase2?.productService}
- Customer: ${body.phase1?.whoIsCustomer}
- Core Problem: ${body.phase1?.problemOpportunity}
- Core Benefit: ${body.phase1?.importantBenefit}

EXTERNAL FAQ INPUTS:
- Price: ${body.phase3External?.price}
- How it works: ${body.phase3External?.howItWorks}
- Customer support: ${body.phase3External?.customerSupport}
- Where to buy: ${body.phase3External?.whereToBuy}

INTERNAL FAQ INPUTS:
- Current alternatives: ${body.phase3Internal?.currentAlternatives}
- TAM and demand: ${body.phase3Internal?.tamAndDemand}
- Unit economics: ${body.phase3Internal?.unitEconomics}
- Upfront investment: ${body.phase3Internal?.upfrontInvestment}
- Third-party dependencies: ${body.phase3Internal?.thirdPartyDependencies}
- Top 3 failure reasons (the Dragon question): ${body.phase3Internal?.topFailureReasons}`

    // ── Action: Rewrite a section ────────────────────────────────────────────
    } else if (action === 'rewrite') {
      systemPrompt = `You are an Amazon-style PR/FAQ editor. Your job is to rewrite the provided section based on stakeholder feedback.

RULES:
- Maintain narrative paragraph format — absolutely NO bullet points or lists
- Keep plain language — zero corporate jargon
- Preserve the optimistic but realistic tone
- Match the approximate length of the original
- Directly address the specific feedback given

Return ONLY valid JSON, no markdown, no code fences:
{
  "rewrittenContent": "the rewritten paragraph or sentences",
  "changesSummary": "One sentence describing the key change made."
}`

      userPrompt = `Section being rewritten: "${body.rewriteTarget}"

Current content:
${body.currentContent}

Stakeholder feedback:
${body.rewriteFeedback}

Rewrite this section to incorporate the feedback.`

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object found in response')

    return NextResponse.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('[PRFAQ API]:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
