import React, { useState } from "react";
import { History, X } from "lucide-react";
import { Button } from "./ui/Button";
import { HistoryList } from "./HistoryList";
import { cn } from "../lib/utils";

export function HistorySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if history is enabled using the environment variable
  // Default to false if it's not defined to prevent errors
  const enabled = process.env.REACT_APP_ENABLE_HISTORY === "true";

  // If history is disabled, don't render the component
  if (!enabled) {
    return null;
  }

  return (
    <div>
      {/* Toggle Button */}
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <History size={20} />
        <span className="sr-only">History</span>
      </Button>

      {/* Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-64 bg-background p-4 shadow-lg transition-transform duration-300 border-l",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-normal">
            <History size={14} />
            History
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X size={14} />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="h-[calc(100%-3rem)] overflow-auto">
          <HistoryList />
        </div>
      </div>
    </div>
  );
}