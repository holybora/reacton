import { renderHook, act, waitFor } from "@testing-library/react";
import { useTokenValidation } from "@/hooks/useTokenValidation";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useTokenValidation", () => {
  it("returns idle for empty token", () => {
    const { result } = renderHook(() => useTokenValidation("openai", ""));
    expect(result.current).toBe("idle");
  });

  it("returns idle for whitespace-only token", () => {
    const { result } = renderHook(() => useTokenValidation("openai", "   "));
    expect(result.current).toBe("idle");
  });

  it("returns validating immediately after token entered", () => {
    const { result } = renderHook(() =>
      useTokenValidation("openai", "sk-token")
    );
    expect(result.current).toBe("validating");
  });

  it("returns valid after successful validation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    const { result } = renderHook(() =>
      useTokenValidation("openai", "sk-valid")
    );

    expect(result.current).toBe("validating");

    // Advance past debounce
    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(result.current).toBe("valid");
    });
  });

  it("returns invalid after failed validation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false }),
    });

    const { result } = renderHook(() =>
      useTokenValidation("openai", "sk-bad")
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(result.current).toBe("invalid");
    });
  });

  it("returns invalid on fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

    const { result } = renderHook(() =>
      useTokenValidation("openai", "sk-err")
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(result.current).toBe("invalid");
    });
  });

  it("resets to idle when token is cleared", () => {
    const { result, rerender } = renderHook(
      ({ token }) => useTokenValidation("openai", token),
      { initialProps: { token: "sk-token" } }
    );

    expect(result.current).toBe("validating");

    rerender({ token: "" });
    expect(result.current).toBe("idle");
  });

  it("sends correct provider in request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    renderHook(() => useTokenValidation("anthropic", "sk-ant"));

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/validate-token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ provider: "anthropic", token: "sk-ant" }),
      })
    );
  });

  it("debounces validation calls", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true }),
    });

    const { rerender } = renderHook(
      ({ token }) => useTokenValidation("openai", token),
      { initialProps: { token: "s" } }
    );

    // Type more characters before debounce fires
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    rerender({ token: "sk" });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    rerender({ token: "sk-" });

    // Fetch should not have been called yet (debounce not elapsed)
    expect(mockFetch).not.toHaveBeenCalled();

    // Now advance past debounce from last change
    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    // Should only have been called once
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
