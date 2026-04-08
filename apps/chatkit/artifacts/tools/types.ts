export type { CreateDocumentToolOutput } from "./document/create-document";
export type { RequestSuggestionsToolOutput } from "./document/request-suggestions";
export type { UpdateDocumentToolOutput } from "./document/update-document";

import type { InferUITool } from "ai";
import type { createDocument } from "./document/create-document";
import type { requestSuggestions } from "./document/request-suggestions";
import type { updateDocument } from "./document/update-document";
import type { getWeather } from "./get-weather";

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<ReturnType<typeof requestSuggestions>>;

export type Tools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};
