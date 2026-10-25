import { createClient } from "@/lib/supabase/client";

// Unggah file foto ke Supabase Storage (bukti transfer, foto kamar, dll)
export async function uploadImageToStorage({
  file,
  bucket = "payment_proofs",
  folder = "uploads",
}: {
  file: File;
  bucket?: string;
  folder?: string;
}): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { publicUrl: data.publicUrl, error: null };
  } catch (err: any) {
    return { publicUrl: null, error: err };
  }
}
