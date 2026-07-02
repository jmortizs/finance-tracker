import { FilterSidebar } from "./components/FilterSidebar";
import { MetricCard } from "./components/MetricCard";
import { ChartPanel } from "./components/PanelState";
import { SavingsGoalCard } from "./components/SavingsGoalCard";
import { BalanceEvolutionChart } from "./components/charts/BalanceEvolutionChart";
import { CashFlowChart } from "./components/charts/CashFlowChart";
import { DistributionChart } from "./components/charts/DistributionChart";
import { useDashboard } from "./hooks/useDashboard";

export function App() {
  const dashboard = useDashboard();
  const metricsLoading = dashboard.metrics.status === "loading" || dashboard.metrics.status === "idle";

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="lg:flex">
        <FilterSidebar
          filters={dashboard.filters}
          options={dashboard.options}
          availableAccounts={dashboard.availableAccounts}
          onChange={dashboard.setFilters}
          onReset={dashboard.resetFilters}
          onRefresh={dashboard.refresh}
        />

        <main className="min-w-0 flex-1">
          <header className="border-b border-grid px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-muted">Local Analytics</p>
                <h2 className="mt-2 text-lg font-bold uppercase text-ink sm:text-2xl">
                  Finance Overview
                </h2>
              </div>
              <span className="border border-accent px-3 py-2 text-xs font-bold uppercase text-accent">
                API /api/v1
              </span>
            </div>
          </header>

          <section aria-label="Top dashboard metrics" className="grid gap-px bg-grid p-px sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Balance"
              metric={dashboard.metrics.data?.balance ?? null}
              tone="balance"
              loading={metricsLoading}
            />
            <MetricCard
              label="Income"
              metric={dashboard.metrics.data?.income ?? null}
              tone="income"
              loading={metricsLoading}
            />
            <MetricCard
              label="Expenses"
              metric={dashboard.metrics.data?.expenses ?? null}
              tone="expense"
              loading={metricsLoading}
            />
            <MetricCard
              label="Net savings"
              metric={dashboard.metrics.data?.netSavings ?? null}
              tone="savings"
              loading={metricsLoading}
            />
            <SavingsGoalCard
              compact
              goal={dashboard.savingsGoal}
              onSave={dashboard.saveSavingsGoal}
            />
          </section>

          <section className="grid gap-4 p-4 sm:p-6 2xl:grid-cols-2">
            <ChartPanel
              title="Balance Evolution"
              status={dashboard.balanceEvolution.status}
              error={dashboard.balanceEvolution.error}
              isEmpty={(dashboard.balanceEvolution.data ?? []).length === 0}
            >
              <BalanceEvolutionChart data={dashboard.balanceEvolution.data ?? []} />
            </ChartPanel>

            <ChartPanel
              title="Cash Flow"
              status={dashboard.cashFlow.status}
              error={dashboard.cashFlow.error}
              isEmpty={(dashboard.cashFlow.data ?? []).length === 0}
            >
              <CashFlowChart data={dashboard.cashFlow.data ?? []} />
            </ChartPanel>

            <ChartPanel
              title="Income Distribution"
              status={dashboard.incomeDistribution.status}
              error={dashboard.incomeDistribution.error}
              isEmpty={(dashboard.incomeDistribution.data ?? []).length === 0}
            >
              <DistributionChart data={dashboard.incomeDistribution.data ?? []} />
            </ChartPanel>

            <ChartPanel
              title="Expense Distribution"
              status={dashboard.expenseDistribution.status}
              error={dashboard.expenseDistribution.error}
              isEmpty={(dashboard.expenseDistribution.data ?? []).length === 0}
            >
              <DistributionChart data={dashboard.expenseDistribution.data ?? []} />
            </ChartPanel>
          </section>
        </main>
      </div>
    </div>
  );
}
