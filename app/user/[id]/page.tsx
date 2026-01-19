import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { User, Calendar, MessageSquare, Star } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function UserProfilePage({ params }: PageProps) {
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

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">{user.name || 'Member'}</h1>
              <p className="text-gray-500 font-medium">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
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
}
