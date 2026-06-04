import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
  }
  return client
}

export async function callClaude(systemPrompt: string, userMessage: string, maxTokens = 200) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return (response.content[0] as { text: string }).text.trim()
}

export async function callClaudeJSON<T>(systemPrompt: string, userMessage: string, maxTokens = 500): Promise<T> {
  const text = await callClaude(
    `${systemPrompt}\n\nRespond ONLY with valid JSON. No markdown, no explanation.`,
    userMessage,
    maxTokens
  )
  return JSON.parse(text) as T
}
