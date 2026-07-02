import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { NormalizedSavingsGoal, ResourceState, SavingsGoalUpdate } from "../types/dashboard";
import { formatMoney, formatPercent } from "../utils/format";

interface SavingsGoalCardProps {
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

export function SavingsGoalCard({ goal, onSave }: SavingsGoalCardProps) {
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
    <section className="border border-grid bg-canvas p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-muted-strong">Savings Goal</p>
          <h2 className="mt-2 text-lg font-bold uppercase text-ink">Goal Progress</h2>
        </div>
        {configured && !showForm ? (
          <button
            className="border border-ink px-3 py-2 text-xs font-bold uppercase text-ink hover:border-accent hover:text-accent"
            onClick={() => setEditing(true)}
            type="button"
          >
            Edit
          </button>
        ) : null}
      </div>

      {goal.status === "error" ? <p className="mt-4 text-sm text-danger">{goal.error}</p> : null}

      {showForm ? (
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
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
