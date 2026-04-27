import { apiClient } from "./client";

export async function fetchJournalEntries() {
  const response = await apiClient.get("/journal-entries");
  return response.data;
}

export async function createJournalEntry(payload) {
  const response = await apiClient.post("/journal-entries", payload);
  return response.data;
}

export async function postJournalEntry(entryId) {
  const response = await apiClient.post(`/journal-entries/${entryId}/post`);
  return response.data;
}