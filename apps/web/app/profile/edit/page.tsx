import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/profile/EditProfileForm";

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