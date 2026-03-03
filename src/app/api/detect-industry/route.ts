import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json()
    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json({ industry: '' })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 30,
      system:
        'You are a company classification expert. Given a company name, respond with ONLY the industry/sector in 1–4 words. Examples: "Healthcare Technology", "Financial Services", "B2B SaaS", "Retail & E-commerce", "Manufacturing", "Legal Technology". No punctuation, no explanation — just the industry label.',
      messages: [
        {
          role: 'user',
          content: `Company: ${companyName.trim()}`,
        },
      ],
    })

    const industry = (message.content[0] as { text: string }).text.trim()
    return NextResponse.json({ industry })
  } catch (err: unknown) {
    console.error('detect-industry error:', err)
    return NextResponse.json({ industry: '' })
  }
}
