import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, CheckCircle, Clock, Loader, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { Separator } from "./ui/Separator";
import { cn } from "../lib/utils";
import { search } from "../lib/api/searchApi";
import { generateResponse } from "../lib/api/aiService";

// Deep Research Status states
const RESEARCH_STATUS = {
  IDLE: "idle",
  PLANNING: "planning",
  SEARCHING: "searching",
  ANALYZING: "analyzing",
  COMPILING: "compiling",
  FINALIZING: "finalizing",
  COMPLETE: "complete",
  ERROR: "error"
};

// Research depth levels
const RESEARCH_DEPTH = {
  STANDARD: "standard",
  COMPREHENSIVE: "comprehensive",
  EXHAUSTIVE: "exhaustive"
};

export function DeepResearch({ 
  query, 
  onProgress, 
  onComplete, 
  onError,
  depth = RESEARCH_DEPTH.STANDARD,
  maxSources = 10,
}) {
  const [status, setStatus] = useState(RESEARCH_STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [researchPlan, setResearchPlan] = useState([]);
  const [researchResult, setResearchResult] = useState(null);
  const [error, setError] = useState(null);
  const abortController = useRef(null);
  const isResearchStarted = useRef(false);
  const isMounted = useRef(true);

  // Set up isMounted ref to track component lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe setState functions that check if component is still mounted
  const safeSetStatus = (newStatus) => {
    if (isMounted.current) {
      setStatus(newStatus);
    }
  };

  const safeSetProgress = (newProgress) => {
    if (isMounted.current) {
      setProgress(newProgress);
    }
  };

  const safeSetCurrentStep = (step) => {
    if (isMounted.current) {
      setCurrentStep(step);
    }
  };

  const safeSetSources = (sourcesUpdater) => {
    if (isMounted.current) {
      setSources(sourcesUpdater);
    }
  };

  const safeSetNotes = (notesUpdater) => {
    if (isMounted.current) {
      setNotes(notesUpdater);
    }
  };

  const safeSetResearchPlan = (plan) => {
    if (isMounted.current) {
      setResearchPlan(plan);
    }
  };

  const safeSetResearchResult = (result) => {
    if (isMounted.current) {
      setResearchResult(result);
    }
  };

  const safeSetError = (err) => {
    if (isMounted.current) {
      setError(err);
    }
  };

  // Generate a research plan based on the query
  const generateResearchPlan = async (query) => {
    try {
      const prompt = `I need to conduct deep research on the following topic: "${query}". 
      Please create a detailed research plan with 3-5 main areas to investigate. 
      For each area, suggest specific questions to answer or aspects to explore. 
      Format the response as a JSON array with objects containing 'area' and 'questions' (array) properties.`;
      
      const planResponse = await generateResponse([{role: "user", content: prompt}]);
      
      // Extract JSON from response (handling potential formatting issues)
      let plan = [];
      try {
        // First, try to extract JSON if it's surrounded by ```json and ```
        const jsonMatch = planResponse.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          plan = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find any JSON array in the response
          const arrayMatch = planResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) {
            plan = JSON.parse(arrayMatch[0]);
          } else {
            // Fallback to manual parsing if JSON extraction fails
            plan = manuallyParseResearchPlan(planResponse);
          }
        }
      } catch (e) {
        console.error("Error parsing research plan:", e);
        plan = manuallyParseResearchPlan(planResponse);
      }
      
      return plan;
    } catch (error) {
      console.error("Error generating research plan:", error);
      throw new Error("Failed to generate research plan");
    }
  };

  // Fallback function to manually parse the research plan if JSON parsing fails
  const manuallyParseResearchPlan = (text) => {
    // Create a simple default plan as fallback
    return [
      {
        area: "Main Research",
        questions: ["What are the key aspects of this topic?", "What are the recent developments?"]
      },
      {
        area: "Detailed Analysis",
        questions: ["What are the different perspectives on this topic?", "What are the implications?"]
      }
    ];
  };

  // Conduct research on a specific area
  const researchArea = async (area, questions) => {
    const notes = [];
    
    // For each question in the area, perform a search and analyze results
    for (const question of questions) {
      // Check if aborted or unmounted
      if (!isMounted.current || abortController.current?.signal?.aborted) {
        throw new Error("Research aborted");
      }
      
      safeSetCurrentStep(`Researching: ${question}`);
      
      try {
        // Generate a targeted search query for this question
        const searchQuery = `${query} ${question}`;
        
        // Perform the search
        const searchResults = await search(searchQuery, 
          depth === RESEARCH_DEPTH.EXHAUSTIVE ? 12 : 
          depth === RESEARCH_DEPTH.COMPREHENSIVE ? 8 : 5, 
          depth === RESEARCH_DEPTH.STANDARD ? "basic" : "advanced");
        
        // Track sources
        const newSources = searchResults.results.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content.substring(0, 150) + "..."
        }));
        
        // Update sources safely
        safeSetSources(prev => [...prev, ...newSources]);
        
        // Generate insights from search results
        const analysisPrompt = `Based on the following search results for the question "${question}" related to "${query}", 
        provide a concise but detailed analysis (about 2 paragraphs) that synthesizes the key information. 
        Focus on factual information, different perspectives, and noteworthy insights.
        
        Search Results:
        ${searchResults.results.map((r, i) => `[${i+1}] "${r.title}"
        URL: ${r.url}
        ${r.content}
        `).join('\n')}`;
        
        const analysis = await generateResponse([{role: "user", content: analysisPrompt}]);
        
        // Add this analysis to our notes
        const newNote = {
          question,
          analysis,
          sources: newSources.map(s => s.url)
        };
        
        notes.push(newNote);
        
        // Update notes safely
        safeSetNotes(prev => [...prev, newNote]);
      } catch (error) {
        console.error(`Error researching question "${question}":`, error);
        // Continue with other questions rather than aborting the whole research
        notes.push({
          question,
          analysis: `Unable to complete research for this question due to an error: ${error.message}`,
          sources: []
        });
      }
    }
    
    return notes;
  };

  // Compile the final research report
  const compileResearchReport = async (researchPlan, allNotes) => {
    try {
      safeSetCurrentStep("Compiling comprehensive report");
      
      // Prepare a prompt with all our research notes
      const compilationPrompt = `I've conducted deep research on "${query}" and gathered the following notes. 
      Please compile a comprehensive, well-structured research report that synthesizes all this information.
      The report should have an executive summary, an introduction, sections for each research area, 
      a conclusion, and suggestions for further research. 
      Use markdown formatting for headings and structure.
      
      Research Plan:
      ${JSON.stringify(researchPlan)}
      
      Research Notes:
      ${JSON.stringify(allNotes)}`;
      
      const report = await generateResponse([{role: "user", content: compilationPrompt}]);
      
      return report;
    } catch (error) {
      console.error("Error compiling research report:", error);
      throw new Error("Failed to compile research report");
    }
  };

  // Main research execution function
  const executeResearch = async () => {
    if (status !== RESEARCH_STATUS.IDLE || isResearchStarted.current) return;
    
    isResearchStarted.current = true;
    abortController.current = new AbortController();
    
    try {
      // Reset state
      safeSetStatus(RESEARCH_STATUS.PLANNING);
      safeSetProgress(5);
      safeSetCurrentStep("Planning research approach");
      safeSetSources([]);
      safeSetNotes([]);
      safeSetError(null);
      
      // Check if component is still mounted
      if (!isMounted.current) {
        throw new Error("Component unmounted");
      }
      
      // Generate a research plan
      const plan = await generateResearchPlan(query);
      safeSetResearchPlan(plan);
      safeSetProgress(15);
      
      // Check if component is still mounted
      if (!isMounted.current || abortController.current.signal.aborted) {
        throw new Error("Research aborted");
      }
      
      // Execute research for each area
      safeSetStatus(RESEARCH_STATUS.SEARCHING);
      const allNotes = [];
      
      // Calculate progress increments
      const searchProgressIncrement = 50 / Math.max(plan.length, 1);
      
      for (let i = 0; i < plan.length; i++) {
        // Check if component is still mounted or if research was aborted
        if (!isMounted.current || abortController.current.signal.aborted) {
          throw new Error("Research aborted");
        }
        
        const { area, questions } = plan[i];
        safeSetCurrentStep(`Researching area: ${area}`);
        
        try {
          const areaNotes = await researchArea(area, questions);
          allNotes.push({ area, notes: areaNotes });
          
          safeSetProgress(prev => Math.min(65, 15 + (i + 1) * searchProgressIncrement));
        } catch (error) {
          console.error(`Error researching area "${area}":`, error);
          // Add an error note but continue with other areas
          allNotes.push({ 
            area, 
            notes: [{ 
              question: "Error", 
              analysis: `Unable to complete research for this area due to an error: ${error.message}`, 
              sources: [] 
            }] 
          });
        }
      }
      
      // Check if we have any research data
      if (allNotes.length === 0) {
        throw new Error("No research data could be collected");
      }
      
      // Check if component is still mounted or if research was aborted
      if (!isMounted.current || abortController.current.signal.aborted) {
        throw new Error("Research aborted");
      }
      
      // Analyze and compile findings
      safeSetStatus(RESEARCH_STATUS.ANALYZING);
      safeSetProgress(70);
      safeSetCurrentStep("Analyzing research findings");
      
      // Compile final report
      safeSetStatus(RESEARCH_STATUS.COMPILING);
      safeSetProgress(85);
      const report = await compileResearchReport(plan, allNotes);
      
      // Check if component is still mounted or if research was aborted
      if (!isMounted.current || abortController.current.signal.aborted) {
        throw new Error("Research aborted");
      }
      
      // Finalize
      safeSetStatus(RESEARCH_STATUS.FINALIZING);
      safeSetProgress(95);
      safeSetCurrentStep("Finalizing research report");
      
      // Complete research
      safeSetResearchResult(report);
      safeSetStatus(RESEARCH_STATUS.COMPLETE);
      safeSetProgress(100);
      safeSetCurrentStep("Research complete");
      
      if (onComplete && isMounted.current) {
        onComplete({
          query,
          report,
          sources: sources.slice(0, maxSources),
          plan,
          notes: allNotes
        });
      }
      
    } catch (error) {
      console.error("Research error:", error);
      
      // Only set error state if component is still mounted
      if (isMounted.current) {
        safeSetError(error.message || "An unknown error occurred");
        safeSetStatus(RESEARCH_STATUS.ERROR);
        
        if (onError) {
          onError(error);
        }
      }
    } finally {
      isResearchStarted.current = false;
    }
  };

  // Abort ongoing research
  const abortResearch = () => {
    if (abortController.current) {
      abortController.current.abort();
      safeSetStatus(RESEARCH_STATUS.ERROR);
      safeSetError("Research was canceled");
    }
  };

  // Update progress callback - with throttling to avoid too many updates
  useEffect(() => {
    if (onProgress && isMounted.current) {
      const throttledCallback = setTimeout(() => {
        if (isMounted.current) {
          onProgress({
            status,
            progress,
            currentStep,
            sources: sources.length
          });
        }
      }, 300);
      
      return () => clearTimeout(throttledCallback);
    }
  }, [status, progress, currentStep, sources.length, onProgress]);

  // Trigger research once when component mounts
  useEffect(() => {
    let timeoutId = null;
    
    if (query) {
      // Delay starting research slightly to ensure component is fully mounted
      timeoutId = setTimeout(() => {
        if (isMounted.current && status === RESEARCH_STATUS.IDLE && !isResearchStarted.current) {
          executeResearch();
        }
      }, 100);
    }
    
    return () => {
      // Clean up on unmount
      isMounted.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Deep Research</h3>
          {status !== RESEARCH_STATUS.COMPLETE && status !== RESEARCH_STATUS.ERROR && (
            <Button
              size="sm"
              variant="outline"
              onClick={abortResearch}
              className="text-destructive"
            >
              Cancel Research
            </Button>
          )}
        </div>
        
        {/* Research Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full mb-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              status === RESEARCH_STATUS.ERROR ? "bg-destructive" : "bg-primary"
            )} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Status Display */}
        <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          {status === RESEARCH_STATUS.PLANNING && <Clock size={14} />}
          {(status === RESEARCH_STATUS.SEARCHING || status === RESEARCH_STATUS.ANALYZING) && <Loader size={14} className="animate-spin" />}
          {status === RESEARCH_STATUS.COMPILING && <FileText size={14} />}
          {status === RESEARCH_STATUS.COMPLETE && <CheckCircle size={14} className="text-green-500" />}
          {status === RESEARCH_STATUS.ERROR && <span className="text-destructive">✖</span>}
          <span>{currentStep}</span>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="text-destructive text-sm mb-4">
            Error: {error}
          </div>
        )}
      </div>
      
      {/* Sources found display */}
      {sources.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Sources Found: {sources.length}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {sources.slice(0, maxSources).map((source, index) => (
              <a 
                key={index} 
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs p-2 border rounded-md hover:bg-accent truncate text-primary"
              >
                {source.title || "Untitled Source"}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Research Areas */}
      {researchPlan.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Research Plan</h4>
          <div className="space-y-2">
            {researchPlan.map((area, index) => (
              <div key={index} className="text-xs p-2 border rounded-md">
                <div className="font-medium">{area.area}</div>
                <div className="text-muted-foreground mt-1">
                  {area.questions.slice(0, 2).map((q, i) => (
                    <div key={i} className="flex items-start">
                      <ArrowRight size={10} className="mr-1 mt-1 text-muted-foreground/70" />
                      <span>{q}</span>
                    </div>
                  ))}
                  {area.questions.length > 2 && (
                    <div className="text-muted-foreground/60 mt-1">
                      +{area.questions.length - 2} more questions
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const ResearchResults = ({ results, onUseInChat }) => {
  if (!results) return null;
  
  const { report, sources } = results;
  
  return (
    <div className="border rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Research Report</h3>
        <Button 
          variant="accent-blue"
          onClick={() => onUseInChat(report)}
        >
          Use in Chat
        </Button>
      </div>
      
      <Separator className="mb-4" />
      
      <div className="max-h-96 overflow-y-auto prose prose-sm dark:prose-invert">
        <div className="whitespace-pre-line">
          {report.substring(0, 500)}...
        </div>
        <div className="mt-4 text-primary cursor-pointer" onClick={() => onUseInChat(report)}>
          View full report in chat
        </div>
      </div>
      
      {sources && sources.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h4 className="font-medium mb-2 text-sm">Sources ({sources.length})</h4>
            <div className="flex flex-wrap gap-2">
              {sources.slice(0, 6).map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs p-2 border rounded-md hover:bg-accent truncate text-primary"
                >
                  {source.title || "Source " + (index + 1)}
                </a>
              ))}
              {sources.length > 6 && (
                <div className="text-xs p-2 text-muted-foreground">
                  +{sources.length - 6} more sources
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};