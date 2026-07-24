import type {
  CreditCardCategoryDistributionPoint,
  CreditCardMetrics,
  CreditCardMonthlyActivityPoint,
  CreditCardStatementItem,
  CreditCardStatementUploadResponse
} from "../types/creditCard";

const API_BASE = "/api/v1/credit-cards";

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function getCreditCardMetrics(signal?: AbortSignal): Promise<CreditCardMetrics> {
  return fetchJson<CreditCardMetrics>("/metrics", signal);
}

export function getCreditCardMonthlyActivity(
  signal?: AbortSignal
): Promise<CreditCardMonthlyActivityPoint[]> {
  return fetchJson<CreditCardMonthlyActivityPoint[]>("/monthly-activity", signal);
}

export function getCreditCardCategoryDistribution(
  signal?: AbortSignal
): Promise<CreditCardCategoryDistributionPoint[]> {
  return fetchJson<CreditCardCategoryDistributionPoint[]>("/category-distribution", signal);
}

export function getCreditCardStatementItems(
  signal?: AbortSignal
): Promise<CreditCardStatementItem[]> {
  return fetchJson<CreditCardStatementItem[]>("/statement-items", signal);
}

export async function uploadCreditCardStatement(
  file: File,
  signal?: AbortSignal
): Promise<CreditCardStatementUploadResponse> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE}/statements/upload`, {
    body,
    headers: { Accept: "application/json" },
    method: "POST",
    signal
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<CreditCardStatementUploadResponse>;
}
