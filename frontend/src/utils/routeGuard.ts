import { redirect } from "@tanstack/react-router";

export function requireAuth(location: any) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw redirect({
      to: "/login",
      search: { redirect: location.pathname },
    });
  }
  // Optional: validate token with backend (e.g., call /me)
  return;
}