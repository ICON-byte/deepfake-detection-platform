import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("truthlens_auth") === "true";
      setIsLoggedIn(auth);
    };
    checkAuth();

    // Listen for storage events (in case logout happens in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("truthlens_auth");
    localStorage.removeItem("truthlens_user");
    setIsLoggedIn(false);
    navigate({ to: "/" });
    setOpen(false);
  };

  // Navigation links based on authentication
  const loggedOutNav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/detect", label: "Detect" },
  ] as const;

  const loggedInNav = [
    { to: "/detect", label: "Detect" },
    { to: "/history", label: "History" },
  ] as const;

  const nav = isLoggedIn ? loggedInNav : loggedOutNav;

  return (
    <header className="fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - left */}
        <Link to="/" className="shrink-0 text-xl font-semibold tracking-tight text-foreground">
          <img src="/images/logo.png" alt="Logo" />
        </Link>

        {/* Navigation links - centered (hidden on mobile) */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{
                className: "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right side buttons - conditional based on auth */}
        <div className="hidden items-center gap-2 md:flex">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="border-t border-border/60 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-100"
              >
                {n.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-gray-100"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}