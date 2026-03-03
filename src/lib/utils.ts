import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Parse a template string with {fieldId:Field Label} markers into segments */
export interface TemplatePart {
  type: 'text' | 'variable'
  content: string
  key?: string
  label?: string
  filled?: boolean
}

export function parseTemplate(
  template: string,
  values: Record<string, string>,
): TemplatePart[] {
  const regex = /\{([a-zA-Z]+):([^}]+)\}/g
  const parts: TemplatePart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: template.slice(lastIndex, match.index) })
    }
    const [, key, label] = match
    const value = values[key] || ''
    parts.push({
      type: 'variable',
      content: value || `[${label}]`,
      key,
      label,
      filled: value.trim().length > 0,
    })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < template.length) {
    parts.push({ type: 'text', content: template.slice(lastIndex) })
  }

  return parts
}

/** Extract the full plain text of a template with values substituted */
export function extractPlainText(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([a-zA-Z]+):([^}]+)\}/g, (_, key, label) => {
    return values[key] || `[${label}]`
  })
}

/** Count filled vs total variables in a template */
export function countTemplateVars(
  template: string,
  values: Record<string, string>,
): { filled: number; total: number } {
  const matches = Array.from(template.matchAll(/\{([a-zA-Z]+):([^}]+)\}/g))
  const uniqueKeys = [...new Set(matches.map((m) => m[1]))]
  const filled = uniqueKeys.filter((k) => (values[k] || '').trim().length > 0).length
  return { filled, total: uniqueKeys.length }
}

/** Copy text to clipboard and return success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      return true
    } catch {
      return false
    }
  }
}

/** Generate a unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/** Format currency */
export function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return value
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num.toFixed(0)}`
}
