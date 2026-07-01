// AI provider keys + preference — stored LOCALLY ONLY, never synced.
// IMPORTANT: keys use the `l4_` prefix (NOT `nexus_`), so the sync engine does
// NOT roam them to Firestore. They stay on this device. Nothing about the keys
// leaves the browser except the direct calls the user's own key makes to the
// provider (Google / Anthropic).

export type AiProvider = "gemini" | "claude";

const GEMINI_KEY = "l4_gemini_api_key";
const CLAUDE_KEY = "l4_anthropic_api_key";
const PROVIDER_KEY = "l4_ai_provider";

function read(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
function write(key: string, value: string): void {
  try {
    if (value.trim()) localStorage.setItem(key, value.trim());
    else localStorage.removeItem(key);
  } catch {
    /* storage restricted — ignore */
  }
}

/** Local key first, then the build-time env var (for the original single-user setup). */
export function getGeminiKey(): string {
  return read(GEMINI_KEY) || (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
}
export function setGeminiKey(k: string): void {
  write(GEMINI_KEY, k);
}
export function getClaudeKey(): string {
  return read(CLAUDE_KEY);
}
export function setClaudeKey(k: string): void {
  write(CLAUDE_KEY, k);
}

export function getProvider(): AiProvider {
  return read(PROVIDER_KEY) === "claude" ? "claude" : "gemini";
}
export function setProvider(p: AiProvider): void {
  write(PROVIDER_KEY, p);
}

/** The provider that will actually be used given the configured keys. */
export function effectiveProvider(): AiProvider | null {
  const pref = getProvider();
  if (pref === "claude" && getClaudeKey()) return "claude";
  if (getGeminiKey()) return "gemini";
  if (getClaudeKey()) return "claude";
  return null;
}
