import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4 text-white">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-[#111] border-white/5 text-white overflow-hidden rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold uppercase italic tracking-tight text-primary">Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-6 font-medium">
                Manage reported content and user moderation. Keep the community safe.
              </p>
              <Link href="/admin/reports" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                View Reports <span className="text-xl">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/5 text-white overflow-hidden rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold uppercase italic tracking-tight text-blue-500">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 font-medium">
                User management features coming soon. Monitor user engagement and roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
}
