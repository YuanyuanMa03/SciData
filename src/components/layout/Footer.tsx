import { Link } from "react-router-dom";
import { getMessages } from "../../i18n/messages";

import { Logo } from "./Logo";

const copy = getMessages();
const footerLinks = [
  { label: copy.navigation.explore, to: "/explore" },
  { label: copy.navigation.disciplines, to: "/disciplines" },
  { label: copy.navigation.collections, to: "/collections" },
  { label: copy.navigation.about, to: "/about" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="content-container flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo className="w-fit" />
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
            {copy.product.subtitle}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
