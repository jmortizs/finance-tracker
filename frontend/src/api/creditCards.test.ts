import { afterEach, expect, it, vi } from "vitest";

import { getCreditCardMetrics, uploadCreditCardStatement } from "./creditCards";

afterEach(() => vi.unstubAllGlobals());

it("requests independent credit-card metrics", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  vi.stubGlobal("fetch", fetchMock);

  await getCreditCardMetrics();

  expect(fetchMock).toHaveBeenCalledWith("/api/v1/credit-cards/metrics", {
    headers: { Accept: "application/json" },
    signal: undefined
  });
});

it("uploads a credit-card statement to its independent endpoint", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  vi.stubGlobal("fetch", fetchMock);

  await uploadCreditCardStatement(new File(["pdf"], "card.pdf", { type: "application/pdf" }));

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/v1/credit-cards/statements/upload",
    expect.objectContaining({ method: "POST" })
  );
});
