import React from "react";
import { Button } from "./ui/Button";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-fit p-1 md:p-2 fixed bottom-0 right-0 hidden lg:block">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground/50"
          onClick={() => 
            window.open("https://github.com/yourusername/ai-search-engine", "_blank")
          }
        >
          <Github size={18} />
        </Button>
      </div>
    </footer>
  );
}