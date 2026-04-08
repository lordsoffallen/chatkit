import { z } from "zod";

const PIXABAY_API_BASE_URL = "https://pixabay.com/api/";

export const PixabayImageTypeSchema = z.enum([
  "all",
  "photo",
  "illustration",
  "vector",
]);
export type PixabayImageType = z.infer<typeof PixabayImageTypeSchema>;

export const PixabayCategorySchema = z.enum([
  "backgrounds",
  "fashion",
  "nature",
  "science",
  "education",
  "feelings",
  "health",
  "people",
  "religion",
  "places",
  "animals",
  "industry",
  "computer",
  "food",
  "sports",
  "transportation",
  "travel",
  "buildings",
  "business",
  "music",
]);
export type PixabayCategory = z.infer<typeof PixabayCategorySchema>;

export type PixabaySearchParams = {
  query: string;
  imageType?: PixabayImageType;
  category?: PixabayCategory;
  perPage?: number;
  page?: number;
};

export type PixabayHit = {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
};

export type PixabayAPIResponse = {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
};

export class PixabayAPIError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "PixabayAPIError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class PixabayClient {
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.PIXABAY_API_KEY;
    if (!key) {
      throw new PixabayAPIError(
        "Pixabay API key is required. Please set PIXABAY_API_KEY environment variable."
      );
    }
    this.apiKey = key;
  }

  async searchImages(params: PixabaySearchParams): Promise<PixabayAPIResponse> {
    this.validateSearchParams(params);

    const url = this.buildSearchURL(params);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new PixabayAPIError(
            "Rate limit exceeded. Please try again later.",
            429
          );
        }
        if (response.status === 401) {
          throw new PixabayAPIError(
            "Invalid API key. Please check your Pixabay API key configuration.",
            401
          );
        }
        throw new PixabayAPIError(
          `Pixabay API request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      if (!this.isValidAPIResponse(data)) {
        throw new PixabayAPIError("Invalid response format from Pixabay API");
      }

      return data;
    } catch (error) {
      if (error instanceof PixabayAPIError) throw error;

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new PixabayAPIError(
          "Network error: Unable to connect to Pixabay API.",
          undefined,
          error
        );
      }

      throw new PixabayAPIError(
        "An unexpected error occurred while fetching images from Pixabay",
        undefined,
        error
      );
    }
  }

  private buildSearchURL(params: PixabaySearchParams): string {
    const url = new URL(PIXABAY_API_BASE_URL);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("q", params.query);
    if (params.imageType) url.searchParams.set("image_type", params.imageType);
    if (params.category) url.searchParams.set("category", params.category);
    if (params.perPage)
      url.searchParams.set("per_page", params.perPage.toString());
    if (params.page) url.searchParams.set("page", params.page.toString());
    return url.toString();
  }

  private validateSearchParams(params: PixabaySearchParams): void {
    if (!params.query || params.query.trim().length === 0) {
      throw new PixabayAPIError("Search query cannot be empty");
    }
    if (params.perPage && (params.perPage < 3 || params.perPage > 200)) {
      throw new PixabayAPIError("perPage must be between 3 and 200");
    }
    if (params.page && params.page < 1) {
      throw new PixabayAPIError("page must be greater than 0");
    }
    if (
      params.imageType &&
      !PixabayImageTypeSchema.options.includes(params.imageType)
    ) {
      throw new PixabayAPIError(
        `imageType must be one of: ${PixabayImageTypeSchema.options.join(", ")}`
      );
    }
    if (
      params.category &&
      !PixabayCategorySchema.options.includes(params.category)
    ) {
      throw new PixabayAPIError(
        `category must be one of: ${PixabayCategorySchema.options.join(", ")}`
      );
    }
  }

  private isValidAPIResponse(data: unknown): data is PixabayAPIResponse {
    if (typeof data !== "object" || data === null) return false;
    const response = data as Record<string, unknown>;
    return (
      typeof response.total === "number" &&
      typeof response.totalHits === "number" &&
      Array.isArray(response.hits)
    );
  }
}

export function createPixabayClient(apiKey?: string): PixabayClient {
  return new PixabayClient(apiKey);
}

export function isPixabayReady(): boolean {
  return Boolean(process.env.PIXABAY_API_KEY);
}
