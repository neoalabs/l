import React, { useState, useEffect } from "react";
import { X, Search, BookOpen, Zap, ZapOff } from "lucide-react";
import { Button } from "./ui/Button";
import { Separator } from "./ui/Separator";
import { DeepResearch, ResearchResults } from "./DeepResearch";
import { cn } from "../lib/utils";

// Using a simpler approach without the Dialog component from Radix UI
export function ResearchModal({ 
  isOpen, 
  onClose, 
  query, 
  onComplete,
  onSendToChat 
}) {
  // Separate modal visibility state from props to prevent render loops
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [researchDepth, setResearchDepth] = useState("standard");
  const [maxSources, setMaxSources] = useState(10);
  const [inProgress, setInProgress] = useState(false);
  const [researchProgress, setResearchProgress] = useState(null);
  const [researchResults, setResearchResults] = useState(null);
  const [researchError, setResearchError] = useState(null);
  
  // Sync modal visibility with props
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
    }
  }, [isOpen]);
  
  const handleStartResearch = () => {
    setInProgress(true);
    setResearchResults(null);
    setResearchError(null);
    setActiveTab("progress");
  };
  
  const handleResearchProgress = (progress) => {
    setResearchProgress(progress);
  };
  
  const handleResearchComplete = (results) => {
    setResearchResults(results);
    setActiveTab("results");
    setInProgress(false);
    
    if (onComplete) {
      onComplete(results);
    }
  };
  
  const handleResearchError = (error) => {
    setResearchError(error);
    setInProgress(false);
  };
  
  const handleUseInChat = (report) => {
    if (onSendToChat) {
      onSendToChat(report);
    }
    handleClose();
  };
  
  const handleClose = () => {
    if (inProgress) {
      if (window.confirm("Research is still in progress. Are you sure you want to cancel?")) {
        setModalVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300);
      }
    } else {
      setModalVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }
  };
  
  if (!modalVisible) return null;
  
  // Custom modal implementation instead of using Radix UI Dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>
      
      {/* Modal Content */}
      <div className="bg-background border rounded-lg shadow-lg z-10 w-full max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col p-6 relative">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen size={18} />
              Deep Research
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X size={18} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Conduct in-depth research on your query to get comprehensive, factual information
          </p>
          <div className="mt-2 p-3 bg-accent/30 rounded-md text-sm">
            <span className="font-medium">Query: </span>
            {query}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b mb-4">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeTab === "settings" 
                  ? "border-b-2 border-primary" 
                  : "text-muted-foreground"
              )}
              onClick={() => !inProgress && setActiveTab("settings")}
              disabled={inProgress}
            >
              Settings
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeTab === "progress" 
                  ? "border-b-2 border-primary" 
                  : "text-muted-foreground"
              )}
              onClick={() => setActiveTab("progress")}
            >
              Progress
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeTab === "results" 
                  ? "border-b-2 border-primary" 
                  : "text-muted-foreground"
              )}
              onClick={() => researchResults && setActiveTab("results")}
              disabled={!researchResults}
            >
              Results
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Research Depth</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className={cn(
                        "cursor-pointer border rounded-md p-3 text-center transition-colors",
                        researchDepth === "standard" 
                          ? "border-primary bg-primary/10" 
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setResearchDepth("standard")}
                    >
                      <div className="flex justify-center mb-2">
                        <Search size={20} />
                      </div>
                      <div className="font-medium text-sm">Standard</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ~2 min, basic research
                      </div>
                    </div>
                    
                    <div
                      className={cn(
                        "cursor-pointer border rounded-md p-3 text-center transition-colors",
                        researchDepth === "comprehensive" 
                          ? "border-primary bg-primary/10" 
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setResearchDepth("comprehensive")}
                    >
                      <div className="flex justify-center mb-2">
                        <BookOpen size={20} />
                      </div>
                      <div className="font-medium text-sm">Comprehensive</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ~4 min, detailed analysis
                      </div>
                    </div>
                    
                    <div
                      className={cn(
                        "cursor-pointer border rounded-md p-3 text-center transition-colors",
                        researchDepth === "exhaustive" 
                          ? "border-primary bg-primary/10" 
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setResearchDepth("exhaustive")}
                    >
                      <div className="flex justify-center mb-2">
                        <Zap size={20} />
                      </div>
                      <div className="font-medium text-sm">Exhaustive</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ~7 min, thorough research
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Maximum Sources</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map(num => (
                      <Button
                        key={num}
                        variant={maxSources === num ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setMaxSources(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    The maximum number of sources to include in the final report. More sources may take longer but will provide more comprehensive information.
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleStartResearch}>
                    Start Research
                  </Button>
                </div>
              </div>
            )}
            
            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-4">
                {inProgress ? (
                  <DeepResearch
                    query={query}
                    depth={researchDepth}
                    maxSources={maxSources}
                    onProgress={handleResearchProgress}
                    onComplete={handleResearchComplete}
                    onError={handleResearchError}
                  />
                ) : researchError ? (
                  <div className="text-center py-8">
                    <div className="text-destructive mb-2">
                      <ZapOff size={40} className="mx-auto mb-4" />
                      <h3 className="text-lg font-bold">Research Failed</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {researchError.message || "An unknown error occurred during the research process."}
                    </p>
                    <Button onClick={handleStartResearch}>
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Configure your research parameters and click "Start Research" to begin.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Results Tab */}
            {activeTab === "results" && (
              <div>
                {researchResults ? (
                  <ResearchResults
                    results={researchResults}
                    onUseInChat={handleUseInChat}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Once research is complete, the results will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}