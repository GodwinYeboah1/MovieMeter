import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { User as UserIcon, Calendar, MessageSquare, Star, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";

interface PageProps {
  params: { id: string };
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#111] rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-2xl z-10">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="h-16 w-16 text-primary/40" />
              )}
            </div>

            <div className="text-center md:text-left space-y-4 z-10 flex-grow">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                  {user.name || 'Member'}
                </h1>
                <p className="text-gray-500 font-bold tracking-wide">{user.email}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {user.reviews.length} Reviews
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <div className="md:absolute top-8 right-8 z-10">
                <Link href="/settings">
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest transition-all">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Activity Section */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold italic uppercase tracking-tighter border-l-4 border-primary pl-4">Recent Activity</h2>
            
            {user.reviews.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map((review: any) => (
                  <div key={review.id} className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-yellow-500 font-bold">
                        <Star className="h-4 w-4 fill-current" />
                        {review.rating}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 line-clamp-3">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/5 border-dashed">
                <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No reviews yet</p>
                <p className="text-gray-600 text-sm">Start sharing your thoughts on movies!</p>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }
