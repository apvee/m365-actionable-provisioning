import { z } from "zod";

/**
 * Shared string primitives for schema modules.
 *
 * @remarks
 * Keep this module free of any runtime dependencies.
 */

export const nonEmptyStringSchema = z.string().min(1);
