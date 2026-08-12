import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-accent px-4 py-3 text-sm font-medium text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <div id="main-content" className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
