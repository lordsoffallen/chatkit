/** biome-ignore-all lint/performance/noBarrelFile: Unified queries */
import "server-only";

export { documentQueries } from "./document/db/queries";

import { documentQueries } from "./document/db/queries";

export const assetQueries = {
  document: documentQueries,
} as const;
