/**
 * Base activity entry types shared by provisioning and compliance views.
 *
 * @packageDocumentation
 */

/**
 * Discriminator for distinguishing root actions from nested subactions.
 *
 * @public
 */
export type ActivityEntryKind = 'action' | 'subaction';

/**
 * Base interface for activity entries with common properties.
 *
 * @template TId - The type of the unique identifier (e.g., ActionPath)
 *
 * @remarks
 * Extended by ProvisioningActivityEntry and ComplianceActivityEntry to add
 * domain-specific status and result properties.
 *
 * @public
 */
export type BaseActivityEntry<TId extends string> = Readonly<{
  /** Unique identifier for this activity entry (typically an ActionPath). */
  id: TId;

  /** The verb/action type represented by this entry. */
  verb: string;

  /** Nesting depth (0 = root action, 1+ = subaction levels). */
  depth: number;

  /** Discriminator indicating if this is a root action or subaction. */
  kind: ActivityEntryKind;
}>;
