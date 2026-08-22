import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import { deleteFixtureAccountData, exportFixtureArchive } from "@/services/fixtureStore";
import type { ArchiveDownload } from "@/types/api";

export const accountService = {
  async exportArchive(): Promise<ArchiveDownload> {
    if (!isRestApiEnabled) {
      const archive = new Blob([exportFixtureArchive()], { type: "application/json" });
      return {
        url: URL.createObjectURL(archive),
        filename: "echoes-development-fixture.json",
      };
    }
    return apiRequest<ArchiveDownload>("/api/archive", { method: "POST" });
  },

  async deleteAccount() {
    if (!isRestApiEnabled) {
      deleteFixtureAccountData();
      return;
    }
    await apiRequest<{ deleted: true }>("/api/account", { method: "DELETE" });
  },
};
