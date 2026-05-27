/**
 * Base log entry types shared by provisioning and compliance logs.
 *
 * @packageDocumentation
 */

/**
 * Discriminator for distinguishing root actions from nested subactions in logs.
 *
 * @public
 */
export type LogEntryKind = 'action' | 'subaction';

/**
 * Base interface for log entries with common properties.
 *
 * @template TId - The type of the unique identifier (e.g., ActionPath)
 *
 * @remarks
 * Extended by ProvisioningLogEntry and ComplianceLogEntry to add
 * domain-specific status and result properties.
 *
 * @public
 */
export type BaseLogEntry<TId extends string> = Readonly<{
  /** Unique identifier for this log entry (typically an ActionPath). */
  id: TId;

  /** The verb/action type being logged. */
  verb: string;

  /** Nesting depth (0 = root action, 1+ = subaction levels). */
  depth: number;

  /** Discriminator indicating if this is a root action or subaction. */
  kind: LogEntryKind;
}>;
