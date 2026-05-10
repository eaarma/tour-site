import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { storage } from "@/lib/integrations/firebase";

export type StorefrontAssetFolder =
  | "logos"
  | "favicons"
  | "homepage-hero"
  | "seo";

export type UploadedStorefrontAsset = {
  imageUrl: string;
  storagePath: string;
};

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();

export function uploadStorefrontAsset({
  file,
  folder,
}: {
  file: File;
  folder: StorefrontAssetFolder;
}): Promise<UploadedStorefrontAsset> {
  return new Promise((resolve, reject) => {
    const storagePath = `storefront/${folder}/${Date.now()}-${sanitizeFileName(
      file.name,
    )}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      undefined,
      (error) => reject(error),
      async () => {
        try {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            imageUrl,
            storagePath,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

