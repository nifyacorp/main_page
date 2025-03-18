import React from "react";
import { cn } from "../../lib/utils";

/**
 * Skeleton component for showing loading states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props - HTML div attributes
 * @returns {JSX.Element} - Skeleton component
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50", 
        className
      )}
      {...props}
    />
  );
}