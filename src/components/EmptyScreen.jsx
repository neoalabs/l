import React from "react";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const exampleMessages = [
  {
    heading: "What is Gemini AI?",
    message: "What is Gemini AI?"
  },
  {
    heading: "Compare React vs Angular",
    message: "Compare React vs Angular for frontend development"
  },
  {
    heading: "Tesla vs Rivian",
    message: "Compare Tesla and Rivian electric vehicles"
  },
  {
    heading: "Summarize this URL: https://en.wikipedia.org/wiki/Artificial_intelligence",
    message: "Summarize this URL: https://en.wikipedia.org/wiki/Artificial_intelligence"
  }
];

export function EmptyScreen({ submitMessage, className }) {
  return (
    <div className={`mx-auto max-w-2xl text-center mt-8 transition-all ${className}`}>
      <div className="flex justify-center mb-4">
        <Logo className="size-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Gemini Search</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Ask questions, get answers, and explore the web with AI
      </p>
      
      <div className="mt-8 p-4 bg-background rounded-lg">
        <h2 className="text-sm font-medium mb-3">Try these examples</h2>
        <div className="grid gap-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-2 justify-start text-sm hover:bg-muted"
              onClick={() => submitMessage(message.message)}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}