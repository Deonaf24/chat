import { CalendarClock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PreviewableFile } from "@/app/hooks/useFilePreview";

export type AssignmentSidebarProps = {
  title: string;
  description?: string | null;
  formattedDueAt?: string | null;
  files?: PreviewableFile[];
  onFileClick?: (file: PreviewableFile) => void;
};

export function AssignmentSidebar({
  title,
  description,
  formattedDueAt,
  files,
  onFileClick,
}: AssignmentSidebarProps) {
  return (
    <aside className="w-[310px] border-l bg-card/60 p-4 overflow-y-auto shadow-sm min-w-[280px]">
      <div className="flex flex-col items-start text-left gap-3 sticky top-3">
        <div className="flex flex-col items-start gap-2">
          {formattedDueAt ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Due {formattedDueAt}</span>
            </Badge>
          ) : null}
        </div>

        <h1 className="text-xl font-semibold leading-tight">{title}</h1>

        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

        {files?.length ? (
          <div className="flex flex-col items-start gap-2 mt-2">
            {files.map((file) => (
              <Badge
                key={file.id}
                variant="outline"
                className="flex items-center gap-1 cursor-pointer"
                asChild
              >
                <button type="button" onClick={() => onFileClick?.(file)} className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[12rem] text-left">{file.filename}</span>
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
