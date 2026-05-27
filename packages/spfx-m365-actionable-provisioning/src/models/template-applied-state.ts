/**
 * Persisted provisioning outcome.
 *
 * @remarks
 * This value is intended to represent the last known outcome of provisioning/deprovisioning runs.
 * Compliance checks are visual/diagnostic and must not overwrite this persisted state.
 * 
 * @public
 */
export type TemplateAppliedState = 'applied' | 'notApplied' | 'unknown';
