import { getProvider } from "@/lib/providers";

describe("getProvider", () => {
  it("returns openai module", () => {
    const provider = getProvider("openai");
    expect(provider).toBeDefined();
    expect(typeof provider.validateToken).toBe("function");
    expect(typeof provider.callModel).toBe("function");
  });

  it("returns anthropic module", () => {
    const provider = getProvider("anthropic");
    expect(provider).toBeDefined();
    expect(typeof provider.validateToken).toBe("function");
    expect(typeof provider.callModel).toBe("function");
  });

  it("returns google module", () => {
    const provider = getProvider("google");
    expect(provider).toBeDefined();
    expect(typeof provider.validateToken).toBe("function");
    expect(typeof provider.callModel).toBe("function");
  });

  it("throws for unknown provider", () => {
    expect(() => getProvider("unknown" as never)).toThrow(
      "Unknown provider: unknown"
    );
  });
});
