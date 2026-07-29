import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Photo upload is optional (P0 says "photo optional"). If Supabase env
// vars aren't set, `supabase` is null and the upload UI quietly disables
// itself instead of throwing — the rest of the app doesn't depend on it.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

const PHOTO_BUCKET = "testimonial-photos";

/**
 * Uploads a photo straight from the browser to Supabase Storage (the anon
 * key only has insert+read on this one bucket — see server/supabase/schema.sql)
 * and returns its public URL. The server never sees the file bytes, only
 * the resulting URL — keeps the API stateless about file handling.
 */
export async function uploadTestimonialPhoto(file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Photo upload isn't configured for this deployment.");
  }
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
