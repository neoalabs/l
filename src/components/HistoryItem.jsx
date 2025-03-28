import React from "react";
import { Link, useLocation } from "react-router-dom";
import { formatDate, cn } from "../lib/utils";

export function HistoryItem({ chat }) {
  const location = useLocation();
  const isActive = location.pathname === chat.path;

  return (
    <Link
      to={chat.path}
      className={cn(
        "flex flex-col hover:bg-muted cursor-pointer p-2 rounded border",
        isActive ? "bg-muted/70 border-border" : "border-transparent"
      )}
    >
      <div className="text-xs font-medium truncate select-none">
        {chat.title}
      </div>
      <div className="text-xs text-muted-foreground">
        {formatDate(chat.createdAt)}
      </div>
    </Link>
  );
}