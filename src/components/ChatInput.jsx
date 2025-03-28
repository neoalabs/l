import React, { useRef, useState } from "react";
import { ArrowUp, MessageCirclePlus, Square, Search, BookOpen } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import { ResearchModal } from "./ResearchModal";

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
  onNewChat,
  hasMessages,
  onResearchComplete,
}) {
  const [isComposing, setIsComposing] = useState(false);
  const [enterDisabled, setEnterDisabled] = useState(false);
  const [searchModeEnabled, setSearchModeEnabled] = useState(true);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
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

  const openResearchModal = () => {
    if (input.trim()) {
      setIsResearchModalOpen(true);
    }
  };

  const closeResearchModal = () => {
    setIsResearchModalOpen(false);
  };

  const handleResearchSendToChat = (report) => {
    // This will send the research report as a user message
    const userQuery = input;
    const fakeEvent = { preventDefault: () => {} };
    
    // Submit the user's question first
    handleSubmit(fakeEvent, false);
    
    // Wait a moment then send the research report as a bot message
    setTimeout(() => {
      if (onResearchComplete) {
        onResearchComplete(report);
      }
    }, 500);
  };

  return (
    <>
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
              <Button
                type="button"
                size="sm"
                variant={searchModeEnabled ? "accent-blue" : "outline"}
                onClick={() => setSearchModeEnabled(!searchModeEnabled)}
                className="gap-1.5 px-3 py-1 rounded-full h-8 transition-colors duration-200"
              >
                <Search className="size-3.5" />
                <span className="text-xs">Web Search</span>
              </Button>
              
              {/* Deep Research Button */}
              {input.trim().length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openResearchModal}
                  className="gap-1.5 px-3 py-1 rounded-full h-8 transition-colors duration-200"
                >
                  <BookOpen className="size-3.5" />
                  <span className="text-xs">Deep Research</span>
                </Button>
              )}
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

      {/* Research Modal */}
      {isResearchModalOpen && (
        <ResearchModal
          isOpen={isResearchModalOpen}
          onClose={closeResearchModal}
          query={input}
          onSendToChat={handleResearchSendToChat}
        />
      )}
    </>
  );
}