// Admin-uploaded custom title font (Fase 2). Stored LOCAL ONLY (the `l4_` prefix
// is NOT synced by syncEngine), as a data URL, and injected as an @font-face
// under the family name the FONT_FAMILY.custom entry points to. Device-local
// admin customization — it does not roam to other users.

const KEY = "l4_custom_title_font";
const STYLE_ID = "nexus-custom-title-font";
export const CUSTOM_FONT_FAMILY = "NexusL4Custom";

function injectFontFace(dataUrl: string): void {
  if (typeof document === "undefined") return;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `@font-face { font-family: '${CUSTOM_FONT_FAMILY}'; src: url('${dataUrl}'); font-display: swap; }`;
}

/** Re-inject the stored custom font on app start (call once at boot). */
export function loadCustomFont(): void {
  try {
    const dataUrl = localStorage.getItem(KEY);
    if (dataUrl) injectFontFace(dataUrl);
  } catch {
    /* storage restricted — ignore */
  }
}

export function hasCustomFont(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

/** Read a .woff2/.ttf/.otf file, persist it locally, and inject the @font-face. */
export function setCustomFontFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = String(reader.result || "");
        if (!dataUrl) return reject(new Error("empty file"));
        localStorage.setItem(KEY, dataUrl);
        injectFontFace(dataUrl);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
