import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { rawNotes, repName, accountName, meetingDate } = await req.json()

    if (!rawNotes?.trim()) {
      return NextResponse.json({ error: 'Raw notes are required.' }, { status: 400 })
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const systemPrompt = `You are the "Meeting Debrief Architect." Your job is to transform raw, fragmented, and messy meeting notes into a high-signal, structured debrief for a professional CRM.

Analyze the provided raw notes and return a single JSON object with this exact structure:

{
  "accountHealthScore": {
    "score": <integer 1-10>,
    "justification": "<1-sentence justification>"
  },
  "executiveSummary": "<2-3 sentence overview of the meeting purpose and outcome>",
  "keyDiscoveries": ["<discovery 1>", "<discovery 2>"],
  "strategicRisks": ["<risk 1>", "<risk 2>"],
  "stakeholderMap": [
    { "name": "<full name or role>", "role": "<title or role>", "sentiment": "<Positive|Neutral|Negative|Unknown>" }
  ],
  "actionItems": [
    { "item": "<specific, concrete action>", "owner": "<person responsible>", "deadline": "<calculated date or timeframe>" }
  ],
  "crmSnippet": "<condensed professional 2-3 sentence paragraph suitable for pasting into Salesforce or HubSpot>"
}

Guidelines:
- Account Health Score: 10 = Perfect relationship/deal health; 1 = Immediate churn or deal risk. Base on sentiment, risks, urgency, and engagement signals.
- Clean the Noise: Ignore filler words, personal chatter (pets, weather, weekend plans), off-topic tangents.
- Professional Translation: Convert slang, frustration, or casual language into professional, objective business language.
- Inference: If a deadline is mentioned by relative day (e.g., "this Friday", "end of month", "next week"), calculate the exact calendar date. Today is: ${today}.
- Stakeholder Sentiment: Infer from tone, word choice, and context in the notes. If unclear, use "Unknown".
- If a field has no extractable data, use an empty array [] or "Not mentioned."
- Return ONLY the JSON object. No markdown fences, no explanation, no preamble.`

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Raw Meeting Notes:\n\n${rawNotes.trim()}`,
        },
      ],
    })

    let rawText = (message.content[0] as { text: string }).text.trim()
    let jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    if (!jsonText.startsWith('{')) {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) jsonText = match[0]
    }

    const parsed = JSON.parse(jsonText)

    return NextResponse.json({
      ...parsed,
      repName: repName?.trim() || '',
      accountName: accountName?.trim() || '',
      meetingDate: meetingDate || new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
    })
  } catch (err: unknown) {
    console.error('meeting-debrief error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('JSON') || msg.includes('parse')) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
