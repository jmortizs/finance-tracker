import { FilterSidebar } from "./components/FilterSidebar";
import { MetricCard } from "./components/MetricCard";
import { ChartPanel } from "./components/PanelState";
import { SavingsProgressBar } from "./components/SavingsProgressBar";
import { BalanceEvolutionChart } from "./components/charts/BalanceEvolutionChart";
import { CashFlowChart } from "./components/charts/CashFlowChart";
import { DistributionChart } from "./components/charts/DistributionChart";
import { useDashboard } from "./hooks/useDashboard";

export function App() {
  const dashboard = useDashboard();
  const metricsLoading = dashboard.metrics.status === "loading" || dashboard.metrics.status === "idle";

  return (
    <div className="min-h-screen bg-canvas text-ink lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="lg:flex lg:h-full">
        <FilterSidebar
          filters={dashboard.filters}
          options={dashboard.options}
          availableAccounts={dashboard.availableAccounts}
          onChange={dashboard.setFilters}
          onReset={dashboard.resetFilters}
          onRefresh={dashboard.refresh}
        />

        <main className="grid min-w-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-px bg-grid p-px lg:h-full lg:overflow-hidden">
          <section className="grid gap-px sm:grid-cols-2 xl:grid-cols-4">
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
          </section>

          <section className="min-w-0">
            <SavingsProgressBar
              goal={dashboard.savingsGoal}
              onSave={dashboard.saveSavingsGoal}
            />
          </section>

          <section className="grid min-h-0 gap-px lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
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
