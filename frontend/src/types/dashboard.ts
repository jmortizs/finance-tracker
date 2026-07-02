export type TransactionType = "INCOME" | "EXPENSE";

export type ApiDecimal = number | string;

export interface BankOption {
  id: number;
  name: string;
}

export interface AccountOption {
  id: number;
  bank_id: number;
  name: string;
  account_number: string;
  currency: string;
}

export interface FilterOptionsResponse {
  banks: BankOption[];
  accounts: AccountOption[];
  min_transaction_date: string | null;
  max_transaction_date: string | null;
}

export interface MetricWithVariation {
  value: ApiDecimal;
  previous_value: ApiDecimal;
  change_percent: ApiDecimal | null;
}

export interface DashboardMetrics {
  balance: MetricWithVariation;
  income: MetricWithVariation;
  expenses: MetricWithVariation;
  net_savings: MetricWithVariation;
  savings_percentage: MetricWithVariation;
}

export interface BalanceEvolutionPoint {
  month: string;
  balance: ApiDecimal;
}

export interface CashFlowPoint {
  month: string;
  income: ApiDecimal;
  expenses: ApiDecimal;
  net_savings: ApiDecimal;
}

export interface DistributionPoint {
  category_id: number | null;
  category_name: string;
  type: TransactionType;
  amount: ApiDecimal;
  percentage: ApiDecimal;
}

export interface SavingsGoal {
  id: number;
  target_amount: ApiDecimal;
  start_date: string;
  end_date: string;
  progress: ApiDecimal;
  completion_percentage: ApiDecimal;
}

export interface SavingsGoalUpdate {
  target_amount: ApiDecimal;
  start_date: string;
  end_date: string;
}

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  bankId: number | null;
  accountId: number | null;
}

export type ResourceStatus = "idle" | "loading" | "success" | "error";

export interface ResourceState<T> {
  status: ResourceStatus;
  data: T | null;
  error: string | null;
}

export interface NormalizedMetric {
  value: number;
  previousValue: number;
  changePercent: number | null;
}

export interface NormalizedMetrics {
  balance: NormalizedMetric;
  income: NormalizedMetric;
  expenses: NormalizedMetric;
  netSavings: NormalizedMetric;
  savingsPercentage: NormalizedMetric;
}

export interface NormalizedBalancePoint {
  month: string;
  balance: number;
}

export interface NormalizedCashFlowPoint {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface NormalizedDistributionPoint {
  categoryId: number | null;
  categoryName: string;
  type: TransactionType;
  amount: number;
  percentage: number;
}

export interface NormalizedSavingsGoal {
  id: number;
  targetAmount: number;
  startDate: string;
  endDate: string;
  progress: number;
  completionPercentage: number;
}
