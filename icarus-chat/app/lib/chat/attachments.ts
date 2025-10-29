export async function toFilesFromUiParts(parts: any[]): Promise<File[]> {
    const out: File[] = [];
    for (const p of parts) {
      try {
        if (p?.file instanceof File) { out.push(p.file); continue; }
        if (typeof p?.getFile === "function") {
          const f = await p.getFile(); if (f instanceof File) { out.push(f); continue; }
        }
        if (p?.blob instanceof Blob) {
          const name = p?.name || "attachment";
          const type = p?.type || p?.blob?.type || "application/octet-stream";
          out.push(new File([p.blob], name, { type })); continue;
        }
        if (typeof p?.url === "string") {
          const res = await fetch(p.url);
          const blob = await res.blob();
          const name = (() => { try {
            const u = new URL(p.url);
            return p?.name || u.pathname.split("/").pop() || "attachment";
          } catch { return "attachment"; } })();
          out.push(new File([blob], name, { type: blob.type || "application/octet-stream" }));
        }
      } catch { /* swallow & skip */ }
    }
    return out;
  }
  