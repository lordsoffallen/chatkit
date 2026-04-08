import type { Provider } from "@/types/model";

export const PROVIDERS: Provider[] = [
  // Anthropic
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Fast and efficient model for quick responses",
    modelConfig: { provider: "anthropic", reasoning: false },
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Balanced model for general-purpose tasks",
    modelConfig: { provider: "anthropic", reasoning: false },
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    description: "Most capable Claude model for complex tasks",
    modelConfig: { provider: "anthropic", reasoning: false },
  },

  // Google
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    description: "Lightweight and fast multimodal model",
    modelConfig: { provider: "google", reasoning: false },
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast multimodal model for diverse tasks",
    modelConfig: { provider: "google", reasoning: false },
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Most capable Gemini model for complex tasks",
    modelConfig: { provider: "google", reasoning: false },
  },

  // Mistral
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    description: "Fast and cost-effective model",
    modelConfig: { provider: "mistral", reasoning: false },
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Most capable Mistral model for complex tasks",
    modelConfig: { provider: "mistral", reasoning: false },
  },
  {
    id: "magistral-medium-2507",
    name: "Magistral Medium",
    description: "Reasoning model from Mistral",
    modelConfig: { provider: "mistral", reasoning: true },
  },

  // OpenAI
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    description: "Latest GPT-4 class model",
    modelConfig: { provider: "openai", reasoning: false },
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "Fast and affordable GPT-4.1",
    modelConfig: { provider: "openai", reasoning: false },
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Flagship model with advanced capabilities",
    modelConfig: { provider: "openai", reasoning: false },
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Efficient version of GPT-5 for everyday tasks",
    modelConfig: { provider: "openai", reasoning: false },
  },
  {
    id: "o3",
    name: "O3",
    description: "Advanced reasoning model",
    modelConfig: { provider: "openai", reasoning: true },
  },
  {
    id: "o4-mini",
    name: "O4 Mini",
    description: "Efficient reasoning model",
    modelConfig: { provider: "openai", reasoning: true },
  },
];
