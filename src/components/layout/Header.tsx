import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "../../lib/utils";
import { getMessages } from "../../i18n/messages";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { GitHubMark } from "./GitHubMark";
import { Logo } from "./Logo";

const copy = getMessages();
const navigation = [
  { label: copy.navigation.explore, to: "/explore" },
  { label: copy.navigation.disciplines, to: "/disciplines" },
  { label: copy.navigation.collections, to: "/collections" },
  { label: copy.navigation.about, to: "/about" },
] as const;

function GitHubControl() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim();

  if (githubUrl) {
    return (
      <Button asChild variant="ghost" size="icon">
        <a
          aria-label="Open SciData on GitHub"
          href={githubUrl}
          rel="noreferrer"
          target="_blank"
        >
          <GitHubMark className="size-5" aria-hidden="true" />
        </a>
      </Button>
    );
  }

  return (
    <span title="GitHub repository link is not configured">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="GitHub repository link is not configured"
        className="disabled:opacity-60"
      >
        <GitHubMark className="size-5" aria-hidden="true" />
      </Button>
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-[var(--header-height)] border-b border-border bg-background">
      <div className="page-container grid h-full grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <Logo />

        <nav aria-label="Primary navigation" className="hidden h-full items-center md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative inline-flex h-full min-w-24 items-center justify-center px-4 text-sm font-medium text-muted transition-colors hover:text-foreground",
                  isActive &&
                    "text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-accent",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden justify-self-end md:block">
          <GitHubControl />
        </div>

        <div className="flex items-center justify-self-end md:hidden">
          <GitHubControl />
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,22rem)]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate between SciData pages.
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col p-3">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex min-h-12 items-center rounded-md px-3 text-base font-medium text-foreground transition-colors hover:bg-surface",
                          isActive && "bg-accent-soft text-accent",
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
