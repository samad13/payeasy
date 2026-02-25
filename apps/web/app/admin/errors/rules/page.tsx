import { getServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AlertRulesPage() {
  const supabase = await getServerClient();

  const { data: rules, error } = await supabase
    .from("alert_rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading rules: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/errors" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Errors
          </Link>
          <h1 className="text-3xl font-bold mt-2">Alert Rules</h1>
          <p className="text-gray-400">Configure how and when you want to be notified</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
          Create New Rule
        </button>
      </div>

      <div className="grid gap-6">
        {rules?.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center text-gray-500 backdrop-blur-sm">
            No alert rules configured yet.
          </div>
        ) : (
          rules?.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-200">{rule.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                    rule.active ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 uppercase font-black tracking-tighter text-[10px]">Condition:</span>
                    <span className="text-gray-300">
                      {rule.condition_type === 'threshold' 
                        ? `${rule.threshold_count} errors in ${rule.time_window_minutes}m` 
                        : rule.condition_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 uppercase font-black tracking-tighter text-[10px]">Channel:</span>
                    <span className="text-blue-400">{rule.channel}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-gray-400 hover:border-slate-600 hover:text-white transition-all">
                  Edit
                </button>
                <button className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-950/40 transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
