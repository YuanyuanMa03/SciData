import { Link } from "react-router-dom";

import { cn } from "../../lib/utils";

export interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="SciData home"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 grid-cols-2 grid-rows-2 gap-1 text-accent"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="rounded-[3px] border-[1.5px] border-current" />
        ))}
      </span>
      {compact ? null : <span className="text-[1.4rem] sm:text-[1.7rem]">SciData</span>}
    </Link>
  );
}
