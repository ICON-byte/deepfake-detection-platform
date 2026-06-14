import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the current route is exactly the landing page
  const isLandingPage = location.pathname === "/";

  // Check authentication status by verifying the presence of a valid token
  const checkAuth = () => {
    const token = localStorage.getItem("truthlens_token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage events (in case logout happens in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("truthlens_token");
    localStorage.removeItem("truthlens_user");
    setIsLoggedIn(false);
    navigate({ to: "/" });
    setOpen(false);
  };

  // 🟢 CLEANER DYNAMIC QUEUE ENGINE
  // Base public links visible to both guests and users
  const baseNav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/detect", label: "Detect" },
  ];

  // Dynamically push History to the navbar array only if logged in
  const nav = isLoggedIn 
    ? [...baseNav, { to: "/history", label: "History" }] 
    : baseNav;

  return (
    <header
      className={`fixed left-1/2 top-3 z-50 w-[calc(100%-1rem)] max-w-7xl -translate-x-1/2 rounded-2xl border transition-all duration-200 sm:top-6 sm:w-[calc(100%-2rem)] ${
        isLandingPage
          ? "border-gray-200 bg-white/90 shadow-md backdrop-blur-sm"
          : "border-[#6699ff]/20 bg-[#6699ff]/15 shadow-sm backdrop-blur-md"
      }`}
    >
      {/* Desktop layout: left (logo), center (nav links), right (buttons) */}
      <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
        {/* Logo - left */}
        <Link to="/" className="shrink-0 text-xl font-semibold tracking-tight text-foreground flex items-center">
          <img src="/images/logo.svg" alt="Logo" className="h-9 w-auto sm:h-10" />
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
                className: "rounded-lg border border-[#6699ff] bg-white/45 px-4 py-1.5 text-sm font-medium text-[#6699ff] shadow-sm",
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
                className="rounded-xl bg-[#6699ff] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6699ff]/90"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
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
        <div
          className={`border-t rounded-b-2xl backdrop-blur-md md:hidden ${
            isLandingPage ? "border-gray-100 bg-white/95" : "border-[#6699ff]/20 bg-white/90"
          }`}
        >
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
                  className="rounded-md bg-[#6699ff] px-3 py-2 text-center text-sm font-medium text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}