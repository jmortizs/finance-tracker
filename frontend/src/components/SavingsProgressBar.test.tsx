import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { SavingsProgressBar } from "./SavingsProgressBar";
import type { NormalizedSavingsGoal, ResourceState } from "../types/dashboard";

function buildGoal(
  overrides: Partial<NormalizedSavingsGoal> = {}
): ResourceState<NormalizedSavingsGoal | null> {
  return {
    status: "success",
    data: {
      id: 1,
      targetAmount: 1000,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      progress: 200,
      completionPercentage: 20,
      ...overrides
    },
    error: null
  };
}

describe("SavingsProgressBar", () => {
  it("renders progress bar with amounts, dates, and positive percentage", () => {
    render(
      <SavingsProgressBar
        goal={buildGoal({ progress: 9635786.49, targetAmount: 15000000, completionPercentage: 64.2 })}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText("Savings Goals")).toBeInTheDocument();
    expect(screen.getByText("$9,635,786.49")).toBeInTheDocument();
    expect(screen.getByText("$15,000,000.00")).toBeInTheDocument();
    expect(screen.getByText("64.2%")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });

  it("renders zero progress state", () => {
    const { container } = render(
      <SavingsProgressBar goal={buildGoal({ progress: 0, completionPercentage: 0 })} onSave={vi.fn()} />
    );

    const label = screen.getByText("0.0%");
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label.parentElement).not.toBeNull();
    expect(label.parentElement as HTMLElement).toHaveStyle({ left: "0%" });
    expect(container.querySelector(".bg-accent")).not.toBeInTheDocument();
  });

  it("renders negative progress with danger styling", () => {
    const { container } = render(
      <SavingsProgressBar goal={buildGoal({ progress: -200, completionPercentage: -20 })} onSave={vi.fn()} />
    );

    expect(screen.getByText("-$200.00")).toBeInTheDocument();
    expect(screen.getByText("-20.0%")).toBeInTheDocument();
    expect(container.querySelector(".bg-danger")).toBeInTheDocument();
  });

  it("renders positive fill with accent styling", () => {
    const { container } = render(<SavingsProgressBar goal={buildGoal()} onSave={vi.fn()} />);

    expect(container.querySelector(".bg-accent")).toBeInTheDocument();
  });

  it("positions the percentage label and marker at the current progress point", () => {
    render(<SavingsProgressBar goal={buildGoal()} onSave={vi.fn()} />);

    const label = screen.getByText("20.0%");
    const markerGroup = label.parentElement;

    expect(markerGroup).not.toBeNull();
    expect(markerGroup as HTMLElement).toHaveStyle({ left: "20%" });
    expect(label).toHaveClass("text-accent");
    expect(markerGroup?.querySelector(".rounded-full.bg-accent")).toBeInTheDocument();
  });

  it("saves inline edits without navigation", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<SavingsProgressBar goal={buildGoal()} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Target amount"));
    await user.type(screen.getByLabelText("Target amount"), "3000");
    await user.clear(screen.getByLabelText("Start date"));
    await user.type(screen.getByLabelText("Start date"), "2026-05-01");
    await user.clear(screen.getByLabelText("Deadline"));
    await user.type(screen.getByLabelText("Deadline"), "2026-12-31");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith({
      target_amount: "3000",
      start_date: "2026-05-01",
      end_date: "2026-12-31"
    });
  });
});
