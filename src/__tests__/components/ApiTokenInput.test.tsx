import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApiTokenInput from "@/components/card/ApiTokenInput";

describe("ApiTokenInput", () => {
  it("renders with idle state (gray border)", () => {
    render(<ApiTokenInput value="" onChange={() => {}} tokenStatus="idle" />);
    const input = screen.getByPlaceholderText("Enter API token");
    expect(input).toBeInTheDocument();
    expect(input.className).toContain("border-gray-700");
  });

  it("shows green border and 'Token valid' for valid status", () => {
    render(<ApiTokenInput value="sk-valid" onChange={() => {}} tokenStatus="valid" />);
    const input = screen.getByPlaceholderText("Enter API token");
    expect(input.className).toContain("border-green-500");
    expect(screen.getByText("Token valid")).toBeInTheDocument();
  });

  it("shows red border and 'Invalid token' for invalid status", () => {
    render(<ApiTokenInput value="sk-bad" onChange={() => {}} tokenStatus="invalid" />);
    const input = screen.getByPlaceholderText("Enter API token");
    expect(input.className).toContain("border-red-500");
    expect(screen.getByText("Invalid token")).toBeInTheDocument();
  });

  it("shows yellow border and 'Validating...' for validating status", () => {
    render(<ApiTokenInput value="sk-..." onChange={() => {}} tokenStatus="validating" />);
    const input = screen.getByPlaceholderText("Enter API token");
    expect(input.className).toContain("border-yellow-500");
    expect(screen.getByText("Validating...")).toBeInTheDocument();
  });

  it("does not show status text for idle", () => {
    render(<ApiTokenInput value="" onChange={() => {}} tokenStatus="idle" />);
    expect(screen.queryByText("Token valid")).not.toBeInTheDocument();
    expect(screen.queryByText("Invalid token")).not.toBeInTheDocument();
    expect(screen.queryByText("Validating...")).not.toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ApiTokenInput value="" onChange={onChange} tokenStatus="idle" />);
    const input = screen.getByPlaceholderText("Enter API token");
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("toggles visibility with show/hide button", async () => {
    const user = userEvent.setup();
    render(<ApiTokenInput value="secret" onChange={() => {}} tokenStatus="idle" />);
    const input = screen.getByPlaceholderText("Enter API token");
    expect(input).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByLabelText("Show token");
    await user.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");

    const hideBtn = screen.getByLabelText("Hide token");
    await user.click(hideBtn);
    expect(input).toHaveAttribute("type", "password");
  });
});
