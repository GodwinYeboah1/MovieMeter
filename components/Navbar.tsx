"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, Settings, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
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
                    className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Avatar with gradient ring */}
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                      <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-sm">
                            {session.user.name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Name and dropdown indicator */}
                    <div className="hidden lg:flex items-center gap-2">
                      <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                        {session.user.name || "User"}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0d0d0d] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Header */}
                        <div className="p-4 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                              {session.user.image ? (
                                <Image
                                  src={session.user.image}
                                  alt={session.user.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold">
                                  {session.user.name?.[0]?.toUpperCase() || <UserIcon className="h-5 w-5" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{session.user.name || "User"}</p>
                              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="p-2">
                          <Link 
                            href={`/user/${session.user.id}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            View Profile
                          </Link>
                          
                          <Link 
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors">
                              <Settings className="h-4 w-4 text-gray-400" />
                            </div>
                            Settings
                          </Link>

                          {session.user.role === "ADMIN" && (
                            <Link 
                              href="/admin"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="p-1.5 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                                <LayoutDashboard className="h-4 w-4 text-yellow-500" />
                              </div>
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-400 hover:text-red-300 transition-colors text-left group"
                          >
                            <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                              <LogOut className="h-4 w-4" />
                            </div>
                            Sign Out
                          </button>
                        </div>
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
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-white/5 to-blue-500/10 border border-white/10 hover:border-white/20 transition-all group">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-50 blur-sm" />
                        <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/20">
                          {session.user.image ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-lg">
                              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{session.user.name || "User"}</span>
                        <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
                      </div>
                      <ChevronDown className="h-5 w-5 text-gray-500 -rotate-90" />
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
