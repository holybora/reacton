import {
  AVAILABLE_MODELS,
  MODELS_BY_PROVIDER,
  getModelById,
  getProviders,
  getModelsByProvider,
} from "@/lib/models";

describe("Model registry", () => {
  it("has models for all 3 providers", () => {
    expect(MODELS_BY_PROVIDER.openai.length).toBeGreaterThan(0);
    expect(MODELS_BY_PROVIDER.anthropic.length).toBeGreaterThan(0);
    expect(MODELS_BY_PROVIDER.google.length).toBeGreaterThan(0);
  });

  it("has exactly one enabled model per provider", () => {
    for (const provider of ["openai", "anthropic", "google"] as const) {
      const enabled = MODELS_BY_PROVIDER[provider].filter((m) => m.enabled);
      expect(enabled).toHaveLength(1);
    }
  });

  describe("getModelById", () => {
    it("returns model for valid ID", () => {
      const model = getModelById("gpt-5.2");
      expect(model).toBeDefined();
      expect(model?.name).toBe("GPT-5.2");
      expect(model?.provider).toBe("openai");
    });

    it("returns undefined for invalid ID", () => {
      expect(getModelById("nonexistent")).toBeUndefined();
    });
  });

  describe("getProviders", () => {
    it("returns all 3 providers", () => {
      const providers = getProviders();
      expect(providers).toContain("openai");
      expect(providers).toContain("anthropic");
      expect(providers).toContain("google");
      expect(providers).toHaveLength(3);
    });
  });

  describe("getModelsByProvider", () => {
    it("returns a map with all providers", () => {
      const grouped = getModelsByProvider();
      expect(grouped.get("openai")?.length).toBeGreaterThan(0);
      expect(grouped.get("anthropic")?.length).toBeGreaterThan(0);
      expect(grouped.get("google")?.length).toBeGreaterThan(0);
    });
  });

  it("all models have required fields", () => {
    for (const model of AVAILABLE_MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(["openai", "anthropic", "google"]).toContain(model.provider);
      expect(typeof model.enabled).toBe("boolean");
    }
  });
});
