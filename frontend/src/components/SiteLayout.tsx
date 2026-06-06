import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      {/* No spacer – content begins at top of viewport, scrolls under the fixed navbar */}
      <main>{children}</main>
      <Footer />
    </div>
  );
}