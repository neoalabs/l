import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";
import { Search } from "lucide-react";
import { Button } from "./ui/Button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/Collapsible";
import { Separator } from "./ui/Separator";

export function SearchResults({ results, query }) {
  const [showAllResults, setShowAllResults] = useState(false);
  
  if (!results || results.length === 0) {
    return null;
  }
  
  const displayedResults = showAllResults ? results : results.slice(0, 4);
  const additionalResultsCount = results.length > 4 ? results.length - 4 : 0;
  
  const displayUrlName = (url) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      return parts.length > 2 ? parts.slice(1, -1).join('.') : parts[0];
    } catch (e) {
      return url;
    }
  };
  
  return (
    <Collapsible className="w-full">
      <div className="flex items-center justify-between w-full">
        <CollapsibleTrigger className="flex items-center gap-1 text-sm bg-secondary rounded-full px-3 py-1 mb-2">
          <Search size={14} />
          <span className="text-muted-foreground">Search Results ({results.length})</span>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <Separator className="my-2" />
        <div className="flex flex-wrap">
          {displayedResults.map((result, index) => (
            <div className="w-1/2 md:w-1/4 p-1" key={index}>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="border rounded-lg p-2 h-full hover:bg-accent transition-colors flex flex-col justify-between">
                  <p className="text-xs line-clamp-2 min-h-[2rem] font-medium">
                    {result.title || result.content}
                  </p>
                  <div className="mt-2 flex items-center space-x-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={`https://www.google.com/s2/favicons?domain=${
                          new URL(result.url).hostname
                        }`}
                        alt={new URL(result.url).hostname}
                      />
                      <AvatarFallback className="text-[8px]">
                        {displayUrlName(result.url).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs opacity-60 truncate">
                      {`${displayUrlName(result.url)} - ${index + 1}`}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
          
          {!showAllResults && additionalResultsCount > 0 && (
            <div className="w-1/2 md:w-1/4 p-1">
              <div className="border rounded-lg p-2 h-full flex items-center justify-center">
                <Button
                  variant="link"
                  className="text-muted-foreground"
                  onClick={() => setShowAllResults(true)}
                >
                  View {additionalResultsCount} more
                </Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}