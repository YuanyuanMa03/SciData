import { Search } from "lucide-react";
import { useId, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export interface SearchBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBox({
  value,
  onValueChange,
  onSubmit,
  suggestions = [],
  placeholder = "Search datasets, variables, regions, topics...",
  compact = false,
  autoFocus = false,
  className,
}: SearchBoxProps) {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matchingSuggestions = useMemo(() => {
    const normalizedValue = value.trim().toLocaleLowerCase();

    return suggestions
      .filter((suggestion) => {
        const normalizedSuggestion = suggestion.toLocaleLowerCase();
        return (
          normalizedSuggestion !== normalizedValue &&
          (!normalizedValue || normalizedSuggestion.includes(normalizedValue))
        );
      })
      .slice(0, 6);
  }, [suggestions, value]);

  const showSuggestions = isOpen && matchingSuggestions.length > 0;
  const selectedIndex =
    activeIndex >= matchingSuggestions.length ? -1 : activeIndex;

  function submit(nextValue: string) {
    const normalized = nextValue.trim();
    onSubmit(normalized);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (showSuggestions && selectedIndex >= 0) {
        const suggestion = matchingSuggestions[selectedIndex];
        if (suggestion) {
          onValueChange(suggestion);
          submit(suggestion);
          return;
        }
      }

      submit(value);
      return;
    }

    if (!showSuggestions) {
      if (event.key === "ArrowDown" && matchingSuggestions.length > 0) {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % matchingSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? matchingSuggestions.length - 1 : current - 1,
      );
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
      className={cn("relative w-full", className)}
    >
      <div
        className={cn(
          "flex items-stretch rounded-lg border bg-background transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10",
          compact ? "min-h-14 border-border" : "min-h-[4.5rem] border-accent",
        )}
      >
        <Search
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn(
            "shrink-0 self-center text-muted",
            compact ? "ml-4 size-5" : "ml-5 size-6 sm:ml-6",
          )}
        />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-label="Search scientific datasets"
          aria-autocomplete="list"
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-expanded={showSuggestions}
          aria-activedescendant={
            selectedIndex >= 0 ? `${listboxId}-${selectedIndex}` : undefined
          }
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent px-3 text-foreground outline-none placeholder:text-muted",
            compact ? "text-sm sm:text-base" : "text-base sm:px-5 sm:text-lg",
          )}
        />
        <div className="my-2 border-l border-border pl-2 pr-2">
          <Button
            type="submit"
            size="icon"
            aria-label="Search"
            className={cn(compact ? "size-10 min-h-10 sm:size-11" : "h-full min-h-14 w-14 sm:w-16")}
          >
            <Search
              aria-hidden="true"
              strokeWidth={1.75}
              className={compact ? "size-5" : "size-6"}
            />
          </Button>
        </div>
      </div>

      {showSuggestions ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          {matchingSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              id={`${listboxId}-${index}`}
              type="button"
              role="option"
              aria-selected={selectedIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onValueChange(suggestion);
                submit(suggestion);
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm text-foreground transition-colors hover:bg-surface",
                selectedIndex === index && "bg-accent-soft text-accent",
              )}
            >
              <Search className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
