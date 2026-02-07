'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div 
      className={cn(
        "markdown-preview prose prose-invert max-w-none",
        // Headings
        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h1:text-4xl prose-h1:mb-6 prose-h1:border-b prose-h1:border-border prose-h1:pb-3",
        "prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2",
        "prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8",
        "prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-6",
        // Text
        "prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-foreground prose-em:italic",
        // Links
        "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary/80",
        // Code
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground",
        "prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4",
        "prose-pre:text-sm prose-pre:leading-relaxed",
        // Lists
        "prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4 prose-ul:text-muted-foreground",
        "prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4 prose-ol:text-muted-foreground",
        "prose-li:text-muted-foreground prose-li:my-1",
        "prose-li:marker:text-muted-foreground/70",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:py-1",
        "prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/50 prose-blockquote:rounded-r",
        // Tables
        "prose-table:border-collapse prose-table:w-full prose-table:my-6",
        "prose-th:border prose-th:border-border prose-th:p-3 prose-th:bg-muted prose-th:font-semibold prose-th:text-foreground",
        "prose-td:border prose-td:border-border prose-td:p-3 prose-td:text-muted-foreground",
        "prose-tr:border-border",
        // Horizontal rule
        "prose-hr:border-border prose-hr:my-8",
        // Images
        "prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:my-6",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom checkbox rendering
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              return (
                <input
                  {...props}
                  disabled
                  className="mr-2 align-middle accent-primary cursor-default"
                />
              )
            }
            return <input {...props} />
          },
          // Custom code block rendering
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          // Custom link rendering (open in new tab)
          a: ({ node, children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
