import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import { Logo } from "./Logo";
import { Copy } from "lucide-react";
import { Button } from "./ui/Button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../lib/utils";

export function BotMessage({ message, className }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    // You could add a toast notification here
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className="mt-4 w-5">
          <Logo className="size-5" />
        </div>
      </div>
      <div className="flex-1 rounded-2xl px-4">
        <div className="py-2 flex-1">
          <ReactMarkdown
            rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
            className={cn(
              "prose-sm prose-neutral prose-a:text-accent-foreground/50",
              className
            )}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");

                if (!inline && match) {
                  return (
                    <div className="relative w-full font-sans codeblock bg-neutral-800 rounded-md my-2">
                      <div className="flex items-center justify-between w-full px-6 py-1 pr-4 bg-neutral-700 text-zinc-100 rounded-t-md">
                        <span className="text-xs lowercase">{match[1]}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-xs focus-visible:ring-1 focus-visible:ring-offset-0"
                          onClick={() => 
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ""))
                          }
                        >
                          <Copy className="w-4 h-4" />
                          <span className="sr-only">Copy code</span>
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        language={(match && match[1]) || ""}
                        style={coldarkDark}
                        PreTag="div"
                        showLineNumbers
                        customStyle={{
                          margin: 0,
                          width: "100%",
                          background: "transparent",
                          padding: "1.5rem 1rem",
                          borderRadius: "0 0 0.5rem 0.5rem"
                        }}
                        lineNumberStyle={{
                          userSelect: "none",
                          paddingRight: "1em",
                          color: "#6b7280"
                        }}
                        codeTagProps={{
                          style: {
                            fontSize: "0.9rem"
                          }
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message}
          </ReactMarkdown>
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="rounded-full w-8 h-8"
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}