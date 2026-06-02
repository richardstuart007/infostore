//----------------------------------------------------------------------------------
//  normalizeCategory — lowercase, trim, and extract first word (single-word categories)
//----------------------------------------------------------------------------------
export function normalizeCategory(category: string): string {
  const trimmed = category.toLowerCase().trim()
  const firstWord = trimmed.split(/\s+/)[0]
  return firstWord
}
