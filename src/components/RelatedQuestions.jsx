import React from "react";
import { ArrowRight, Repeat2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/Collapsible";
import { Separator } from "./ui/Separator";
import { Skeleton } from "./ui/Skeleton";

export function RelatedQuestions({ questions, onQuerySelect, isLoading }) {
  if (isLoading) {
    return (
      <Collapsible className="w-full">
        <div className="flex items-center justify-between w-full">
          <CollapsibleTrigger className="flex items-center gap-1 text-sm bg-secondary rounded-full px-3 py-1 mt-4">
            <Repeat2 size={14} />
            <span className="text-muted-foreground">Related Questions</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Separator className="my-2" />
          <Skeleton className="w-full h-6 my-2" />
          <Skeleton className="w-full h-6 my-2" />
          <Skeleton className="w-full h-6 my-2" />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <Collapsible className="w-full">
      <div className="flex items-center justify-between w-full">
        <CollapsibleTrigger className="flex items-center gap-1 text-sm bg-secondary rounded-full px-3 py-1 mt-4">
          <Repeat2 size={14} />
          <span className="text-muted-foreground">Related Questions</span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <Separator className="my-2" />
        <div className="flex flex-wrap">
          {questions.map((question, index) => (
            <div className="flex items-start w-full" key={index}>
              <ArrowRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-accent-foreground/50" />
              <Button
                variant="link"
                className="flex-1 justify-start px-0 py-1 h-fit font-medium text-accent-foreground/70 whitespace-normal text-left"
                onClick={() => onQuerySelect(question)}
              >
                {question}
              </Button>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}