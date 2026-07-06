import { memo, useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { NormalizedSavingsGoal, ResourceState, SavingsGoalUpdate } from "../types/dashboard";
import { formatMoney } from "../utils/format";

interface SavingsProgressBarProps {
  goal: ResourceState<NormalizedSavingsGoal | null>;
  onSave: (payload: SavingsGoalUpdate) => Promise<void>;
}

function initialForm(goal: NormalizedSavingsGoal | null): SavingsGoalUpdate {
  return {
    target_amount: goal?.targetAmount.toFixed(2) ?? "",
    start_date: goal?.startDate ?? "",
    end_date: goal?.endDate ?? ""
  };
}

function calculateProgressPercentage(progress: number, targetAmount: number): number {
  if (targetAmount === 0) {
    return 0;
  }

  return (progress / targetAmount) * 100;
}

function formatProgressPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export const SavingsProgressBar = memo(function SavingsProgressBar({
  goal,
  onSave
}: SavingsProgressBarProps) {
  const configured = goal.data !== null;
  const [editing, setEditing] = useState(!configured);
  const [form, setForm] = useState<SavingsGoalUpdate>(() => initialForm(goal.data));
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialForm(goal.data));
    setEditing(goal.data === null);
  }, [goal.data]);

  const loading = goal.status === "loading";
  const showForm = editing || !configured;
  const currentGoal = goal.data;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    try {
      await onSave(form);
      setEditing(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save savings goal");
    }
  }

  const progress = currentGoal?.progress ?? 0;
  const targetAmount = currentGoal?.targetAmount ?? 0;
  const percentage = calculateProgressPercentage(progress, targetAmount);
  const fillWidth = Math.min(Math.abs(percentage), 100);
  const isNegative = progress < 0;
  const isPositive = progress > 0;
  const fillColorClass = isNegative ? "bg-danger" : "bg-accent";
  const percentageColorClass = isNegative ? "text-danger" : isPositive ? "text-accent" : "text-ink";
  const markerColorClass = isNegative
    ? "border-danger bg-danger"
    : isPositive
      ? "border-accent bg-accent"
      : "border-ink bg-canvas";

  return (
    <section className="h-full bg-canvas p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase text-muted-strong">Savings Goals</p>
        {configured && !showForm ? (
          <button
            className="border border-ink px-2 py-1 text-xs font-bold uppercase text-ink hover:border-accent hover:text-accent"
            onClick={() => setEditing(true)}
            type="button"
          >
            Edit
          </button>
        ) : null}
      </div>

      {goal.status === "error" ? <p className="mt-4 text-sm text-danger">{goal.error}</p> : null}

      {showForm ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-xs font-bold uppercase text-muted">
            Target amount
            <input
              className="border border-grid bg-canvas px-3 py-2 text-sm text-ink"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, target_amount: event.target.value }))}
              required
              step="0.01"
              type="number"
              value={form.target_amount}
            />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase text-muted">
            Start date
            <input
              className="border border-grid bg-canvas px-3 py-2 text-sm text-ink"
              onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
              required
              type="date"
              value={form.start_date}
            />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase text-muted">
            Deadline
            <input
              className="border border-grid bg-canvas px-3 py-2 text-sm text-ink"
              onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
              required
              type="date"
              value={form.end_date}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              className="bg-ink px-4 py-2 text-xs font-bold uppercase text-canvas hover:bg-accent"
              disabled={loading}
              type="submit"
            >
              {loading ? "Saving" : "Save"}
            </button>
            {configured ? (
              <button
                className="border border-grid px-4 py-2 text-xs font-bold uppercase text-muted hover:border-ink hover:text-ink"
                disabled={loading}
                onClick={() => {
                  setForm(initialForm(goal.data));
                  setEditing(false);
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
          {submitError ? <p className="text-sm text-danger md:col-span-4">{submitError}</p> : null}
        </form>
      ) : currentGoal !== null ? (
        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2">
          <p className="text-lg font-bold text-ink">{loading ? "--" : formatMoney(progress)}</p>

          <div className="relative min-h-[3rem] min-w-0 py-5">
            <div className="relative h-1.5 border border-grid bg-canvas">
              {(isPositive || isNegative) && fillWidth > 0 ? (
                <div
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 ${fillColorClass}`}
                  style={{ width: `${fillWidth}%` }}
                />
              ) : null}
            </div>
            <div
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${fillWidth}%` }}
            >
              <span className={`absolute bottom-full mb-2 whitespace-nowrap text-sm font-bold ${percentageColorClass}`}>
                {loading ? "--" : formatProgressPercentage(percentage)}
              </span>
              <span aria-hidden="true" className={`block h-3 w-3 rounded-full border-2 ${markerColorClass}`} />
            </div>
          </div>

          <p className="text-lg font-bold text-ink">{loading ? "--" : formatMoney(targetAmount)}</p>

          <span aria-hidden="true" />
          <div className="flex justify-between text-xs text-ink">
            <span>{loading ? "--" : currentGoal.startDate}</span>
            <span>{loading ? "--" : currentGoal.endDate}</span>
          </div>
          <span aria-hidden="true" />
        </div>
      ) : null}
    </section>
  );
});
