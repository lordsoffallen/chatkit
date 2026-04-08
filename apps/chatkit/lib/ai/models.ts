import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { customProvider } from "ai";
import { isTestEnvironment } from "@/lib/constants";
import type { ModelProvider, Provider } from "@/types/model";
import { PROVIDERS } from "./providers";


function resolveModel(id: string, provider: ModelProvider): LanguageModel {
  switch (provider) {
    case "openai":
      return openai(id);
    case "anthropic":
      return anthropic(id);
    case "google":
      return google(id);
    case "mistral":
      return mistral(id);
  }
}

const modelProvider = isTestEnvironment
  ? (() => {
      const { getMockModel } = require("@/lib/ai/mock/models");

      const languageModels: Record<string, any> = {};
      for (const provider of PROVIDERS) {
        languageModels[provider.id] = getMockModel(
          provider.id,
          provider.modelConfig.reasoning
        );
      }

      return customProvider({ languageModels });
    })()
  : (() => {
      const languageModels: Record<string, any> = {};

      for (const provider of PROVIDERS) {
        languageModels[provider.id] = resolveModel(
          provider.id,
          provider.modelConfig.provider
        );
      }

      return customProvider({ languageModels });
    })();

class Providers {
  private readonly providers: Provider[];
  private readonly byId: Map<string, Provider>;
  private readonly byName: Map<string, Provider>;

  constructor(providersList: Provider[]) {
    this.providers = providersList;
    this.byId = new Map(providersList.map((p) => [p.id, p]));
    this.byName = new Map(providersList.map((p) => [p.name.toLowerCase(), p]));
  }

  getAll(): Provider[] {
    return this.providers;
  }

  getById(id: string): Provider | undefined {
    return this.byId.get(id);
  }

  getByName(name: string): Provider | undefined {
    return this.byName.get(name.toLowerCase());
  }

  getModel(id: string): LanguageModel {
    if (!this.byId.has(id)) {
      throw new Error(
        `Model not found: ${id}. Available models: ${Array.from(this.byId.keys()).join(", ")}`
      );
    }

    return modelProvider.languageModel(id);
  }

  getModelByName(name: string): LanguageModel {
    const provider = this.byName.get(name.toLowerCase());
    if (!provider) {
      throw new Error(
        `Model not found: ${name}. Available models: ${Array.from(this.byName.keys()).join(", ")}`
      );
    }
    return this.getModel(provider.id);
  }

  getMetadata(id: string): Provider | undefined {
    return this.byId.get(id);
  }

  exists(id: string): boolean {
    return this.byId.has(id);
  }

  existsByName(name: string): boolean {
    return this.byName.has(name.toLowerCase());
  }
}

export const providers = new Providers(PROVIDERS);

export function isReasoningModel(modelId: string): boolean {
  const provider = providers.getById(modelId);
  return provider?.modelConfig.reasoning ?? false;
}

export const DEFAULT_MODEL_ID: string = "gpt-5-mini";

export const modelsByProvider: Record<string, Provider[]> =
  PROVIDERS.reduce<Record<string, Provider[]>>((acc, provider) => {
    const key = provider.modelConfig.provider;
    if (!acc[key]) acc[key] = [];
    acc[key].push(provider);
    return acc;
  }, {});
