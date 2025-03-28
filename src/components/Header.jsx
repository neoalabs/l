import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { HistorySidebar } from "./HistorySidebar";

export function Header() {
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur bg-background/80 border-b border-border/40">
      <div>
        <Link to="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent/30 transition-colors">
          <Logo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-tight">NEOA</span>
            <span className="text-xs text-muted-foreground leading-tight">Powered by Google Gemini</span>
          </div>
        </Link>
      </div>
      <div className="flex gap-1">
        <ThemeToggle />
        <HistorySidebar />
      </div>
    </header>
  );
}