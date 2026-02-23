"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types/database";
import { userUpdateSchema } from "@/lib/types/validation";

// Extended schema to handle avatar file upload client side if needed, 
// but we'll use userUpdateSchema for actual string data and handle file separately.
type FormData = z.infer<typeof userUpdateSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface EditProfileFormProps {
  user: User;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar_url || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      avatar_url: user.avatar_url || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image (JPG or PNG)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Simulate progress since Supabase doesn't easily expose upload progress for small files
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let avatarUrl = data.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        data.avatar_url = avatarUrl;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
      router.push("/profile");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while updating profile");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* Avatar Upload */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-900 rounded-xl border border-slate-800">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 relative flex items-center justify-center">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-3xl text-slate-500 uppercase">
                {user.username.charAt(0)}
              </span>
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h3 className="text-sm font-medium text-white">Profile Photo</h3>
          <p className="text-xs text-slate-400">
            JPG or PNG format, maximum 5MB.
          </p>
          <div className="flex justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
            >
              Change Photo
            </button>
          </div>
          
          {isUploading && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
              <div 
                className="bg-[#7D00FF] h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username")}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7D00FF] focus:border-transparent transition-all"
            placeholder="johndoe"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7D00FF] focus:border-transparent transition-all"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            {...register("bio")}
            rows={4}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7D00FF] focus:border-transparent transition-all"
            placeholder="Tell us about yourself..."
          ></textarea>
          {errors.bio && (
            <p className="mt-2 text-sm text-red-400">{errors.bio.message}</p>
          )}
          <p className="mt-2 text-xs text-slate-500 flex justify-end">
            Maximum 500 characters
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition"
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2.5 text-sm font-medium bg-[#7D00FF] hover:bg-[#6c00e0] text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
