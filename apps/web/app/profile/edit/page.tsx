import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/profile/EditProfileForm";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useAuth from "@/lib/hooks/useAuth";
import { createBrowserClient } from "@/lib/supabase/client";
export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/auth/login");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (userError || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error loading profile</h1>
        <p className="text-slate-400">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 id="edit-profile-heading" className="text-2xl font-semibold mb-4">Edit Profile</h1>
      <form onSubmit={handleSave} aria-labelledby="edit-profile-heading" className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-1">
          <div className="text-sm text-gray-300">Username</div>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-md px-3 py-2 bg-gray-800 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>

        <label className="block md:col-span-1">
          <div className="text-sm text-gray-300">Email</div>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md px-3 py-2 bg-gray-800 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm text-gray-300">Bio</div>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full rounded-md px-3 py-2 bg-gray-800 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm text-gray-300">Avatar</div>
          <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm text-gray-300" aria-describedby={uploading ? "avatar-uploading" : undefined} />
          {uploading && <div id="avatar-uploading" className="text-xs text-gray-400 mt-2" aria-live="polite">Uploading…</div>}
          {avatarUrl && (
            <div className="mt-2 relative w-20 h-20 rounded-full overflow-hidden border border-white/10">
              <Image
                src={avatarUrl}
                alt={`${user?.username || 'User'} avatar preview`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </label>

        <div className="flex items-center gap-3 md:col-span-2">
          <button type="submit" disabled={saving} className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">{saving ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => router.back()} className="rounded-xl px-4 py-2 border border-white/10">Cancel</button>
        </div>
      </form>
    </main>
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
        <p className="text-slate-400">
          Update your personal information and profile photo.
        </p>
      </div>

      <EditProfileForm user={user} />
    </div>
  );
}