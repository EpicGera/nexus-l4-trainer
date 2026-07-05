// Export de un nodo DOM del recap a PNG y PDF. Reusa el mismo camino
// nativo(Capacitor)/web que la Story, pero genérico por id de nodo.

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const toast = (message: string, kind: "success" | "error" = "success") =>
  window.dispatchEvent(new CustomEvent("nexus_toast", { detail: { message, kind, durationMs: 6000 } }));

async function renderPng(nodeId: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  const node = document.getElementById(nodeId);
  if (!node) {
    toast("No se encontró el panel del recap.", "error");
    return null;
  }
  const w = node.offsetWidth || 900;
  const h = node.offsetHeight || 1200;
  const dataUrl = await toPng(node, { backgroundColor: "#0A0A0A", pixelRatio: 2, width: w, height: h });
  return { dataUrl, w, h };
}

async function deliver(dataUrl: string, filename: string, mime: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = dataUrl.split(",")[1];
    try {
      const res = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
      await Share.share({ title: "Nexus L4 — Recap", url: res.uri, dialogTitle: "Compartir recap" });
    } catch (e: any) {
      if (!/cancel/i.test(e?.message ?? "")) {
        await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Documents, recursive: true });
        toast(`✅ Guardado en Documentos/${filename}`);
      }
    }
    return;
  }
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: mime });
  if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ title: "Nexus L4 — Recap", files: [file] }); return; } catch (e: any) { if (e?.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast(`✅ Descargado: ${filename}`);
}

export async function exportRecapPng(nodeId: string, filename: string): Promise<void> {
  try {
    const r = await renderPng(nodeId);
    if (r) await deliver(r.dataUrl, filename, "image/png");
  } catch (e) {
    console.error("exportRecapPng:", e);
    toast("No se pudo generar el PNG.", "error");
  }
}

export async function exportRecapPdf(nodeId: string, filename: string): Promise<void> {
  try {
    const r = await renderPng(nodeId);
    if (!r) return;
    // PDF a la medida del panel (portrait), imagen a página completa.
    const doc = new jsPDF({ orientation: r.h >= r.w ? "portrait" : "landscape", unit: "px", format: [r.w, r.h] });
    doc.addImage(r.dataUrl, "PNG", 0, 0, r.w, r.h);
    if (Capacitor.isNativePlatform()) {
      const base64 = doc.output("datauristring").split(",")[1];
      const res = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
      try { await Share.share({ title: "Nexus L4 — Recap", url: res.uri }); } catch { /* cancel ok */ }
    } else {
      doc.save(filename);
    }
    toast(`✅ PDF listo: ${filename}`);
  } catch (e) {
    console.error("exportRecapPdf:", e);
    toast("No se pudo generar el PDF.", "error");
  }
}
