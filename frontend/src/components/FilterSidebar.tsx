import { useRef, useState } from "react";
import { RefreshCcw, RotateCcw, Upload } from "lucide-react";

import { uploadStatement } from "../api/dashboard";

import type {
  AccountOption,
  DashboardFilters,
  FilterOptionsResponse,
  ResourceState
} from "../types/dashboard";

interface FilterSidebarProps {
  filters: DashboardFilters;
  options: ResourceState<FilterOptionsResponse>;
  availableAccounts: AccountOption[];
  onChange: (filters: Partial<DashboardFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
}

function parseSelectNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function FilterSidebar({
  filters,
  options,
  availableAccounts,
  onChange,
  onReset,
  onRefresh
}: FilterSidebarProps) {
  const banks = options.data?.banks ?? [];
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleStatementUpload(file: File | undefined): Promise<void> {
    if (file === undefined) {
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus("error");
      setUploadMessage("Select one PDF statement file.");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Parsing statement...");
    try {
      const result = await uploadStatement(file);
      setUploadStatus("success");
      setUploadMessage(
        `Inserted ${result.inserted_transactions}; skipped ${result.skipped_transactions}.`
      );
      onRefresh();
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error instanceof Error ? error.message : "Statement upload failed.");
    } finally {
      if (fileInputRef.current !== null) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <aside className="border-b border-grid bg-canvas lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
      <div className="border-b border-grid px-5 py-5">
        <p className="text-xs uppercase text-muted">Personal Finance</p>
        <h1 className="mt-2 text-xl font-bold uppercase text-ink">Dashboard</h1>
      </div>

      <div className="space-y-5 px-5 py-5">
        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-strong">Start date</span>
          <input
            className="mt-2 h-11 w-full border border-grid bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-strong">End date</span>
          <input
            className="mt-2 h-11 w-full border border-grid bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-strong">Bank</span>
          <select
            className="mt-2 h-11 w-full border border-grid bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
            value={filters.bankId ?? ""}
            onChange={(event) => onChange({ bankId: parseSelectNumber(event.target.value) })}
          >
            <option value="">All banks</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-strong">Account</span>
          <select
            className="mt-2 h-11 w-full border border-grid bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
            value={filters.accountId ?? ""}
            onChange={(event) => onChange({ accountId: parseSelectNumber(event.target.value) })}
          >
            <option value="">All accounts</option>
            {availableAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} / {account.currency}
              </option>
            ))}
          </select>
        </label>

        {options.status === "error" ? (
          <p className="border border-grid p-3 text-xs leading-5 text-muted-strong">
            Filter options failed to load: {options.error}
          </p>
        ) : null}

        <div className="border border-grid p-3" aria-label="Statement PDF upload">
          <div className="flex items-start gap-3">
            <Upload className="mt-0.5 text-accent" size={18} aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase text-ink">Upload statement</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                One PDF at a time. Duplicate files are rejected.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            aria-label="Bank statement PDF"
            className="mt-3 w-full border border-grid bg-canvas p-2 text-xs text-muted-strong file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:text-canvas hover:file:bg-accent"
            type="file"
            accept="application/pdf,.pdf"
            disabled={uploadStatus === "uploading"}
            onChange={(event) => {
              void handleStatementUpload(event.target.files?.[0]);
            }}
          />
          {uploadMessage !== null ? (
            <p
              className={`mt-3 border p-2 text-xs leading-5 ${
                uploadStatus === "error" ? "border-danger text-danger" : "border-accent text-accent"
              }`}
              role="status"
            >
              {uploadMessage}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            className="flex h-11 items-center justify-center gap-2 bg-ink px-3 text-xs font-bold uppercase text-canvas hover:bg-accent"
            type="button"
            onClick={onReset}
            title="Reset filters"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 bg-ink px-3 text-xs font-bold uppercase text-canvas hover:bg-accent"
            type="button"
            onClick={onRefresh}
            title="Refresh dashboard data"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>
    </aside>
  );
}
