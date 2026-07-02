import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { NormalizedSavingsGoal, ResourceState, SavingsGoalUpdate } from "../types/dashboard";
import { formatMoney, formatPercent } from "../utils/format";

interface SavingsGoalCardProps {
  goal: ResourceState<NormalizedSavingsGoal | null>;
  onSave: (payload: SavingsGoalUpdate) => Promise<void>;
  variant?: "panel" | "metric";
}

function initialForm(goal: NormalizedSavingsGoal | null): SavingsGoalUpdate {
  return {
    target_amount: goal?.targetAmount.toFixed(2) ?? "",
    start_date: goal?.startDate ?? "",
    end_date: goal?.endDate ?? ""
  };
}

export function SavingsGoalCard({ goal, onSave, variant = "panel" }: SavingsGoalCardProps) {
  const metricVariant = variant === "metric";
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

  return (
    <section className={`${metricVariant ? "min-h-[132px]" : ""} border border-grid bg-canvas p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-muted-strong">Savings Goal</p>
          <h2 className={`${metricVariant ? "mt-1 text-sm" : "mt-2 text-lg"} font-bold uppercase text-ink`}>
            Goal Progress
          </h2>
        </div>
        {configured && !showForm ? (
          <button
            className={`${metricVariant ? "px-2 py-1" : "px-3 py-2"} border border-ink text-xs font-bold uppercase text-ink hover:border-accent hover:text-accent`}
            onClick={() => setEditing(true)}
            type="button"
          >
            Edit
          </button>
        ) : null}
      </div>

      {goal.status === "error" ? <p className="mt-4 text-sm text-danger">{goal.error}</p> : null}

      {showForm ? (
        <form
          className={
            metricVariant ? "mt-3 grid gap-2" : "mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          }
          onSubmit={handleSubmit}
        >
          <label className="grid gap-2 text-xs font-bold uppercase text-muted">
            Target amount
            <input
              className={`${metricVariant ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} border border-grid bg-canvas text-ink`}
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
              className={`${metricVariant ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} border border-grid bg-canvas text-ink`}
              onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
              required
              type="date"
              value={form.start_date}
            />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase text-muted">
            Deadline
            <input
              className={`${metricVariant ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} border border-grid bg-canvas text-ink`}
              onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
              required
              type="date"
              value={form.end_date}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              className={`${metricVariant ? "px-3 py-1" : "px-4 py-2"} bg-ink text-xs font-bold uppercase text-canvas hover:bg-accent`}
              disabled={loading}
              type="submit"
            >
              {loading ? "Saving" : "Save"}
            </button>
            {configured ? (
              <button
                className={`${metricVariant ? "px-3 py-1" : "px-4 py-2"} border border-grid text-xs font-bold uppercase text-muted hover:border-ink hover:text-ink`}
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
      ) : metricVariant && currentGoal !== null ? (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs uppercase text-muted">
          <div>
            <p>Target</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {loading ? "--" : formatMoney(currentGoal.targetAmount)}
            </p>
          </div>
          <div>
            <p>Completion</p>
            <p className="mt-1 text-sm font-bold text-accent">
              {loading ? "--" : formatPercent(currentGoal.completionPercentage)}
            </p>
          </div>
          <div>
            <p>Progress</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {loading ? "--" : formatMoney(currentGoal.progress)}
            </p>
          </div>
          <div>
            <p>Deadline</p>
            <p className="mt-1 text-sm font-bold text-ink">{loading ? "--" : currentGoal.endDate}</p>
          </div>
        </div>
      ) : currentGoal !== null ? (
        <div className="mt-5 grid gap-px bg-grid p-px sm:grid-cols-3">
          <div className="bg-canvas p-4">
            <p className="text-xs uppercase text-muted">Target</p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {loading ? "--" : formatMoney(currentGoal.targetAmount)}
            </p>
          </div>
          <div className="bg-canvas p-4">
            <p className="text-xs uppercase text-muted">Completion</p>
            <p className="mt-3 text-2xl font-bold text-accent">
              {loading ? "--" : formatPercent(currentGoal.completionPercentage)}
            </p>
            <p className="mt-2 text-xs uppercase text-muted">
              Progress {loading ? "--" : formatMoney(currentGoal.progress)}
            </p>
          </div>
          <div className="bg-canvas p-4">
            <p className="text-xs uppercase text-muted">Deadline</p>
            <p className="mt-3 text-2xl font-bold text-ink">{loading ? "--" : currentGoal.endDate}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
