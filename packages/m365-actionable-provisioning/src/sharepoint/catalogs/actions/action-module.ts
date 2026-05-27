import type { z } from "zod";

import type { AnyActionDefinition } from "../../../core/action";
import type { M365Clients, M365Scope, ProvisioningResultLight } from "../../../m365";

export type SharePointActionDefinition = AnyActionDefinition<M365Scope, ProvisioningResultLight, M365Clients>;

export type SharePointActionPlacement = "root" | "siteSubaction" | "listSubaction";

export type SharePointActionModule = Readonly<{
  verb: string;
  schema: z.ZodType;
  schemasByPlacement?: Partial<Record<SharePointActionPlacement, z.ZodType>>;
  definition: SharePointActionDefinition;
  placements: readonly SharePointActionPlacement[];
}>;

export function defineSharePointActionModule<const TModule extends SharePointActionModule>(
  module: TModule
): TModule {
  return module;
}
