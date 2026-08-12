import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { FiltersPanel, type FiltersPanelProps } from "./FiltersPanel";

export interface FilterSheetProps extends Omit<FiltersPanelProps, "className" | "showClear"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  resultCount?: number;
}

export function FilterSheet({
  open,
  onOpenChange,
  trigger,
  resultCount,
  ...filterProps
}: FilterSheetProps) {
  const resultLabel =
    resultCount === undefined
      ? "Show results"
      : `Show ${resultCount.toLocaleString()} ${resultCount === 1 ? "result" : "results"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline">
            <SlidersHorizontal className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Filters
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[min(90dvh,48rem)]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Refine datasets by discipline, region, year, format, and access.
          </SheetDescription>
        </SheetHeader>
        <div className="scrollbar-subtle flex-1 overflow-y-auto px-5">
          <FiltersPanel {...filterProps} showClear={false} />
        </div>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={filterProps.onClear}
            className="flex-1"
          >
            Clear all
          </Button>
          <SheetClose asChild>
            <Button type="button" className="flex-1">
              {resultLabel}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
