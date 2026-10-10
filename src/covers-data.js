/** Placeholder — overwritten by scripts/fetch-covers.mjs */
export const covers = {}
export const coverGaps = []
export function coverFor(shelfId, index) {
  return covers[`${shelfId}-${index}`] || null
}
