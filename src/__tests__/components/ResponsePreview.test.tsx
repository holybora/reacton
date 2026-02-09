import { render, screen } from "@testing-library/react";
import ResponsePreview from "@/components/card/ResponsePreview";

describe("ResponsePreview", () => {
  it("shows placeholder when no content and not loading", () => {
    render(<ResponsePreview content={null} isLoading={false} error={null} />);
    expect(screen.getByText("Submit a prompt to see the response")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    const { container } = render(
      <ResponsePreview content={null} isLoading={true} error={null} />
    );
    const pulsingElements = container.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBe(5);
  });

  it("shows error state with message", () => {
    render(
      <ResponsePreview
        content={null}
        isLoading={false}
        error="Authentication failed. Check your API token."
      />
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Authentication failed. Check your API token.")
    ).toBeInTheDocument();
  });

  it("renders iframe with content when available", () => {
    const html = "<html><body>Hello</body></html>";
    const { container } = render(
      <ResponsePreview content={html} isLoading={false} error={null} />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("srcdoc")).toBe(html);
    expect(iframe?.getAttribute("sandbox")).toBe("allow-scripts");
  });

  it("prioritizes loading over error", () => {
    const { container } = render(
      <ResponsePreview content={null} isLoading={true} error="some error" />
    );
    const pulsingElements = container.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBe(5);
    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });

  it("prioritizes error over placeholder", () => {
    render(
      <ResponsePreview content={null} isLoading={false} error="Token expired" />
    );
    expect(screen.getByText("Token expired")).toBeInTheDocument();
    expect(
      screen.queryByText("Submit a prompt to see the response")
    ).not.toBeInTheDocument();
  });
});
