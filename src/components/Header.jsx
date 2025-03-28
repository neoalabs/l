import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { HistorySidebar } from "./HistorySidebar";

export function Header() {
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      <div>
        <Link to="/" className="flex items-center">
          <Logo className="w-5 h-5" />
          <span className="ml-2 font-semibold text-foreground">Gemini Search</span>
        </Link>
      </div>
      <div className="flex gap-0.5">
        <ThemeToggle />
        <HistorySidebar />
      </div>
    </header>
  );
}