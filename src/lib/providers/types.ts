export interface ProviderCallResult {
  content: string;
}

export interface ProviderModule {
  validateToken(token: string): Promise<boolean>;
  callModel(
    prompt: string,
    systemPrompt: string,
    token: string,
    modelId: string
  ): Promise<ProviderCallResult>;
}
