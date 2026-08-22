import { apiRequest, isRestApiEnabled } from "@/services/apiClient";
import {
  createFixtureEntry,
  fixtureMetadataSuggestion,
  fixtureTranscription,
  getFixtureEntry,
  listFixtureEntries,
  updateFixtureEntry,
} from "@/services/fixtureStore";
import type { CreateJournalEntryInput, JournalEntry, JournalMode, MetadataSuggestion, UpdateJournalEntryInput } from "@/types/api";

const toDate = (value: string | Date | null): Date | null => value ? new Date(value) : null;

function normalizeEntry(entry: JournalEntry): JournalEntry {
  return {
    ...entry,
    createdAt: new Date(entry.createdAt),
    sealDate: toDate(entry.sealDate),
    unlockDate: toDate(entry.unlockDate),
  };
}

export const journalService = {
  async list(): Promise<JournalEntry[]> {
    if (!isRestApiEnabled) return listFixtureEntries();
    return (await apiRequest<JournalEntry[]>("/api/journal-entries")).map(normalizeEntry);
  },

  async listRecent(limit: number): Promise<JournalEntry[]> {
    if (!isRestApiEnabled) return listFixtureEntries().slice(0, limit);
    return (await apiRequest<JournalEntry[]>(`/api/journal-entries?limit=${limit}`)).map(normalizeEntry);
  },

  async listByMode(mode: JournalMode): Promise<JournalEntry[]> {
    if (!isRestApiEnabled) return listFixtureEntries().filter((entry) => entry.mode === mode);
    return (await apiRequest<JournalEntry[]>(`/api/journal-entries?mode=${mode}`)).map(normalizeEntry);
  },

  async listByCollection(collectionId: string): Promise<JournalEntry[]> {
    if (!isRestApiEnabled) return listFixtureEntries().filter((entry) => entry.collectionId === collectionId);
    return (await apiRequest<JournalEntry[]>(`/api/journal-entries?collectionId=${encodeURIComponent(collectionId)}`)).map(normalizeEntry);
  },

  async getById(id: string): Promise<JournalEntry | null> {
    if (!isRestApiEnabled) return getFixtureEntry(id);
    return normalizeEntry(await apiRequest<JournalEntry>(`/api/journal-entries/${encodeURIComponent(id)}`));
  },

  async create(input: CreateJournalEntryInput): Promise<JournalEntry> {
    if (!isRestApiEnabled) return createFixtureEntry(input);
    return normalizeEntry(await apiRequest<JournalEntry>("/api/journal-entries", { method: "POST", body: input }));
  },

  async update(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    if (!isRestApiEnabled) return updateFixtureEntry(id, input);
    return normalizeEntry(await apiRequest<JournalEntry>(`/api/journal-entries/${encodeURIComponent(id)}`, { method: "PATCH", body: input }));
  },

  async transcribe(audioUrl: string) {
    if (!isRestApiEnabled) return fixtureTranscription();
    return apiRequest<{ transcript: string }>("/api/journal-entries/transcribe", { method: "POST", body: { audioUrl } });
  },

  async suggestMetadata(transcript: string): Promise<MetadataSuggestion> {
    if (!isRestApiEnabled) return fixtureMetadataSuggestion();
    return apiRequest<MetadataSuggestion>("/api/journal-entries/suggest-metadata", { method: "POST", body: { transcript } });
  },
};
