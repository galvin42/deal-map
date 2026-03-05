import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a MEDDICC sales intelligence analyst. Extract MEDDICC-relevant information from unstructured sales content and determine how it should update the existing deal record.

You must respond ONLY with valid JSON — no markdown, no explanation:

{
  "extractions": [
    {
      "element": "metrics" | "economicBuyer" | "decisionCriteria" | "decisionProcess" | "identifyPain" | "champion" | "competition",
      "type": "new" | "update" | "conflict",
      "newStatus": 0 | 1 | 2 | 3,
      "extractedContent": "string — what was learned, in plain language",
      "sourceQuote": "string — exact or near-exact quote from the source",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "coachingUpdates": {
    "metrics": "string",
    "economicBuyer": "string",
    "decisionCriteria": "string",
    "decisionProcess": "string",
    "identifyPain": "string",
    "champion": "string",
    "competition": "string"
  },
  "summary": "string — one sentence summary of what this content revealed"
}

Status scale: 0=Unknown, 1=Mentioned, 2=Evidenced, 3=Validated

Rules:
- Only include elements in extractions[] if the source content reveals new information
- type="new": element was Unknown (0), now has real information
- type="update": element had information, this makes it more specific or raises the status
- type="conflict": new info directly contradicts a Validated (status=3) element — flag it, do not auto-apply
- Never suggest downgrading a status (e.g., 3→2 not allowed)
- sourceQuote: pull the most relevant verbatim phrase from the pasted content
- confidence: high=explicit direct statement, medium=strongly implied, low=interpreted
- coachingUpdates: provide fresh MEDDICC coaching guidance for ALL 7 elements based on the complete deal state after extractions are applied
- summary: what was the single most important thing revealed by this content?`

export async function POST(req: NextRequest) {
  try {
    const { contentType, content, deal } = await req.json()

    const statusLabels = ['Unknown', 'Mentioned', 'Evidenced', 'Validated']
    const elementSummary = Object.entries(deal.elements as Record<string, { status: number; summary: string }>)
      .map(([key, el]) => `  ${key}: ${statusLabels[el.status]} — ${el.summary || 'no summary yet'}`)
      .join('\n')

    const userPrompt = `Deal: ${deal.dealName || deal.company} (${deal.stage})
Company: ${deal.company}
What we sell: ${deal.productContext}

Current MEDDICC state:
${elementSummary}

New ${contentType.replace(/_/g, ' ')} to analyze:
---
${content}
---

Extract all MEDDICC-relevant intelligence from the above content.`

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
    console.error('MEDDICC extract error:', msg)
    return NextResponse.json({ error: 'Extraction failed. Check your API key and try again.' }, { status: 500 })
  }
}
