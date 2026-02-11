"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ResponseProps = {
  children: string;
  className?: string;
};

export const Response = memo(
  ({ className, children }: ResponseProps) => (
    <div className={cn(
      "prose prose-base dark:prose-invert max-w-none break-words",
      // Prose customizations for chat
      "prose-p:leading-relaxed prose-pre:p-0",
      "prose-headings:font-semibold prose-headings:tracking-tight",
      "prose-h1:text-xl prose-h1:mb-2 prose-h1:mt-4",
      "prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4",
      "prose-h3:text-base prose-h3:mb-1 prose-h3:mt-3",
      "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4",
      "prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4",
      "prose-li:my-0.5",
      "prose-strong:font-bold prose-strong:text-foreground",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => <h1 className={cn("mb-2 mt-6 text-2xl font-bold tracking-tight text-foreground", className)} {...props} />,
          h2: ({ className, ...props }) => <h2 className={cn("mb-2 mt-6 text-xl font-semibold tracking-tight text-foreground", className)} {...props} />,
          h3: ({ className, ...props }) => <h3 className={cn("mb-1 mt-4 text-lg font-semibold tracking-tight text-foreground", className)} {...props} />,
          h4: ({ className, ...props }) => <h4 className={cn("mb-1 mt-4 text-base font-semibold tracking-tight text-foreground", className)} {...props} />,
          p: ({ className, ...props }) => <p className={cn("leading-7 [&:not(:first-child)]:mt-4 text-foreground", className)} {...props} />,
          ul: ({ className, ...props }) => <ul className={cn("my-6 list-disc pl-6 text-foreground", className)} {...props} />,
          ol: ({ className, ...props }) => <ol className={cn("my-6 list-decimal pl-6 text-foreground", className)} {...props} />,
          li: ({ className, ...props }) => <li className={cn("mt-2 text-foreground", className)} {...props} />,
          strong: ({ className, ...props }) => <strong className={cn("font-bold text-foreground", className)} {...props} />,
          blockquote: ({ className, ...props }) => <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground", className)} {...props} />,
          code({ children, className, ...props }) {
            return (
              <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground", className)} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return (
              <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4 text-sm font-semibold text-foreground">
                {children}
              </pre>
            );
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
