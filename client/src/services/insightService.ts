import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import { getFixtureInsight } from "@/services/fixtureStore";
import type { Insight } from "@/types/api";

export const insightService = {
  async getByMonth(periodMonth: string): Promise<Insight | null> {
    if (!isRestApiEnabled) return getFixtureInsight(periodMonth);
    const insight = await apiRequest<Insight | null>(`/api/insights/${encodeURIComponent(periodMonth)}`);
    return insight ? { ...insight, createdAt: new Date(insight.createdAt) } : null;
  },
};
