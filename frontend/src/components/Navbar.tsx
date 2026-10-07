"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { AirbnbLogo, GlobeIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import SearchPanel from "./SearchPanel";

function SearchPill({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();
  const location = params.get("location");
  const ci = params.get("check_in");
  const co = params.get("check_out");
  const guests = params.get("guests");

  return (
    <button
      onClick={onOpen}
      className="hidden items-center divide-x divide-gray-border rounded-full border border-gray-border bg-white py-2 shadow-pill transition hover:shadow-card md:flex"
    >
      <span className="px-4 text-sm font-medium">{location || "Anywhere"}</span>
      <span className="px-4 text-sm font-medium">
        {ci && co
          ? `${format(new Date(ci), "MMM d")} – ${format(new Date(co), "MMM d")}`
          : "Any week"}
      </span>
      <span className="flex items-center gap-3 pl-4 pr-2 text-sm text-gray-text">
        {guests ? `${guests} guests` : "Add guests"}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
          <SearchIcon className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-4 px-6 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="Airbnb home">
          <AirbnbLogo className="h-16 w-[102px]" />
        </Link>

        <Suspense>
          <SearchPill onOpen={() => setSearchOpen(true)} />
        </Suspense>

        <div className="flex items-center gap-1">
          <Link
            href={user?.is_host ? "/hosting" : "/hosting/new"}
            className="hidden rounded-full px-4 py-2.5 text-sm font-medium hover:bg-gray-100 lg:block"
          >
            Airbnb your home
          </Link>
          <button className="hidden rounded-full p-3 hover:bg-gray-100 lg:block" aria-label="Language">
            <GlobeIcon />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 rounded-full border border-gray-border py-1.5 pl-3.5 pr-1.5 transition hover:shadow-card"
            >
              <MenuIcon className="h-4 w-4" />
              {user ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-[30px] w-[30px] text-gray-500" />
              )}
            </button>

            {menuOpen && (
              <div className="animate-fade-up absolute right-0 top-14 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-card">
                {user ? (
                  <>
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-text">{user.email}</p>
                    </div>
                    <MenuLink href="/trips" onClick={() => setMenuOpen(false)}>Trips</MenuLink>
                    <MenuLink href="/wishlists" onClick={() => setMenuOpen(false)}>Wishlists</MenuLink>
                    <div className="my-2 border-t border-gray-100" />
                    <MenuLink href="/hosting" onClick={() => setMenuOpen(false)}>Manage listings</MenuLink>
                    <MenuLink href="/hosting/new" onClick={() => setMenuOpen(false)}>Airbnb your home</MenuLink>
                    <div className="my-2 border-t border-gray-100" />
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                      onClick={() => {
                        openAuthModal();
                        setMenuOpen(false);
                      }}
                    >
                      Log in or sign up
                    </button>
                    <div className="my-2 border-t border-gray-100" />
                    <MenuLink href="/hosting/new" onClick={() => setMenuOpen(false)}>Airbnb your home</MenuLink>
                    <MenuLink href="/" onClick={() => setMenuOpen(false)}>Help Center</MenuLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute left-0 right-0 top-20 z-40 border-b border-gray-100 bg-white pt-2 shadow-card">
          <Suspense>
            <SearchPanel onClose={() => setSearchOpen(false)} />
          </Suspense>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-sm hover:bg-gray-50">
      {children}
    </Link>
  );
}
