//==============================================================================================
//  1) DESCRIPTION
//    normalizeCategory — normalises a raw category string to the project's single-word,
//    lowercase form: lowercases, trims, then keeps only the first whitespace-delimited word.
//
//    Parameters:
//      category — the raw category string to normalise
//
//    Returns:
//      string — the lowercase first word of the trimmed input
//==============================================================================================

export function normalizeCategory(category: string): string {
  const trimmed = category.toLowerCase().trim()
  const firstWord = trimmed.split(/\s+/)[0]
  return firstWord
}
