import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom de prueba");
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <div>todo bien</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("todo bien")).toBeInTheDocument();
  });

  it("renders the recovery screen when a child throws", () => {
    // React logs the caught error loudly; keep test output clean.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Fallo crítico/i)).toBeInTheDocument();
    expect(screen.getByText(/boom de prueba/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Recargar/i }),
    ).toBeInTheDocument();
    spy.mockRestore();
  });
});
