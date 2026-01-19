import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const reports = await prisma.report.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <main className="container mx-auto px-4 md:px-12 lg:px-20 py-12">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4 text-white">Moderation Queue</h1>
        
        {reports.length === 0 ? (
          <div className="text-center py-24 bg-[#111] rounded-3xl border border-white/5">
            <p className="text-xl font-bold mb-2 text-gray-400 italic">Queue is clear</p>
            <p className="text-gray-500 text-sm">No open reports to review at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-[#111] border-white/5 text-white overflow-hidden rounded-2xl transition-all hover:border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold uppercase italic tracking-tight flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded not-italic font-black tracking-widest">{report.targetType}</span>
                    {report.reason}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm font-medium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Reported by</span>
                        <span className="text-gray-300">{report.reporter.name || report.reporter.email}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Target ID</span>
                        <span className="text-gray-300 font-mono text-xs">{report.targetId}</span>
                      </div>
                    </div>
                    
                    {report.details && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Details</span>
                        <p className="text-gray-400 bg-white/5 p-4 rounded-xl leading-relaxed">{report.details}</p>
                      </div>
                    )}
                    
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pt-2">
                      Reported on {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <button className="px-6 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 italic">
                      Take Action
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/10 transition-all italic">
                      Dismiss
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    );
  }
}
