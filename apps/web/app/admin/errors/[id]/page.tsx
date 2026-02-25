import { getServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ErrorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getServerClient();

  // 1. Fetch the error group
  const { data: group, error: groupError } = await supabase
    .from("error_groups")
    .select("*")
    .eq("id", params.id)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // 2. Fetch recent instances
  const { data: instances, error: instancesError } = await supabase
    .from("errors")
    .select("*")
    .eq("group_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-gray-100">
      <div className="mb-8">
        <Link 
          href="/admin/errors" 
          className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                group.status === 'open' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {group.status}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-lg text-gray-400 font-medium">{group.message}</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg border border-slate-700 bg-slate-900/50 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-slate-800 transition-colors">
              Ignore
            </button>
            <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Statistics & Metadata */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Statistics</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-black text-gray-100">{group.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mt-1">Total Events</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-200">
                  {new Date(group.first_seen_at).toLocaleDateString()}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mt-1">First Seen</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Fingerprint</h2>
            <code className="block break-all rounded-xl bg-slate-950/50 p-4 font-mono text-[11px] text-blue-400 border border-slate-800/50">
              {group.fingerprint}
            </code>
          </div>
        </div>

        {/* Stack Trace & Recent Events */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden backdrop-blur-sm">
            <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Latest Stack Trace</h2>
              <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Copy</button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl bg-slate-950 p-6 border border-slate-900/50 shadow-inner">
                <pre className="font-mono text-xs leading-relaxed text-gray-400 whitespace-pre-wrap">
                  {instances?.[0]?.stack || "No stack trace available"}
                </pre>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Recent Instances</h2>
            <div className="space-y-0">
              {instances?.map((instance, idx) => (
                <div key={instance.id} className={`py-5 ${idx !== 0 ? 'border-t border-slate-800' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-gray-400 bg-slate-800/50 px-2 py-1 rounded">
                      {new Date(instance.created_at).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      instance.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                    }`}>{instance.severity}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <span className="text-slate-600 font-bold uppercase tracking-tighter text-[10px] w-12">URL:</span> 
                      <span className="truncate hover:text-gray-300 transition-colors">{instance.url || "N/A"}</span>
                    </div>
                    {instance.user_id && (
                      <div className="flex gap-2">
                        <span className="text-slate-600 font-bold uppercase tracking-tighter text-[10px] w-12">User:</span> 
                        <span className="text-blue-400 font-medium">{instance.user_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
