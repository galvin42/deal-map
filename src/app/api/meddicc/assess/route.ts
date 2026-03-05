import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a MEDDICC-certified enterprise sales coach. Analyze a deal's MEDDICC qualification data and return coaching guidance.

You must respond ONLY with valid JSON — no markdown, no explanation, just the object:

{
  "elements": {
    "metrics":         { "summary": "string", "guidance": "string" },
    "economicBuyer":   { "summary": "string", "guidance": "string" },
    "decisionCriteria":{ "summary": "string", "guidance": "string" },
    "decisionProcess": { "summary": "string", "guidance": "string" },
    "identifyPain":    { "summary": "string", "guidance": "string" },
    "champion":        { "summary": "string", "guidance": "string" },
    "competition":     { "summary": "string", "guidance": "string" }
  },
  "topGaps": ["string", "string", "string"]
}

Status scale: 0=Unknown, 1=Mentioned (came up, unverified), 2=Evidenced (confirmed with data), 3=Validated (tested by multiple sources)

Guidelines:
- summary: 1–2 sentences on what is known for this element (if Unknown, describe what needs to be discovered)
- guidance: One specific, actionable next step using MEDDICC coaching language — reference the element by name
- topGaps: The 3 highest-priority missing elements ordered by deal impact
- If an element has a note from the rep, incorporate it into the summary
- Be direct, coaching-oriented, and MEDDICC-fluent — not generic sales advice`

export async function POST(req: NextRequest) {
  try {
    const { company, dealName, stage, productContext, elements } = await req.json()

    const elementLines = Object.entries(elements as Record<string, { status: number; notes: string }>)
      .map(([key, el]) => {
        const labels = ['Unknown', 'Mentioned', 'Evidenced', 'Validated']
        const note = el.notes ? ` | Rep note: "${el.notes}"` : ''
        return `  ${key}: ${labels[el.status]} (${el.status}/3)${note}`
      })
      .join('\n')

    const userPrompt = `Deal: ${dealName || company}
Company: ${company}
Stage: ${stage}
What we sell: ${productContext}

Current MEDDICC status:
${elementLines}

Generate coaching guidance to help this rep advance the deal.`

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
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
    console.error('MEDDICC assess error:', msg)
    return NextResponse.json({ error: 'Assessment failed. Check your API key and try again.' }, { status: 500 })
  }
}
