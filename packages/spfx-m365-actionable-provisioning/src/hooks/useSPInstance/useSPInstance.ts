import type { BaseComponentContext } from '@microsoft/sp-component-base';
import { SPFx, spfi, type SPFI } from '@pnp/sp';
import { useMemo } from 'react';

/**
 * Creates a PnPjs SPFI instance.
 *
 * @remarks
 * In SPFx, the `SPFx` behavior rewrites non-absolute REST URLs to the current web.
 * This makes “cross-site” targeting via `spfi(targetUrl).using(SPFx(context))` unreliable
 * for many operations.
 *
 * This helper therefore always returns an SPFI rooted in the current SPFx context.
 * Callers that need to operate on a different site/web should instead create scoped
 * instances via `Web([sp.web, targetUrl])` / `Site([sp.site, targetUrl])` or seed
 * `scopeIn.web` in the provisioning engine. * 
 * @public */
export function createSPInstance(
  context: BaseComponentContext,
  _targetSiteUrl?: string
): SPFI {
  return spfi().using(SPFx(context));
}

/**
 * React hook that memoizes {@link createSPInstance}.
 * 
 * @public
 */
export function useSPInstance(
  context: BaseComponentContext,
  targetSiteUrl?: string
): SPFI {
  return useMemo(
    () => createSPInstance(context, targetSiteUrl),
    [context, targetSiteUrl]
  );
}
