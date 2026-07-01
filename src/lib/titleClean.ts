// Display-only sanitizer for block titles that arrive from the imported JSON
// with coaching cues/classifications mixed in (e.g. "SKILL (GIMNASIA EMPUJE
// INVERTIDO)"). Pure and non-destructive — it never touches stored data, so it
// can't break a program; it only tidies what's shown on the board/wizard/export.
//
// Rules (conservative, non-lossy):
//  1. strip HTML tags and collapse whitespace
//  2. drop bracketed note blocks: "[NOTA]: ...", "[CUE] ..."
//  3. convert a trailing "(classification)" into a "· classification" subtitle
//     separator (keeps the info, removes the parenthetical clutter)
//  4. trim leftover separators / spaces
export function cleanBlockTitle(raw: string): string {
  let t = String(raw ?? "")
    .replace(/<[^>]*>/g, " ") // HTML
    .replace(/\[[^\]]*\]\s*:?/g, " ") // [NOTA]: , [CUE]
    .replace(/\s+/g, " ")
    .trim();

  // "SKILL (GIMNASIA EMPUJE INVERTIDO)" → "SKILL · GIMNASIA EMPUJE INVERTIDO".
  // Only a single trailing parenthetical, and only when there's a real label in
  // front of it, so we never produce a bare "· X".
  const paren = t.match(/^(.*\S)\s*\(([^()]+)\)\s*$/);
  if (paren && paren[1].trim().length >= 2) {
    t = `${paren[1].trim()} · ${paren[2].trim()}`;
  }

  return t.replace(/\s*[·|—-]\s*$/, "").trim();
}
