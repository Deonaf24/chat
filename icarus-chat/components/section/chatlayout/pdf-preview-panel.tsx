import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type PdfPreviewPanelProps = {
  filename?: string;
  previewUrl?: string;
  loading?: boolean;
  error?: string;
  onClose?: () => void;
};

export function PdfPreviewPanel({ filename, previewUrl, loading, error, onClose }: PdfPreviewPanelProps) {
  return (
    <aside className="w-1/2 min-w-[320px] border-l bg-card/60 p-4 overflow-hidden shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <p className="text-sm text-muted-foreground">Previewing</p>
          <p className="font-semibold truncate">{filename ?? "File"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative flex-1 min-h-0 rounded-lg border bg-background">
        {loading ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading preview...</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-destructive">
            <span>{error}</span>
          </div>
        ) : null}

        {previewUrl && !error ? (
          <iframe
            title={filename ?? "PDF preview"}
            src={previewUrl}
            className="h-full w-full rounded-lg"
            allowFullScreen
          />
        ) : null}
      </div>
    </aside>
  );
}
