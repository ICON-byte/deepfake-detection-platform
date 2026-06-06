import { Link } from "@tanstack/react-router";
import { Globe, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-[90rem] px-3 pb-6 pt-10 sm:px-4 lg:px-6">
        {/* Boxed container for footer content */}
        <div className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand column */}
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                <img src="/images/logo.png" alt="Logo" />
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                AI-Powered deepfake detection platform protecting media authenticity across images, videos and audio.
              </p>
              <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                <a href="#" aria-label="Website" className="transition-colors hover:text-primary">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Email" className="transition-colors hover:text-primary">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="#" aria-label="WhatsApp" className="transition-colors hover:text-primary">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Links columns */}
            <div className="grid grid-cols-2 gap-8 md:col-span-2 md:justify-end">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Platform</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/detect" className="transition-colors hover:text-primary">
                      Detect
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="transition-colors hover:text-primary">
                      About
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Account</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/login" className="transition-colors hover:text-primary">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="transition-colors hover:text-primary">
                      Register
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright row */}
          <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>© 2026 TruthLens AI · Nigerian Computer Society (NCS)</p>
            <p>
              Developed by{" "}
              <a href="#" className="text-primary transition-colors hover:underline">
                Neo Cloud Technologies
              </a>
            </p>
          </div>
        </div>

        {/* Large background watermark (still visible outside the box) */}
        <div className="pointer-events-none mt-6 select-none overflow-hidden text-center">
          <p className="bg-gradient-to-b from-primary/15 to-transparent bg-clip-text text-[14vw] font-extrabold leading-none tracking-tighter text-transparent sm:text-[13vw] lg:text-[12vw]">
            TRUTHLENS
          </p>
        </div>
      </div>
    </footer>
  );
}
