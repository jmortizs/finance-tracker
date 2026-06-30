import type { ReactNode } from "react";

interface PanelStateProps {
  title: string;
  message: string;
}

export function PanelState({ title, message }: PanelStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center border border-grid px-4 py-8 text-center">
      <p className="text-xs uppercase tracking-normal text-accent">{title}</p>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-strong">{message}</p>
    </div>
  );
}

interface ChartPanelProps {
  title: string;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  isEmpty: boolean;
  children: ReactNode;
}

export function ChartPanel({ title, status, error, isEmpty, children }: ChartPanelProps) {
  return (
    <section className="border border-grid bg-canvas">
      <div className="flex min-h-12 items-center justify-between border-b border-grid px-4">
        <h2 className="text-sm font-bold uppercase text-ink">{title}</h2>
      </div>
      <div className="p-4">
        {status === "loading" ? (
          <PanelState title="Loading" message="Requesting the latest local analytics payload." />
        ) : null}
        {status === "error" ? (
          <PanelState title="Error" message={error ?? "The dashboard region failed to load."} />
        ) : null}
        {status === "success" && isEmpty ? (
          <PanelState title="Empty" message="No records match the selected filters." />
        ) : null}
        {status === "success" && !isEmpty ? children : null}
        {status === "idle" ? (
          <PanelState title="Idle" message="Waiting for dashboard data." />
        ) : null}
      </div>
    </section>
  );
}
