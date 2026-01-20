"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await signIn("email-login", {
        email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setMessage({ 
          text: "Invalid email format. Please enter a valid email address.", 
          type: 'error' 
        });
      } else if (result?.ok) {
        setMessage({ 
          text: "Welcome! Redirecting you to the homepage...", 
          type: 'success' 
        });
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ 
        text: "An unexpected error occurred. Please try again.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-primary">Join the club</h1>
            <p className="text-gray-400 font-medium">Discover movies, write reviews, and share your passion.</p>
          </div>

          <div className="bg-[#111] p-8 md:p-10 rounded-[32px] border border-white/5 shadow-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[33px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {message && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold animate-in fade-in zoom-in-95 duration-200 ${
                  message.type === 'success' 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <ArrowRight className="h-5 w-5 flex-shrink-0" />}
                  {message.text}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic text-lg shadow-xl shadow-primary/20 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Enter Cinema <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] font-bold">
              No password needed. Just enter your email to join.
            </p>
            <div className="pt-4 flex items-center justify-center gap-6">
              <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-bold underline decoration-primary/30 underline-offset-4">
                Back to Home
              </Link>
              <Link href="/search" className="text-gray-500 hover:text-white transition-colors text-sm font-bold underline decoration-primary/30 underline-offset-4">
                Explore Movies
              </Link>
            </div>
          </div>
        </div>
    </main>
  );
}
