import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import { createFixtureCollection, listFixtureCollections, removeFixtureCollection } from "@/services/fixtureStore";
import type { Collection } from "@/types/api";

export const collectionService = {
  async list(): Promise<Collection[]> {
    if (!isRestApiEnabled) return listFixtureCollections();
    return apiRequest<Collection[]>("/api/collections");
  },

  async create(name: string): Promise<Collection> {
    if (!isRestApiEnabled) return createFixtureCollection(name);
    return apiRequest<Collection>("/api/collections", { method: "POST", body: { name } });
  },

  async remove(id: string) {
    if (!isRestApiEnabled) {
      removeFixtureCollection(id);
      return;
    }
    await apiRequest<{ deleted: true }>(`/api/collections/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
