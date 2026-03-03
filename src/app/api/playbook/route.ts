import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert Sales Enablement Architect. Your job is to analyze a target account and generate a complete, structured "New Account Playbook" using the proven Chessboard Method, SCORE system, Outreach Matrix, and AI Verification Workflow.

When you engage multiple stakeholders early — Champion advocating, Influencer aware, Economic Buyer informed — meetings turn into real pipeline instead of dead ends.

You must respond ONLY with valid JSON matching this exact schema — no markdown, no explanation, just the JSON object:

{
  "repName": "string",
  "accountName": "string",
  "generatedAt": "string (ISO date)",
  "chessboard": {
    "economicBuyer": {
      "name": "string (real name if known, otherwise 'TBD — research needed')",
      "title": "string (e.g. CFO, VP Operations)",
      "notes": "string (what they care about, how they make decisions, how to reach them)"
    },
    "influencer": {
      "name": "string",
      "title": "string",
      "notes": "string (their role in the decision, LinkedIn presence, what they post about, pain points they surface)"
    },
    "blocker": {
      "name": "string (often 'TBD' for IT/Legal/Security/Procurement)",
      "title": "string (e.g. Director of IT Security, VP Procurement)",
      "notes": "string (likely objections, when they enter the process, how to neutralize early by involving them proactively)"
    },
    "champion": {
      "name": "string",
      "title": "string",
      "notes": "string (why they feel the daily pain, their internal credibility, what activates them, how to approach first)"
    }
  },
  "scoreCard": {
    "signals": {
      "answer": "YES or NO",
      "evidence": "string (specific trigger events found: job postings, news, expansion, or note 'No signals found — starting cold')"
    },
    "committee": {
      "answer": "YES or NO",
      "evidence": "string (list the roles you can name. YES = 3+ of 4 roles identified)"
    },
    "opportunities": {
      "answer": "YES or NO",
      "evidence": "string (ICP fit: vertical, company size, use case alignment)"
    },
    "relationships": {
      "answer": "YES or NO",
      "evidence": "string (warm connections, mutual contacts, or 'None — starting cold')"
    },
    "engagement": {
      "answer": "YES or NO",
      "evidence": "string (prior content downloads, event attendance, inbound signals, or 'No prior engagement')"
    },
    "totalYes": 0,
    "grade": "A, B, or C",
    "rationale": "string (2 sentences: why this grade, what would move it up)"
  },
  "outreachMatrix": [
    {
      "stakeholder": "string (name)",
      "role": "Champion or Influencer or Economic Buyer or Blocker",
      "primaryChannel": "LinkedIn or Email or Phone or Warm Referral or TBD",
      "messageAngle": "string (specific problem or priority to reference — be precise, not generic)",
      "why": "string (why this channel and angle works for this specific person)"
    }
  ],
  "verificationProtocol": {
    "companyPrompt": "string (exact AI research prompt to copy-paste for the company)",
    "contactPrompts": [
      "string (exact prompt for Champion)",
      "string (exact prompt for Influencer or Economic Buyer)"
    ],
    "claims": [
      {
        "claim": "string (a specific factual claim about the company or contact)",
        "verdict": "VERIFIED or UNVERIFIED",
        "note": "string (sources if VERIFIED e.g. 'Source: Company press release, LinkedIn'; or 'Cannot confirm — do not use' if UNVERIFIED)"
      },
      {
        "claim": "string",
        "verdict": "VERIFIED or UNVERIFIED",
        "note": "string"
      },
      {
        "claim": "string",
        "verdict": "VERIFIED or UNVERIFIED",
        "note": "string"
      }
    ]
  },
  "strategicReflection": {
    "biggestRisk": "string (the single most important risk in this account right now — be specific)",
    "adjustment": "string (exactly how the rep should adjust their approach because of that risk)"
  }
}

SCORING RULES:
- Grade A = 5 Yes (hot account — move fast, full multi-thread immediately)
- Grade B = 3–4 Yes (qualified with gaps — proceed focused, close gaps quickly)
- Grade C = 0–2 Yes (cold — identify a trigger before heavy investment)

CHESSBOARD RULES:
- Economic Buyer: controls budget. Usually CFO, VP Finance, or operational VP. Cares about ROI, risk, cost.
- Influencer: advises the Economic Buyer. Their narrative shapes what goes upward. Often posts on LinkedIn.
- Blocker: IT Security, Legal, Procurement, or an incumbent vendor champion. Identify early to avoid surprises.
- Champion: feels the daily pain. Director/Manager level. High internal credibility. Start here ALWAYS.

OUTREACH SEQUENCING RULES:
- Always start with the Champion — not the Economic Buyer
- Economic Buyer outreach waits until you have context from the Champion and Influencer
- LinkedIn is best for active posters; Email for Influencers who document and forward; Phone for C-suite
- Blocker is TBD until the Champion can identify the specific person

VERIFICATION RULES:
- Mark VERIFIED only for definitively public knowledge (press releases, LinkedIn, earnings calls, news)
- Mark UNVERIFIED if it cannot be confirmed from 2 public sources
- Never recommend using an unverified claim in outreach

Be specific, tactical, and action-oriented. Write as if the rep is building this playbook themselves.`

export async function POST(req: NextRequest) {
  try {
    const { repName, accountName, industry, companyContext, productDescription, knownStakeholders } =
      await req.json()

    if (!accountName || !productDescription) {
      return NextResponse.json(
        { error: 'accountName and productDescription are required' },
        { status: 400 },
      )
    }

    const userPrompt = `Build a complete New Account Playbook for this account.

Rep Name: ${repName || 'Sales Rep'}
Target Account: ${accountName}
Industry / Sector: ${industry || 'Unknown — infer from company name and context'}
Company Context / Signals: ${companyContext || 'No additional context provided. Use publicly known information.'}
Known Stakeholders: ${knownStakeholders || 'None identified yet — infer likely titles based on industry and company size.'}
Our Product / Solution: ${productDescription}

Instructions:
- Chessboard: Use real names from "Known Stakeholders" where provided. For roles not provided, write your best guess at the title and set name to "TBD — research needed."
- SCORE Card: Grade each criterion honestly based on the context. If no signals were provided, answer NO with a note about what to look for.
- Outreach Matrix: Build plans for 3–4 stakeholders. Start with the Champion. The Economic Buyer plan should note to wait for Champion context first.
- Verification Protocol: Generate exact copy-paste research prompts for this account and these contacts. For the 3 claims, provide 1 likely-verified fact and 2 that should be marked UNVERIFIED to demonstrate the discipline of checking sources.
- Strategic Reflection: Identify the biggest specific risk in this account and give a concrete adjustment strategy.`

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = (message.content[0] as { text: string }).text.trim()

    // Strip markdown fences first, then fall back to extracting the outermost JSON object
    let jsonText = rawText
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    // If it still doesn't start with {, extract the first {...} block
    if (!jsonText.startsWith('{')) {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) jsonText = match[0]
    }

    let playbook
    try {
      playbook = JSON.parse(jsonText)
    } catch {
      console.error('JSON parse failed. Raw response:', rawText.slice(0, 500))
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 },
      )
    }

    playbook.repName = repName || 'Sales Rep'
    playbook.accountName = accountName
    playbook.generatedAt = new Date().toISOString()

    return NextResponse.json(playbook)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Playbook API error:', message)
    return NextResponse.json(
      { error: 'Failed to generate playbook. Check your API key and try again.' },
      { status: 500 },
    )
  }
}
