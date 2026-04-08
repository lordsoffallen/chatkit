import type { Provider } from "@/types/model";
import type { UserType } from "@/types/user";
import { isDevelopmentEnvironment } from "../constants";
import { providers } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: Provider["id"][];
};

const allModelIds = providers.getAll().map((p) => p.id);

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: isDevelopmentEnvironment ? 20_000 : 20,
    availableChatModelIds: allModelIds,
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: allModelIds,
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
