import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateId } from "../lib/utils";
import { UserMessage } from "./UserMessage";
import { BotMessage } from "./BotMessage";
import { SearchResults } from "./SearchResults";
import { RelatedQuestions } from "./RelatedQuestions";
import { ChatInput } from "./ChatInput";
import { EmptyScreen } from "./EmptyScreen";
import { search } from "../lib/api/searchApi";
import { generateResponse, generateRelatedQuestions } from "../lib/api/aiService";
import { getChat, saveChat } from "../lib/api/historyService";

export function Chat({ initialQuery = null }) {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(chatId || generateId());

  // Process the query - search and generate response
  const processQuery = useCallback(async (query, searchModeEnabled = true) => {
    setIsLoading(true);
    setSearchResults(null);
    setRelatedQuestions([]);
    
    try {
      // Perform search if search mode is enabled
      let searchData = null;
      if (searchModeEnabled) {
        searchData = await search(query, 8, "basic");
        setSearchResults(searchData);
      }
      
      // Generate AI response
      const allMessages = [...messages, { role: "user", content: query }];
      const aiResponse = await generateResponse(allMessages, searchData);
      
      // Add AI response to messages
      const aiMessage = { role: "assistant", content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
      
      // Generate related questions
      setLoadingRelated(true);
      const related = await generateRelatedQuestions(query);
      setRelatedQuestions(related);
      
      // Save chat to history
      const title = allMessages[0].content.slice(0, 50);
      await saveChat({
        id: sessionId.current,
        title,
        messages: [...allMessages, aiMessage],
        createdAt: new Date(),
        userId: "anonymous",
        path: `/chat/${sessionId.current}`
      });
      
      // Update URL with chat ID
      if (window.location.pathname === "/") {
        navigate(`/chat/${sessionId.current}`, { replace: true });
      }
    } catch (error) {
      console.error("Error processing query:", error);
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingRelated(false);
    }
  }, [messages, navigate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e, searchModeEnabled = true) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    await processQuery(input, searchModeEnabled);
  }, [input, processQuery]);

  // Handle search from initial query
  const handleSearch = useCallback(async (query, isInitial = false) => {
    setInput(query);
    if (isInitial) {
      await handleSubmit({ preventDefault: () => {} }, true);
    }
  }, [handleSubmit]);

  // Initial setup and loading saved chat if chatId is provided
  useEffect(() => {
    const fetchChat = async () => {
      if (chatId) {
        const chat = await getChat(chatId);
        if (chat) {
          setMessages(chat.messages);
          sessionId.current = chatId;
        } else {
          navigate("/");
        }
      }
    };

    fetchChat();

    // Handle initial query if provided
    if (initialQuery && !chatId) {
      handleSearch(initialQuery, true);
    }
  }, [chatId, initialQuery, navigate, handleSearch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle new chat button click
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setSearchResults(null);
    setRelatedQuestions([]);
    sessionId.current = generateId();
    navigate("/");
  };

  // Handle selecting a related question
  const handleRelatedQuestionSelect = async (query) => {
    setInput("");
    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    await processQuery(query);
  };

  // Render the chat UI
  return (
    <div className="flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch">
      {/* Message Thread */}
      <div className="relative mx-auto px-4 w-full">
        {messages.map((message, index) => (
          <div key={index} className="mb-4 flex flex-col gap-4">
            {message.role === "user" ? (
              <UserMessage message={message.content} />
            ) : (
              <BotMessage message={message.content} />
            )}
            
            {/* Show search results after user messages if available */}
            {message.role === "user" && 
             index === messages.length - 2 && 
             searchResults && (
              <SearchResults 
                results={searchResults.results} 
                query={message.content}
              />
            )}
          </div>
        ))}
        
        {/* Show related questions after the last AI response */}
        {messages.length > 0 && 
         messages[messages.length - 1].role === "assistant" && 
         (relatedQuestions.length > 0 || loadingRelated) && (
          <RelatedQuestions 
            questions={relatedQuestions}
            onQuerySelect={handleRelatedQuestionSelect}
            isLoading={loadingRelated}
          />
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div
        className={
          messages.length > 0
            ? "fixed bottom-0 left-0 right-0 bg-background"
            : "fixed bottom-8 left-0 right-0 top-6 flex flex-col items-center justify-center"
        }
      >
        {messages.length === 0 && (
          <EmptyScreen 
            submitMessage={(message) => {
              setInput(message);
            }}
            className={input.length === 0 ? "visible" : "invisible"}
          />
        )}
        
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onNewChat={handleNewChat}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}