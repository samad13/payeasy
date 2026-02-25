import { getServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ErrorListPage() {
  const supabase = await getServerClient();

  const { data: groups, error } = await supabase
    .from("error_groups")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading errors: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Tracking</h1>
          <p className="text-gray-400">Monitor and manage application errors</p>
        </div>
        <Link 
          href="/admin/errors/rules" 
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Manage Alert Rules
        </Link>
      </div>

      <div className="grid gap-4">
        {groups?.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center text-gray-500">
            No errors detected yet. Great job!
          </div>
        ) : (
          groups?.map((group) => (
            <Link
              key={group.id}
              href={`/admin/errors/${group.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex-1 overflow-hidden pr-8">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${group.status === 'open' ? 'bg-red-500' : 'bg-green-500'}`} />
                  <h3 className="truncate font-semibold text-gray-200">{group.name}: {group.message}</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Fingerprint: <span className="font-mono">{group.fingerprint}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-8 text-right">
                <div>
                  <div className="text-lg font-bold text-gray-200">{group.count}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Events</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-sm font-medium text-gray-300">
                    {new Date(group.last_seen_at).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Last Seen</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${
                  group.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                }`}>
                  {group.status}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
