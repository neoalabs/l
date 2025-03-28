import React from "react";
import { UserCircle } from "lucide-react";

export function UserMessage({ message }) {
  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className="mt-[10px] w-5">
          <UserCircle size={20} className="text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 rounded-2xl px-4">
        <div className="py-2 flex-1 break-words w-full">
          {message}
        </div>
      </div>
    </div>
  );
}