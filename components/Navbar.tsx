"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={
        active
          ? "text-sm font-semibold text-ink-900"
          : "text-sm font-medium text-ink-500 hover:text-ink-900"
      }
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white">
            S
          </span>
          <span className="text-lg font-bold tracking-tight text-ink-900">
            Stay<span className="text-brand-500">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Explore</NavLink>
          {user && <NavLink href="/my-bookings">My bookings</NavLink>}
          {user && <NavLink href="/my-listings">My listings</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user && (
            <Link href="/listings/new" className="btn-secondary hidden sm:inline-flex">
              Host a stay
            </Link>
          )}

          {!loading && !user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white"
                aria-label="Account menu"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 animate-fade-in rounded-xl bg-white p-2 shadow-popover ring-1 ring-ink-100"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-ink-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-500">{user.email}</p>
                  </div>
                  <Link
                    href="/listings/new"
                    className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 sm:hidden"
                    onClick={() => setMenuOpen(false)}
                  >
                    Host a stay
                  </Link>
                  <Link
                    href="/my-bookings"
                    className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 md:hidden"
                    onClick={() => setMenuOpen(false)}
                  >
                    My bookings
                  </Link>
                  <Link
                    href="/my-listings"
                    className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 md:hidden"
                    onClick={() => setMenuOpen(false)}
                  >
                    My listings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
