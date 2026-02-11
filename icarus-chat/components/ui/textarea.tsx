import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onChange, value, ...props }, forwardedRef) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge internal ref with forwarded ref
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        console.log("[DEBUG Textarea setRefs] node:", node, "forwardedRef:", forwardedRef);
        internalRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    React.useEffect(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        data-slot="textarea"
        ref={setRefs}
        rows={2}
        value={value}
        onChange={(e) => {
          // adjust height immediately on change
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
          onChange?.(e);
        }}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-[52px] w-full resize-none overflow-hidden rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea }

