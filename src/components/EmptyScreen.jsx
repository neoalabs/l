import React from "react";
import { Button } from "./ui/Button";
import { ArrowRight, BookOpen, Zap, Search } from "lucide-react";
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
      <h1 className="text-2xl font-bold tracking-tight">NEOA</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Ask questions, get answers, and explore the web with AI
      </p>
      
      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-background border rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Search className="size-6 text-primary" />
          </div>
          <h3 className="font-medium text-sm mb-1">Web Search</h3>
          <p className="text-xs text-muted-foreground">
            Instantly search the web for up-to-date information
          </p>
        </div>
        
        <div className="bg-background border rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <BookOpen className="size-6 text-blue-500" />
          </div>
          <h3 className="font-medium text-sm mb-1">Deep Research</h3>
          <p className="text-xs text-muted-foreground">
            Conduct comprehensive research on complex topics
          </p>
        </div>
        
        <div className="bg-background border rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Zap className="size-6 text-amber-500" />
          </div>
          <h3 className="font-medium text-sm mb-1">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Get insightful answers powered by Gemini AI
          </p>
        </div>
      </div>
      
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
      
      {/* New Deep Research Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-sm font-medium mb-2 flex items-center justify-center gap-2">
          <BookOpen size={14} />
          <span>New: Deep Research Mode</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          For complex topics, type your query and click "Deep Research" to get comprehensive, 
          fact-based information from multiple sources.
        </p>
      </div>
    </div>
  );
}