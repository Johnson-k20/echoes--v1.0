import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import type { AudioAsset } from "@/types/api";

export const uploadService = {
  async uploadAudio(file: Blob, filename: string): Promise<Pick<AudioAsset, "key" | "url">> {
    if (!isRestApiEnabled) {
      return {
        key: `development-fixture/${Date.now()}-${filename}`,
        url: URL.createObjectURL(file),
      };
    }

    const formData = new FormData();
    formData.append("file", file, filename);
    return apiRequest<Pick<AudioAsset, "key" | "url">>("/api/uploads", { method: "POST", body: formData });
  },
};
