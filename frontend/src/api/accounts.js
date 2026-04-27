import { apiClient } from "./client";

export async function fetchAccounts() {
  const response = await apiClient.get("/accounts");
  return response.data;
}