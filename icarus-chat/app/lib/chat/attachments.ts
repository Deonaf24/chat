
type UIPart =
  | { file: File }
  | { getFile: () => Promise<File> | File }
  | { blob: Blob; name?: string; type?: string }
  | { url: string; name?: string };

export async function toFilesFromUiParts(parts: UIPart[]): Promise<File[]> {
  const out: File[] = [];
  for (const p of parts) {
    try {
      if ('file' in p && p.file instanceof File) { out.push(p.file); continue; }
      if ('getFile' in p && typeof p.getFile === "function") {
        const f = await p.getFile(); if (f instanceof File) { out.push(f); continue; }
      }
      if ('blob' in p && p.blob instanceof Blob) {
        const name = p.name || "attachment";
        const type = p.type || p.blob.type || "application/octet-stream";
        out.push(new File([p.blob], name, { type })); continue;
      }
      if ('url' in p && typeof p.url === "string") {
        const res = await fetch(p.url);
        const blob = await res.blob();
        const name = (() => {
          try {
            const u = new URL(p.url);
            return p.name || u.pathname.split("/").pop() || "attachment";
          } catch { return "attachment"; }
        })();
        out.push(new File([blob], name, { type: blob.type || "application/octet-stream" }));
      }
    } catch { /* swallow & skip */ }
  }
  return out;
}
