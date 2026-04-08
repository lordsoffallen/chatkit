import { generateUUID } from "@/lib/utils";
import Replicate from "replicate";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_POLL_INTERVAL_MS = 1500;
const MEDIA_URL_REGEX =
  /\.(png|jpg|jpeg|webp|gif|avif|bmp|tiff|svg|mp4|webm|mov|avi)(\?|$)/i;

type ReplicatePredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type ReplicatePrediction = {
  id: string;
  status: ReplicatePredictionStatus;
  output?: unknown;
  error?: string;
  model?: string;
};

type ReplicatePredictionRequest = {
  model: string;
  input: Record<string, unknown>;
};

export class ReplicateAPIError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "ReplicateAPIError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isMediaLikeUrl(value: string): boolean {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  return MEDIA_URL_REGEX.test(value) || value.includes("replicate.delivery");
}

function tryExtractUrl(value: unknown): string | null {
  if (typeof value === "string" && isMediaLikeUrl(value)) {
    return value;
  }

  if (value instanceof URL) {
    const url = value.toString();
    return isMediaLikeUrl(url) ? url : null;
  }

  if (typeof value === "object" && value !== null) {
    const candidate = value as {
      url?: unknown;
      href?: unknown;
      toString?: () => string;
    };

    if (typeof candidate.url === "string" && isMediaLikeUrl(candidate.url)) {
      return candidate.url;
    }

    if (typeof candidate.href === "string" && isMediaLikeUrl(candidate.href)) {
      return candidate.href;
    }

    if (typeof candidate.toString === "function") {
      const stringValue = candidate.toString();
      if (
        stringValue &&
        stringValue !== "[object Object]" &&
        isMediaLikeUrl(stringValue)
      ) {
        return stringValue;
      }
    }
  }

  return null;
}

function extractUrls(value: unknown, urls: Set<string>) {
  const extracted = tryExtractUrl(value);
  if (extracted) {
    urls.add(extracted);
  }

  if (typeof value === "string" || value instanceof URL) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractUrls(item, urls);
    }
    return;
  }

  if (typeof value === "object" && value !== null) {
    for (const nestedValue of Object.values(value)) {
      extractUrls(nestedValue, urls);
    }
  }
}

export function extractMediaUrls(output: unknown): string[] {
  const urls = new Set<string>();
  extractUrls(output, urls);
  return Array.from(urls);
}

function getReplicateErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      detail?: string;
      error?: string;
      response?: {
        data?: {
          detail?: string;
          error?: string;
          title?: string;
        };
      };
    };

    const detail =
      maybeError.detail ||
      maybeError.error ||
      maybeError.response?.data?.detail ||
      maybeError.response?.data?.error ||
      maybeError.response?.data?.title;

    if (detail) {
      return detail;
    }
  }

  return "Unknown Replicate error";
}

function toPrediction(prediction: unknown): ReplicatePrediction {
  const candidate = prediction as Record<string, unknown>;

  const statusValue = candidate.status;
  const status: ReplicatePredictionStatus =
    statusValue === "succeeded" ||
    statusValue === "failed" ||
    statusValue === "canceled" ||
    statusValue === "processing" ||
    statusValue === "starting"
      ? statusValue
      : "failed";

  return {
    id: typeof candidate.id === "string" ? candidate.id : generateUUID(),
    status,
    output: candidate.output,
    error: typeof candidate.error === "string" ? candidate.error : undefined,
    model: typeof candidate.model === "string" ? candidate.model : undefined,
  };
}

export class ReplicateClient {
  private readonly apiToken: string;
  private readonly client: Replicate;

  constructor(apiToken?: string) {
    const token = apiToken || process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new ReplicateAPIError(
        "Replicate API token is required. Please set REPLICATE_API_TOKEN."
      );
    }
    this.apiToken = token;
    this.client = new Replicate({
      auth: this.apiToken,
    });
  }

  async createPrediction(
    body: ReplicatePredictionRequest
  ): Promise<ReplicatePrediction> {
    try {
      const prediction = await this.client.predictions.create({
        // Replicate now accepts owner/name, owner/name:version, or version id in `version`.
        version: body.model,
        input: body.input,
      });
      return toPrediction(prediction);
    } catch (error) {
      throw new ReplicateAPIError(
        `Replicate create prediction failed: ${getReplicateErrorMessage(error)}`,
        undefined,
        error
      );
    }
  }

  async getPrediction(id: string): Promise<ReplicatePrediction> {
    try {
      const prediction = await this.client.predictions.get(id);
      return toPrediction(prediction);
    } catch (error) {
      throw new ReplicateAPIError(
        `Replicate get prediction failed: ${getReplicateErrorMessage(error)}`,
        undefined,
        error
      );
    }
  }

  async waitForPrediction(
    predictionId: string,
    {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    }: { timeoutMs?: number; pollIntervalMs?: number } = {}
  ): Promise<ReplicatePrediction> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const prediction = await this.getPrediction(predictionId);
      if (
        prediction.status === "succeeded" ||
        prediction.status === "failed" ||
        prediction.status === "canceled"
      ) {
        return prediction;
      }

      await delay(pollIntervalMs);
    }

    throw new ReplicateAPIError(
      `Prediction ${predictionId} timed out after ${timeoutMs}ms`
    );
  }

  async runPrediction(
    request: ReplicatePredictionRequest
  ): Promise<ReplicatePrediction> {
    const initialPrediction = await this.createPrediction(request);

    if (
      initialPrediction.status === "succeeded" ||
      initialPrediction.status === "failed" ||
      initialPrediction.status === "canceled"
    ) {
      return initialPrediction;
    }

    return this.waitForPrediction(initialPrediction.id);
  }
}

export function createReplicateClient(apiToken?: string): ReplicateClient {
  return new ReplicateClient(apiToken);
}

export function isReplicateReady(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export function createMediaOutputs(urls: string[]) {
  return urls.map((url) => ({
    id: generateUUID(),
    url,
  }));
}
