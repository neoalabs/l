import React from "react";
import { cn } from "../lib/utils";

function Logo({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill="currentColor"></circle>
      <circle cx="9" cy="12" r="1.5" fill="white"></circle>
      <circle cx="15" cy="12" r="1.5" fill="white"></circle>
    </svg>
  );
}

export { Logo };