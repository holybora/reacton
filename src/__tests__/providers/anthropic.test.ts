import { validateToken, callModel } from "@/lib/providers/anthropic";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("Anthropic provider", () => {
  describe("validateToken", () => {
    it("returns true for valid token", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const result = await validateToken("sk-ant-valid");
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/models",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "x-api-key": "sk-ant-valid",
            "anthropic-version": "2023-06-01",
          }),
        })
      );
    });

    it("returns false for invalid token", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
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
          content: [{ text: "<html>Claude response</html>" }],
        }),
      });

      const result = await callModel("prompt", "system", "sk-ant", "claude-opus-4-6");
      expect(result.content).toBe("<html>Claude response</html>");
    });

    it("sends system prompt as top-level field", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: "ok" }] }),
      });

      await callModel("user msg", "sys msg", "sk-ant", "claude-opus-4-6");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.system).toBe("sys msg");
      expect(body.messages).toEqual([{ role: "user", content: "user msg" }]);
      expect(body.max_tokens).toBe(4096);
    });

    it("throws on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "sk-bad", "claude-opus-4-6")
      ).rejects.toThrow("Authentication failed. Check your API token.");
    });

    it("throws on 429", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "sk-ant", "claude-opus-4-6")
      ).rejects.toThrow("Rate limit exceeded. Try again later.");
    });

    it("throws on empty content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: "" }] }),
      });

      await expect(
        callModel("test", "sys", "sk-ant", "claude-opus-4-6")
      ).rejects.toThrow("No content in response.");
    });

    it("throws on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

      await expect(
        callModel("test", "sys", "sk-ant", "claude-opus-4-6")
      ).rejects.toThrow("Network error. Check your connection.");
    });
  });
});
