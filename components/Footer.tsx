import Link from "next/link";
import { Github, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="text-3xl font-black tracking-tighter text-primary italic uppercase">
              MOVIEMETER
            </Link>
            <p className="text-gray-500 font-medium max-w-xs leading-relaxed">
              Your ultimate guide to the world of cinema. Discover, review, and track your favorite movies with our global community.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">Search</Link></li>
              <li><Link href="/trending" className="hover:text-primary transition-colors">Trending</Link></li>
              <li><Link href="/top-rated" className="hover:text-primary transition-colors">Top Rated</Link></li>
              <li><Link href="/reviews/latest" className="hover:text-primary transition-colors">Latest Reviews</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Help</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="#" className="hover:text-primary transition-colors">Support Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              © {new Date().getFullYear()} MOVIEMETER. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              This product uses the{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                TMDB API
              </a>{" "}
              but is not endorsed or certified by TMDB.
            </p>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">
            <span>Built for Cinema Lovers</span>
            <span>Powered by TMDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
