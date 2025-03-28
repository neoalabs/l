import React, { useEffect, useState } from "react";
import { HistoryItem } from "./HistoryItem";
import { getChats, clearChats } from "../lib/api/historyService";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Trash2 } from "lucide-react";

export function HistoryList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      setLoading(true);
      const result = await getChats();
      setChats(result || []);
      setLoading(false);
    }

    loadChats();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
      await clearChats();
      setChats([]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 space-y-1.5 overflow-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
        {!chats?.length ? (
          <div className="text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          chats.map(
            (chat) => chat && <HistoryItem key={chat.id} chat={chat} />
          )
        )}
      </div>
      <div className="mt-auto">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleClearHistory}
          disabled={!chats?.length}
        >
          <Trash2 size={14} />
          Clear History
        </Button>
      </div>
    </div>
  );
}