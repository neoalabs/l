import React, { useRef, useState } from "react";
import { ArrowUp, MessageCirclePlus, Square, Globe } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import { Toggle } from "@radix-ui/react-toggle";

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
  onNewChat,
  hasMessages,
}) {
  const [isComposing, setIsComposing] = useState(false);
  const [enterDisabled, setEnterDisabled] = useState(false);
  const [searchModeEnabled, setSearchModeEnabled] = useState(true);
  const inputRef = useRef(null);

  const handleCompositionStart = () => setIsComposing(true);

  const handleCompositionEnd = () => {
    setIsComposing(false);
    setEnterDisabled(true);
    setTimeout(() => {
      setEnterDisabled(false);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isComposing &&
      !enterDisabled
    ) {
      if (input.trim().length === 0) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      e.target.form.requestSubmit();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e, searchModeEnabled);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "max-w-3xl w-full mx-auto",
        hasMessages ? "px-2 py-4" : "px-6"
      )}
    >
      <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
        <TextareaAutosize
          ref={inputRef}
          name="input"
          rows={1}
          maxRows={5}
          tabIndex={0}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="Ask a question..."
          spellCheck={false}
          value={input}
          className="resize-none w-full min-h-12 bg-transparent border-0 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Bottom menu area */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Toggle
              aria-label="Toggle search mode"
              pressed={searchModeEnabled}
              onPressedChange={setSearchModeEnabled}
              className={cn(
                "gap-1 px-3 border border-input text-muted-foreground bg-background rounded-full",
                "data-[state=on]:bg-accent-blue",
                "data-[state=on]:text-accent-blue-foreground",
                "data-[state=on]:border-accent-blue-border",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Globe className="size-4" />
              <span className="text-xs">Search</span>
            </Toggle>
          </div>
          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button
                variant="outline"
                size="icon"
                onClick={onNewChat}
                className="shrink-0 rounded-full group"
                type="button"
                disabled={isLoading}
              >
                <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
              </Button>
            )}
            <Button
              type={isLoading ? "button" : "submit"}
              size="icon"
              variant="outline"
              className={cn(isLoading && "animate-pulse", "rounded-full")}
              disabled={input.length === 0 && !isLoading}
              onClick={isLoading ? () => {} : undefined}
            >
              {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}