import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are an expert enterprise sales researcher and deal map strategist.
Your job is to analyze a target company and generate a comprehensive deal map to help a seller prepare for a strategic account conversation.

You must respond ONLY with valid JSON matching this exact schema — no markdown, no explanation, just the JSON object:

{
  "companyName": "string",
  "generatedAt": "string (ISO date)",
  "executivePriorities": {
    "items": ["string", ...],
    "note": "string (brief context note)"
  },
  "financialMetrics": {
    "opportunities": ["string", ...],
    "risks": ["string", ...],
    "note": "string"
  },
  "challengesTrends": {
    "risks": ["string", ...],
    "note": "string"
  },
  "strategicInitiatives": {
    "items": ["string", ...],
    "note": "string"
  },
  "desiredOutcomes": {
    "items": ["string", ...],
    "note": "string"
  },
  "solutionFit": {
    "connections": ["string", ...],
    "note": "string"
  },
  "nextMoves": {
    "gaps": ["string", ...],
    "actions": ["string", ...],
    "note": "string"
  }
}

Guidelines:
- executivePriorities: 3-5 real strategic priorities the C-suite is focused on this fiscal year
- financialMetrics.opportunities: 2-3 positive financial indicators or areas of momentum
- financialMetrics.risks: 2-3 financial pain points, pressures, or red flags
- challengesTrends: 3-5 external pressures (competitive, regulatory, macro, cyber, etc.)
- strategicInitiatives: 3-5 major programs or tech rollouts underway
- desiredOutcomes: 3-5 C-suite level business results they are chasing
- solutionFit.connections: how the seller's product maps to the company's world (be specific and direct)
- nextMoves.gaps: 2-3 gaps the seller likely has in their account knowledge or coverage
- nextMoves.actions: 3-4 concrete next steps the seller should take
- All "note" fields: 1 short sentence of context (max 15 words)
- Be specific, factual, and grounded in what is publicly known about the company
- If the company is not well-known, use industry-level insights appropriate to their sector`;

app.post('/api/generate', async (req, res) => {
  const { companyName, productDescription } = req.body;

  if (!companyName || !productDescription) {
    return res.status(400).json({ error: 'companyName and productDescription are required' });
  }

  const userPrompt = `Generate a deal map for: ${companyName}

The seller's product/solution: ${productDescription}

Research ${companyName}'s public information — earnings calls, investor presentations, annual reports, press releases, and industry coverage — to fill in all 7 deal map sections accurately. For the "solutionFit" section, specifically tie the seller's product ("${productDescription}") to ${companyName}'s actual initiatives and outcomes.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].text.trim();

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let dealMap;
    try {
      dealMap = JSON.parse(jsonText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    dealMap.companyName = companyName;
    dealMap.generatedAt = new Date().toISOString();

    res.json(dealMap);
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: 'Failed to generate deal map. Check your API key and try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Deal Map running at http://localhost:${PORT}`);
});
