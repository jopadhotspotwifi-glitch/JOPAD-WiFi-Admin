import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/StatCard";

const DummyIcon = () => <svg data-testid="icon" />;

describe("StatCard", () => {
  it("renders the title and value", () => {
    render(<StatCard title="Total Clients" value={42} icon={<DummyIcon />} />);
    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(
      <StatCard title="Revenue" value="UGX 5,000,000" icon={<DummyIcon />} />,
    );
    expect(screen.getByText("UGX 5,000,000")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<StatCard title="Test" value={0} icon={<DummyIcon />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <StatCard
        title="Sessions"
        value={10}
        icon={<DummyIcon />}
        subtitle="Last 30 days"
      />,
    );
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("does NOT render subtitle section when omitted", () => {
    render(<StatCard title="Sessions" value={10} icon={<DummyIcon />} />);
    expect(screen.queryByText("Last 30 days")).not.toBeInTheDocument();
  });

  it("renders positive trend with green colour and upward arrow", () => {
    render(
      <StatCard
        title="Growth"
        value={100}
        icon={<DummyIcon />}
        trend={{ value: 15, isPositive: true }}
      />,
    );
    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.getByText("15%")).toHaveClass("text-green-600");
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("renders negative trend with red colour", () => {
    render(
      <StatCard
        title="Decline"
        value={50}
        icon={<DummyIcon />}
        trend={{ value: 8, isPositive: false }}
      />,
    );
    expect(screen.getByText("8%")).toHaveClass("text-red-600");
  });

  it("does NOT render trend section when trend prop is omitted", () => {
    render(<StatCard title="Flat" value={0} icon={<DummyIcon />} />);
    expect(screen.queryByText("vs last month")).not.toBeInTheDocument();
  });
});
