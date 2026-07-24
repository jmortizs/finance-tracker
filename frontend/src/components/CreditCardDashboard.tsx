import { useRef, useState } from "react";
import { ArrowLeft, RefreshCcw, Upload } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { uploadCreditCardStatement } from "../api/creditCards";
import { useCreditCardDashboard } from "../hooks/useCreditCardDashboard";
import { formatMoney, formatMoneyCompact, formatMonth, formatPercent } from "../utils/format";
import { LineSeriesDot } from "./charts/LineSeriesDot";
import { ChartPanel, PanelState } from "./PanelState";

const DONUT_COLORS = ["#87E614", "#FFFFFF", "#888888", "#A0A0A0", "#1C1C1C", "#FF4D4D"];

interface CreditCardDashboardProps {
  onBack: () => void;
}

function CreditCardMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <section className="border border-grid bg-canvas p-4">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
      {detail ? <p className="mt-2 text-xs uppercase text-muted-strong">{detail}</p> : null}
    </section>
  );
}

export function CreditCardDashboard({ onBack }: CreditCardDashboardProps) {
  const dashboard = useCreditCardDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const metrics = dashboard.metrics.data;

  async function handleUpload(file: File | undefined): Promise<void> {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadMessage("Select one PDF statement file.");
      return;
    }
    setUploading(true);
    setUploadMessage("Parsing credit-card statement...");
    try {
      const result = await uploadCreditCardStatement(file);
      setUploadMessage(`Inserted ${result.inserted_items} statement items.`);
      dashboard.refresh();
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Credit-card statement upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const activity = dashboard.activity.data ?? [];
  const distribution = dashboard.distribution.data ?? [];
  const items = dashboard.items.data ?? [];

  return (
    <main className="min-h-screen bg-canvas p-4 text-ink lg:p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-grid pb-4">
          <div>
            <p className="text-xs uppercase text-muted">Personal Finance</p>
            <h1 className="mt-1 text-xl font-bold uppercase">Credit Cards</h1>
          </div>
          <div className="flex gap-2">
            <button className="border border-grid px-3 py-2 text-xs font-bold uppercase hover:border-accent" onClick={dashboard.refresh} type="button">
              <RefreshCcw className="mr-2 inline" size={14} /> Refresh
            </button>
            <button className="bg-ink px-3 py-2 text-xs font-bold uppercase text-canvas hover:bg-accent" onClick={onBack} type="button">
              <ArrowLeft className="mr-2 inline" size={14} /> Dashboard
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-px bg-grid sm:grid-cols-2 xl:grid-cols-4">
          <CreditCardMetric label="Current statement balance" value={formatMoney(metrics?.currentStatementBalance ?? 0)} />
          <CreditCardMetric label="Credit utilization" value={formatPercent(metrics?.creditUtilization ?? 0)} detail={`Available ${formatMoney(metrics?.availableCredit ?? 0)}`} />
          <CreditCardMetric label="Weighted APR" value={formatPercent(metrics?.weightedApr ?? 0)} />
          <CreditCardMetric label="Active plans" value={String(metrics?.activePlans ?? 0)} detail="Open installments" />
        </div>

        <div className="mb-4 border border-grid p-3">
          <label className="block text-xs font-bold uppercase text-muted-strong">Upload credit-card statement</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Upload className="text-accent" size={18} aria-hidden="true" />
            <input ref={fileInputRef} aria-label="Credit-card statement PDF" className="min-w-[260px] text-xs text-muted file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:text-canvas hover:file:bg-accent" type="file" accept="application/pdf,.pdf" disabled={uploading} onChange={(event) => void handleUpload(event.target.files?.[0])} />
            {uploadMessage ? <p className="text-xs text-muted-strong" role="status">{uploadMessage}</p> : null}
          </div>
        </div>

        <section className="mb-4 grid min-h-[350px] gap-4 lg:grid-cols-2">
          <ChartPanel title="Monthly activity" status={dashboard.activity.status} error={dashboard.activity.error} isEmpty={activity.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity.map((point) => ({ ...point, label: formatMonth(point.month) }))}>
                <CartesianGrid stroke="#1C1C1C" strokeDasharray="0" />
                <XAxis dataKey="label" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickFormatter={(value) => formatMoneyCompact(Number(value))} tickLine={false} axisLine={false} width={82} />
                <Tooltip contentStyle={{ background: "#000000", border: "1px solid #1C1C1C" }} formatter={(value, name) => [formatMoney(Number(value)), String(name)]} />
                <Line type="linear" dataKey="spending" name="Spending" stroke="#FF4D4D" dot={<LineSeriesDot />} isAnimationActive={false} />
                <Line type="linear" dataKey="payments" name="Payments" stroke="#87E614" dot={<LineSeriesDot />} isAnimationActive={false} />
                <Line type="linear" dataKey="interest" name="Interest" stroke="#FFFFFF" dot={<LineSeriesDot />} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Expense categories" status={dashboard.distribution.status} error={dashboard.distribution.error} isEmpty={distribution.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="amount" nameKey="category" innerRadius="64%" outerRadius="88%" stroke="#000000" isAnimationActive={false}>
                  {distribution.map((point, index) => <Cell key={point.category} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#000000", border: "1px solid #1C1C1C" }} formatter={(value) => formatMoney(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </section>

        <section className="border border-grid bg-canvas">
          <div className="border-b border-grid px-4 py-3"><h2 className="text-sm font-bold uppercase">Statement items</h2></div>
          {dashboard.items.status === "error" ? <PanelState title="Error" message={dashboard.items.error ?? "Statement items failed to load."} /> : null}
          {dashboard.items.status === "success" && items.length === 0 ? <PanelState title="Empty" message="Upload a credit-card statement to view its items." /> : null}
          {dashboard.items.status === "success" && items.length > 0 ? (
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full min-w-[900px] text-left text-xs uppercase">
                <thead className="sticky top-0 bg-canvas text-muted"><tr><th className="border-b border-grid px-4 py-3">Date</th><th className="border-b border-grid px-4 py-3">Description</th><th className="border-b border-grid px-4 py-3">Category</th><th className="border-b border-grid px-4 py-3 text-right">Installments</th><th className="border-b border-grid px-4 py-3 text-right">Amount</th><th className="border-b border-grid px-4 py-3 text-right">Remaining</th></tr></thead>
                <tbody>{items.map((item) => <tr key={item.id}><td className="border-b border-grid px-4 py-3 text-muted-strong">{item.transactionDate}</td><td className="border-b border-grid px-4 py-3 text-ink">{item.description}</td><td className="border-b border-grid px-4 py-3 text-muted-strong">{item.category}</td><td className="border-b border-grid px-4 py-3 text-right text-muted-strong">{item.installmentNumber && item.installmentTotal ? `${item.installmentNumber}/${item.installmentTotal}` : "-"}</td><td className={`border-b border-grid px-4 py-3 text-right ${item.kind === "payment" ? "text-accent" : "text-danger"}`}>{formatMoney(item.amount)}</td><td className="border-b border-grid px-4 py-3 text-right text-muted-strong">{item.remainingAmount === null ? "-" : formatMoney(item.remainingAmount)}</td></tr>)}</tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
