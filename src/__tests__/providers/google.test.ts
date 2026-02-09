import { validateToken, callModel } from "@/lib/providers/google";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("Google provider", () => {
  describe("validateToken", () => {
    it("returns true for valid token", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const result = await validateToken("AIza-valid-key");
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://generativelanguage.googleapis.com/v1beta/models?key=AIza-valid-key",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("returns false for invalid token", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      const result = await validateToken("bad-key");
      expect(result).toBe(false);
    });

    it("returns false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
      const result = await validateToken("any-key");
      expect(result).toBe(false);
    });
  });

  describe("callModel", () => {
    it("returns content on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "<html>Gemini</html>" }] } }],
        }),
      });

      const result = await callModel("prompt", "system", "AIza-key", "gemini-3-pro-preview");
      expect(result.content).toBe("<html>Gemini</html>");
    });

    it("passes token as query param and model in URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "ok" }] } }],
        }),
      });

      await callModel("user msg", "sys msg", "AIza-key", "gemini-3-pro-preview");

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("models/gemini-3-pro-preview:generateContent");
      expect(url).toContain("key=AIza-key");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.systemInstruction).toEqual({ parts: [{ text: "sys msg" }] });
      expect(body.contents).toEqual([{ parts: [{ text: "user msg" }] }]);
    });

    it("throws on 403", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "bad-key", "gemini-3-pro-preview")
      ).rejects.toThrow("Authentication failed. Check your API token.");
    });

    it("throws on 429", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "key", "gemini-3-pro-preview")
      ).rejects.toThrow("Rate limit exceeded. Try again later.");
    });

    it("throws on empty content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "" }] } }] }),
      });

      await expect(
        callModel("test", "sys", "key", "gemini-3-pro-preview")
      ).rejects.toThrow("No content in response.");
    });

    it("throws on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

      await expect(
        callModel("test", "sys", "key", "gemini-3-pro-preview")
      ).rejects.toThrow("Network error. Check your connection.");
    });
  });
});
