import { apiClient } from "./client";

export async function fetchTrialBalance() {
  const response = await apiClient.get("/reports/trial-balance");
  return response.data;
}

export async function fetchIncomeStatement() {
  const response = await apiClient.get("/reports/income-statement");
  return response.data;
}

export async function fetchBalanceSheet() {
  const response = await apiClient.get("/reports/balance-sheet");
  return response.data;
}