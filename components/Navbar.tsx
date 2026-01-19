"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tighter text-primary italic uppercase">
              MOVIEMETER
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/trending" className="text-sm font-semibold hover:text-primary transition-colors">
                Trending
              </Link>
              <Link href="/top-rated" className="text-sm font-semibold hover:text-primary transition-colors">
                Top Rated
              </Link>
              <Link href="/search" className="text-sm font-semibold hover:text-primary transition-colors">
                Search
              </Link>
              <Link href="/reviews/latest" className="text-sm font-semibold hover:text-primary transition-colors">
                Reviews
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {status === "loading" ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <>
                  <Link href={`/user/${session.user.id}`}>
                    <Button variant="ghost" size="sm">
                      {session.user.name || session.user.email}
                    </Button>
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/trending" 
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Trending
              </Link>
              <Link 
                href="/top-rated" 
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Top Rated
              </Link>
              <Link 
                href="/search" 
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/reviews/latest" 
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Reviews
              </Link>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
              {status === "loading" ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              ) : session ? (
                <>
                  <Link 
                    href={`/user/${session.user.id}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                      <span className="font-bold">{session.user.name || session.user.email}</span>
                    </div>
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link 
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 border-red-500/20 hover:bg-red-500/10" 
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
