import { ChevronDown, RotateCcw } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export type FilterGroup = "disciplines" | "regions" | "formats" | "access";
export type YearBound = "from" | "to";

export interface FilterState {
  disciplines: string[];
  regions: string[];
  formats: string[];
  access: string[];
  yearFrom?: number;
  yearTo?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  disciplines: FilterOption[];
  regions: FilterOption[];
  formats: FilterOption[];
  access: FilterOption[];
}

export interface FiltersPanelProps {
  filters: FilterState;
  options: FilterOptions;
  onToggle: (group: FilterGroup, value: string) => void;
  onYearChange: (bound: YearBound, value: number | undefined) => void;
  onClear: () => void;
  className?: string;
  showClear?: boolean;
}

interface FilterCheckboxGroupProps {
  label: string;
  group: FilterGroup;
  options: FilterOption[];
  selected: string[];
  onToggle: FiltersPanelProps["onToggle"];
}

function FilterCheckboxGroup({
  label,
  group,
  options,
  selected,
  onToggle,
}: FilterCheckboxGroupProps) {
  return (
    <details open className="group border-b border-border py-3">
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted transition-transform group-open:rotate-180"
          strokeWidth={1.75}
        />
      </summary>
      <div className="mt-1.5 space-y-0.5">
        {options.map((option) => {
          const checked = selected.includes(option.value);

          return (
            <label
              key={option.value}
              className="flex min-h-8 cursor-pointer items-center gap-2 rounded px-0.5 text-[13px] leading-5 text-foreground hover:bg-surface max-sm:min-h-11 max-sm:text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(group, option.value)}
                className="size-4 shrink-0 cursor-pointer accent-accent"
              />
              <span className="min-w-0 flex-1">{option.label}</span>
              {option.count !== undefined ? (
                <span className="tabular-nums text-muted">{option.count.toLocaleString()}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </details>
  );
}

function parseYear(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function FiltersPanel({
  filters,
  options,
  onToggle,
  onYearChange,
  onClear,
  className,
  showClear = true,
}: FiltersPanelProps) {
  return (
    <aside aria-label="Dataset filters" className={cn("w-full", className)}>
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="-ml-3 mb-1 text-accent"
        >
          <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Clear filters
        </Button>
      ) : null}

      <FilterCheckboxGroup
        label="Discipline"
        group="disciplines"
        options={options.disciplines}
        selected={filters.disciplines}
        onToggle={onToggle}
      />
      <FilterCheckboxGroup
        label="Region"
        group="regions"
        options={options.regions}
        selected={filters.regions}
        onToggle={onToggle}
      />

      <details open className="group border-b border-border py-3">
        <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
          Publication Year
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-muted transition-transform group-open:rotate-180"
            strokeWidth={1.75}
          />
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            <span className="sr-only">Publication year from</span>
            <input
              type="number"
              inputMode="numeric"
              value={filters.yearFrom ?? ""}
              onChange={(event) => onYearChange("from", parseYear(event.target.value))}
              placeholder="From"
              aria-label="Publication year from"
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </label>
          <label className="text-xs text-muted">
            <span className="sr-only">Publication year to</span>
            <input
              type="number"
              inputMode="numeric"
              value={filters.yearTo ?? ""}
              onChange={(event) => onYearChange("to", parseYear(event.target.value))}
              placeholder="To"
              aria-label="Publication year to"
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </label>
        </div>
      </details>

      <FilterCheckboxGroup
        label="Data Format"
        group="formats"
        options={options.formats}
        selected={filters.formats}
        onToggle={onToggle}
      />
      <FilterCheckboxGroup
        label="Access"
        group="access"
        options={options.access}
        selected={filters.access}
        onToggle={onToggle}
      />
    </aside>
  );
}
