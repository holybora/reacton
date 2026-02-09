import type { Provider } from "@/lib/types";
import type { ProviderModule } from "./types";
import * as openai from "./openai";
import * as anthropic from "./anthropic";
import * as google from "./google";

const providers: Record<Provider, ProviderModule> = {
  openai,
  anthropic,
  google,
};

export function getProvider(provider: Provider): ProviderModule {
  const mod = providers[provider];
  if (!mod) throw new Error(`Unknown provider: ${provider}`);
  return mod;
}
