import type { ApiDecimal } from "./dashboard";

export type CreditCardItemKind = "purchase" | "payment" | "interest";

export interface CreditCardMetrics {
  current_statement_balance: ApiDecimal;
  credit_utilization: ApiDecimal;
  available_credit: ApiDecimal;
  weighted_apr: ApiDecimal;
  active_plans: number;
}

export interface CreditCardMonthlyActivityPoint {
  month: string;
  spending: ApiDecimal;
  payments: ApiDecimal;
  interest: ApiDecimal;
}

export interface CreditCardCategoryDistributionPoint {
  category: string;
  amount: ApiDecimal;
  percentage: ApiDecimal;
}

export interface CreditCardStatementItem {
  id: number;
  transaction_date: string;
  description: string;
  category: string;
  kind: CreditCardItemKind;
  amount: ApiDecimal;
  installment_number: number | null;
  installment_total: number | null;
  remaining_amount: ApiDecimal | null;
}

export interface CreditCardStatementUploadResponse {
  statement_id: number;
  credit_card_id: number;
  file_name: string;
  file_hash: string;
  inserted_items: number;
}

export interface NormalizedCreditCardMetrics {
  currentStatementBalance: number;
  creditUtilization: number;
  availableCredit: number;
  weightedApr: number;
  activePlans: number;
}

export interface NormalizedCreditCardMonthlyActivityPoint {
  month: string;
  spending: number;
  payments: number;
  interest: number;
}

export interface NormalizedCreditCardCategoryDistributionPoint {
  category: string;
  amount: number;
  percentage: number;
}

export interface NormalizedCreditCardStatementItem {
  id: number;
  transactionDate: string;
  description: string;
  category: string;
  kind: CreditCardItemKind;
  amount: number;
  installmentNumber: number | null;
  installmentTotal: number | null;
  remainingAmount: number | null;
}
