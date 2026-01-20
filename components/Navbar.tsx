"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all group"
                  >
                    <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold pr-2 hidden lg:inline-block">
                      {session.user.name || "User"}
                    </span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate">{session.user.email}</p>
                        </div>
                        
                        <Link 
                          href={`/user/${session.user.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="h-4 w-4 text-primary" />
                          Profile
                        </Link>
                        
                        <Link 
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Settings
                        </Link>

                        {session.user.role === "ADMIN" && (
                          <Link 
                            href="/admin"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-bold transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-yellow-500" />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="h-px bg-white/5 my-2" />
                        
                        <button
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-bold text-red-500 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {session.user.name?.[0] || session.user.email?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{session.user.name || "User"}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{session.user.email}</span>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/settings"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Settings
                  </Link>

                  {session.user.role === "ADMIN" && (
                    <Link 
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-5 w-5 text-yellow-500" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 text-red-500 border-red-500/20 hover:bg-red-500/10" 
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
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
