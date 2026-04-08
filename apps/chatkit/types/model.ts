export type ModelProvider = "openai" | "anthropic" | "google" | "mistral";

export type ModelConfig = {
  provider: ModelProvider;
  reasoning: boolean;
};

export type Provider = {
  id: string;
  name: string;
  description: string;
  modelConfig: ModelConfig;
};
