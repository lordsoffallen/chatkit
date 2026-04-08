import type { LanguageModelUsage } from "ai";
import { getUsage } from "tokenlens/helpers";
import type { AppUsage } from "@/types/usage";
import { getTokenlensCatalog } from "./stream-config";

export async function enrichUsageWithCosts(
  usage: LanguageModelUsage,
  modelId: string | undefined
): Promise<AppUsage> {
  try {
    if (!modelId) {
      return usage;
    }

    const providers = await getTokenlensCatalog();
    if (!providers) {
      return usage;
    }

    const summary = getUsage({ modelId, usage, providers });
    return { ...usage, ...summary, modelId } as AppUsage;
  } catch (err) {
    console.warn("TokenLens enrichment failed", err);
    return usage;
  }
}
