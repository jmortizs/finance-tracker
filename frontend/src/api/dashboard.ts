import type {
  BalanceEvolutionPoint,
  CashFlowPoint,
  DashboardFilters,
  DashboardMetrics,
  DistributionPoint,
  FilterOptionsResponse,
  TransactionType
} from "../types/dashboard";

const API_BASE = "/api/v1";

type QueryValue = number | string | null | undefined;

export function buildDashboardQuery(
  filters: DashboardFilters,
  extra: Record<string, QueryValue> = {}
): string {
  const params = new URLSearchParams();
  const values: Record<string, QueryValue> = {
    start_date: filters.startDate,
    end_date: filters.endDate,
    bank_id: filters.bankId,
    account_id: filters.accountId,
    ...extra
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getFilterOptions(signal?: AbortSignal): Promise<FilterOptionsResponse> {
  return fetchJson<FilterOptionsResponse>("/filters/options", signal);
}

export function getDashboardMetrics(
  filters: DashboardFilters,
  signal?: AbortSignal
): Promise<DashboardMetrics> {
  return fetchJson<DashboardMetrics>(`/dashboard/metrics${buildDashboardQuery(filters)}`, signal);
}

export function getBalanceEvolution(
  filters: DashboardFilters,
  signal?: AbortSignal
): Promise<BalanceEvolutionPoint[]> {
  return fetchJson<BalanceEvolutionPoint[]>(
    `/dashboard/charts/balance-evolution${buildDashboardQuery(filters, {
      start_date: null,
      end_date: null
    })}`,
    signal
  );
}

export function getCashFlow(
  filters: DashboardFilters,
  signal?: AbortSignal
): Promise<CashFlowPoint[]> {
  return fetchJson<CashFlowPoint[]>(`/dashboard/charts/cash-flow${buildDashboardQuery(filters)}`, signal);
}

export function getDistribution(
  filters: DashboardFilters,
  type: TransactionType,
  signal?: AbortSignal
): Promise<DistributionPoint[]> {
  return fetchJson<DistributionPoint[]>(
    `/dashboard/charts/distribution${buildDashboardQuery(filters, { type })}`,
    signal
  );
}
