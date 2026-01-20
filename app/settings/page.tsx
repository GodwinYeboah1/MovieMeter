"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Image as ImageIcon, Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update the session with new data
      await update({
        name,
        image,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-primary/60">Loading Settings</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <div className="max-w-2xl mx-auto">
        <Link 
          href={`/user/${session?.user?.id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Profile</span>
        </Link>

        <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Account Settings</h1>
            <p className="text-gray-500 font-medium">Personalize your identity on MovieMeter</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Avatar Preview & URL */}
            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Profile Picture</label>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex-shrink-0 flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image}
                      alt="Avatar Preview"
                      fill
                      className="object-cover"
                      onError={() => setError("Invalid image URL")}
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary/40" />
                  )}
                </div>
                
                <div className="flex-grow w-full space-y-2">
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Paste an image URL (e.g. from Unsplash, Gravatar)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
                    Tip: Use a URL from Gravatar, Unsplash, or any image hosting service.
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your username"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                  minLength={2}
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-sm text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 text-sm text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl border border-emerald-400/20 animate-in fade-in slide-in-from-top-1">
                <Check className="h-5 w-5 flex-shrink-0" />
                Profile updated successfully!
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic text-lg shadow-xl shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5 stroke-[3]" /> Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-12 p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
          <h3 className="text-red-500 font-black uppercase tracking-widest text-xs mb-4">Danger Zone</h3>
          <p className="text-gray-500 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl">
            Delete Account
          </Button>
        </div>
      </div>
    </main>
  );
}
