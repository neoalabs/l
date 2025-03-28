import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import { Logo } from "./Logo";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/Button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export function BotMessage({ message, className }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Message copied to clipboard");
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    toast.success(`Thank you for your ${type === 'like' ? 'positive' : 'negative'} feedback!`);
  };

  return (
    <div className="flex gap-3 group">
      <div className="relative flex flex-col items-center">
        <div className="mt-4 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10">
          <Logo className="size-5" />
        </div>
      </div>
      <div className="flex-1 rounded-2xl px-4 relative">
        <div className="py-2 flex-1">
          <ReactMarkdown
            rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
            className={cn(
              "prose-sm prose-neutral dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-pre:bg-muted",
              className
            )}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");

                if (!inline && match) {
                  return (
                    <div className="relative w-full font-sans codeblock dark:bg-zinc-800 bg-zinc-100 rounded-md my-2 shadow-sm">
                      <div className="flex items-center justify-between w-full px-6 py-1 pr-4 dark:bg-zinc-900 bg-zinc-200 text-zinc-700 dark:text-zinc-200 rounded-t-md">
                        <span className="text-xs font-mono">{match[1]}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-xs focus-visible:ring-1 focus-visible:ring-offset-0"
                          onClick={() => 
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ""))
                              .then(() => toast.success("Code copied to clipboard"))
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
                  <code className={cn("bg-muted px-1 py-0.5 rounded text-sm font-mono", className)} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message}
          </ReactMarkdown>
          
          {/* Actions toolbar */}
          <div className="flex justify-end items-center mt-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Feedback buttons */}
            <div className="flex gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback('like')}
                className={cn(
                  "rounded-full w-7 h-7",
                  feedback === 'like' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                )}
              >
                <ThumbsUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback('dislike')}
                className={cn(
                  "rounded-full w-7 h-7",
                  feedback === 'dislike' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                <ThumbsDown size={14} />
              </Button>
            </div>
            
            {/* Copy button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="rounded-full w-7 h-7"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}