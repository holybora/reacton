import { validateToken, callModel } from "@/lib/providers/openai";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("OpenAI provider", () => {
  describe("validateToken", () => {
    it("returns true for valid token (200 response)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const result = await validateToken("sk-valid-token");
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/models",
        expect.objectContaining({
          method: "GET",
          headers: { Authorization: "Bearer sk-valid-token" },
        })
      );
    });

    it("returns false for invalid token (401 response)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
      const result = await validateToken("sk-bad-token");
      expect(result).toBe(false);
    });

    it("returns false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
      const result = await validateToken("sk-any-token");
      expect(result).toBe(false);
    });
  });

  describe("callModel", () => {
    it("returns content on successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "<html>Hello</html>" } }],
        }),
      });

      const result = await callModel("make a button", "system prompt", "sk-valid", "gpt-5.2");
      expect(result.content).toBe("<html>Hello</html>");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer sk-valid",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("includes system prompt and user prompt in messages", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "ok" } }],
        }),
      });

      await callModel("user msg", "sys msg", "sk-valid", "gpt-5.2");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("gpt-5.2");
      expect(body.messages).toEqual([
        { role: "system", content: "sys msg" },
        { role: "user", content: "user msg" },
      ]);
    });

    it("throws on 401 with auth error message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
      });

      await expect(
        callModel("test", "sys", "sk-bad", "gpt-5.2")
      ).rejects.toThrow("Authentication failed. Check your API token.");
    });

    it("throws on 429 with rate limit message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "sk-valid", "gpt-5.2")
      ).rejects.toThrow("Rate limit exceeded. Try again later.");
    });

    it("throws on 500+ with server error message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      });

      await expect(
        callModel("test", "sys", "sk-valid", "gpt-5.2")
      ).rejects.toThrow("Provider server error. Try again later.");
    });

    it("throws on network error", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

      await expect(
        callModel("test", "sys", "sk-valid", "gpt-5.2")
      ).rejects.toThrow("Network error. Check your connection.");
    });

    it("throws when response has no content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "" } }] }),
      });

      await expect(
        callModel("test", "sys", "sk-valid", "gpt-5.2")
      ).rejects.toThrow("No content in response.");
    });
  });
});
