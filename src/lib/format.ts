/**
 * HTS code formatting.
 *
 * The backend returns flat digit strings ("4202110030"); the human-facing
 * convention is dotted ("4202.11.00.30"). Apply at render time only.
 */
export function formatHtsCode(code: string | null | undefined): string {
  if (!code) return ''
  const digits = code.replace(/\D/g, '')
  if (digits.length >= 10) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8, 10)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
  }
  if (digits.length === 6) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`
  return code
}

/** Truncate text to a max length with an ellipsis, used for inline pill captions. */
export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}
