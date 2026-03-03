import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { profileText, linkedInUrl } = await req.json()

    if (!profileText || profileText.trim().length < 10) {
      return NextResponse.json({ error: 'Profile text is required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: `You are a contact data extraction expert. Given raw LinkedIn profile text (copied from a browser), extract structured contact information and return ONLY a valid JSON object.

Return this exact schema:
{
  "name": "string — full name",
  "title": "string — current job title (most recent role)",
  "company": "string — current employer",
  "email": "string — if visible in the profile, otherwise empty string",
  "phone": "string — if visible in the profile, otherwise empty string",
  "location": "string — city and state/country if available, otherwise empty string",
  "summary": "string — 1–2 sentence summary of who this person is and what they focus on, based on their About section or experience",
  "recentActivity": "string — brief note on what they've recently posted or engaged with (from their activity section), or empty string if not available",
  "chessboardRole": "string — one of: Champion, Influencer, Economic Buyer, Blocker, Unknown — infer from their title and seniority level (Director/Manager = likely Champion; VP = likely Influencer; CFO/CRO/CEO = likely Economic Buyer; IT/Security/Legal/Procurement = likely Blocker; Unknown if unclear)"
}

Return ONLY the JSON object. No markdown fences, no explanation.`,
      messages: [
        {
          role: 'user',
          content: `LinkedIn URL: ${linkedInUrl || 'Not provided'}\n\nProfile Text:\n${profileText.trim()}`,
        },
      ],
    })

    const rawText = (message.content[0] as { text: string }).text.trim()

    let jsonText = rawText
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    if (!jsonText.startsWith('{')) {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) jsonText = match[0]
    }

    const parsed = JSON.parse(jsonText)
    return NextResponse.json(parsed)
  } catch (err: unknown) {
    console.error('parse-contact error:', err)
    return NextResponse.json(
      { error: 'Failed to parse profile. Please try again.' },
      { status: 500 },
    )
  }
}
