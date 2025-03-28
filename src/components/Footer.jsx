import React from "react";
import { Button } from "./ui/Button";
import { Github, Heart, Coffee, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full p-4 border-t border-border/40 mt-auto">
      <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart size={14} className="mx-1 text-red-500" />
          <span>using React and Gemini API</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => 
              window.open("https://github.com/yourusername/gemini-search", "_blank")
            }
          >
            <Github size={14} />
            <span>GitHub</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => 
              window.open("https://ai.google.dev/", "_blank")
            }
          >
            <ExternalLink size={14} />
            <span>Gemini API</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => 
              window.open("https://www.buymeacoffee.com/yourusername", "_blank")
            }
          >
            <Coffee size={14} />
            <span>Buy me a coffee</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}