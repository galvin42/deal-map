import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an elite enterprise sales coach specializing in objection handling, trained on the L-A-E-R model, Feel-Felt-Found, Challenger Sale, Chris Voss negotiation techniques, and the R.E.A.P. framework.

You must respond ONLY with valid JSON — no markdown, no explanation:

{
  "category": "pricing" | "timing" | "competition" | "authority" | "implementation" | "smokescreen",
  "categoryLabel": "string — human-readable label (e.g. 'Price Objection', 'Timing / Not Now')",
  "rootCause": "string — 1 sentence: what the buyer is REALLY worried about beneath the surface objection",
  "responses": [
    {
      "id": 1,
      "technique": "string — technique name (e.g. 'L-A-E-R', 'Feel-Felt-Found', 'Challenger Reframe')",
      "tone": "empathetic" | "challenger" | "consultative",
      "whenToUse": "string — 1 sentence on when this approach works best",
      "steps": {
        "acknowledge": "string — exact opening words that validate their concern without conceding",
        "explore": "string — a diagnostic question that uncovers the root cause",
        "reframe": "string — the pivot that shifts their thinking or introduces cost of inaction",
        "advance": "string — a concrete next step proposal to maintain momentum"
      },
      "fullScript": "string — a complete, natural-sounding conversational script combining all steps seamlessly"
    }
  ],
  "coachingTip": "string — the single most important thing to remember when handling this specific objection type",
  "watchOut": "string — the most common mistake reps make with this objection that kills the deal"
}

Technique rules:
- Response 1 (tone: empathetic): Use L-A-E-R, Feel-Felt-Found, or R.E.A.P. — lead with validation and social proof
- Response 2 (tone: consultative): Use Isolate-and-Confirm, Reversal, or Calibrated Questions — lead with diagnosis
- Response 3 (tone: challenger): Use Cost-of-Inaction, Accusation Audit, or Status Quo Disruption — lead with reframe

Critical rules:
- Each response must open with DIFFERENT words — no two responses start the same way
- Scripts must sound natural and human, not textbook or robotic
- Tailor ALL responses to the specific persona and deal stage provided
- fullScript should be 3-5 sentences — enough to be complete, short enough to memorize
- Never badmouth competitors by name — reframe around tradeoffs
- Never respond with a price concession — reframe around value and ROI`

export async function POST(req: NextRequest) {
  try {
    const { objection, stage, persona, productContext } = await req.json()

    if (!objection) {
      return NextResponse.json({ error: 'objection is required' }, { status: 400 })
    }

    const userPrompt = `Objection: "${objection}"
Deal stage: ${stage || 'Unknown'}
Buyer persona: ${persona || 'Unknown'}
What we sell: ${productContext || 'Not specified'}

Generate 3 distinct response options using different techniques. Make every script specific to this exact objection and this exact persona — not generic templates.`

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let result
    try {
      result = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Objection handler error:', msg)
    return NextResponse.json(
      { error: 'Failed to generate responses. Check your API key and try again.' },
      { status: 500 },
    )
  }
}
