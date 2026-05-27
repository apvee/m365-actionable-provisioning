import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Web } from '@pnp/sp/webs';
import '@pnp/sp/webs';

import { SPFxProvisioningEngine } from '../../../provisioning';
import type { EngineSnapshotTyped } from '../../../core/engine';
import type { ProvisioningResultLight } from '../../../provisioning';
import { normalizeUrl } from '../../utils/url';

import { useSPInstance } from '../useSPInstance/useSPInstance';

import type {
  UseSPFxProvisioningEngineOptions,
  UseSPFxProvisioningEngineReturn,
} from './useSPFxProvisioningEngine.types';
import { scheduleInAnimationFrame } from './useSPFxProvisioningEngine.utils';

/**
 * Base UI hook that owns the provisioning engine lifecycle.
 *
 * @remarks
 * - Creates the engine internally.
 * - Recreates the engine when `context` or `targetSiteUrl` changes.
 * - Batches snapshot updates to at most ~1 per animation frame.
 * 
 * @public
 */
export function useSPFxProvisioningEngine(
  options: UseSPFxProvisioningEngineOptions
): UseSPFxProvisioningEngineReturn {
  const sp = useSPInstance(options.context, options.targetSiteUrl);

  const normalizedTarget = useMemo(
    () => normalizeUrl(options.targetSiteUrl),
    [options.targetSiteUrl]
  );

  const defaultTargetWeb = useMemo(() => {
    if (!normalizedTarget) return undefined;
    return Web([sp.web, normalizedTarget]);
  }, [sp, normalizedTarget]);

  const mergedInitialScope = useMemo(() => {
    // Default behavior: if a target site URL is provided, seed `scopeIn.web` so actions that
    // depend on scope (and/or use resolveTargetWeb) operate on the target by default.
    // Caller-provided scope always wins.
    return {
      ...(defaultTargetWeb ? { web: defaultTargetWeb } : {}),
      ...(options.initialScope ?? {}),
    };
  }, [defaultTargetWeb, options.initialScope]);

  const [snapshot, setSnapshot] = useState<EngineSnapshotTyped<ProvisioningResultLight>>();

  const engineRef = useRef<SPFxProvisioningEngine | undefined>(undefined);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | undefined>(undefined);

  const engineVersionRef = useRef(0);

  const pendingSnapshotRef = useRef<EngineSnapshotTyped<ProvisioningResultLight> | undefined>(undefined);
  const cancelScheduledFlushRef = useRef<(() => void) | undefined>(undefined);

  const flush = useCallback((engineVersion: number) => {
    cancelScheduledFlushRef.current = undefined;

    if (engineVersion !== engineVersionRef.current) return;

    const next = pendingSnapshotRef.current;
    if (next) setSnapshot(next);
  }, []);

  const scheduleFlush = useCallback(
    (engineVersion: number) => {
      if (cancelScheduledFlushRef.current) return;
      cancelScheduledFlushRef.current = scheduleInAnimationFrame(() => flush(engineVersion));
    },
    [flush]
  );

  useEffect(() => {
    engineVersionRef.current += 1;
    const engineVersion = engineVersionRef.current;

    cancelScheduledFlushRef.current?.();
    cancelScheduledFlushRef.current = undefined;

    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = undefined;

    engineRef.current?.cancel();
    engineRef.current = undefined;

    pendingSnapshotRef.current = undefined;
    setSnapshot(undefined);

    const engine = new SPFxProvisioningEngine({
      spfi: sp,
      initialScope: mergedInitialScope,
      planTemplate: options.planTemplate,
      logger: options.logger,
      options: options.engineOptions,
    });

    engineRef.current = engine;

    subscriptionRef.current = engine.subscribe((nextSnapshot) => {
      if (engineVersion !== engineVersionRef.current) return;
      pendingSnapshotRef.current = nextSnapshot;
      scheduleFlush(engineVersion);
    });

    return () => {
      if (engineVersion !== engineVersionRef.current) return;

      cancelScheduledFlushRef.current?.();
      cancelScheduledFlushRef.current = undefined;

      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = undefined;

      engineRef.current?.cancel();
      engineRef.current = undefined;

      pendingSnapshotRef.current = undefined;
    };
  }, [
    sp,
    options.planTemplate,
    options.logger,
    mergedInitialScope,
    options.engineOptions,
    options.resetKey,
    scheduleFlush,
  ]);

  const run = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) throw new Error('Provisioning engine not initialized');
    return engine.run();
  }, []);

  const cancel = useCallback(() => {
    engineRef.current?.cancel();
  }, []);

  const checkCompliance = useCallback(async (policy) => {
    const engine = engineRef.current;
    if (!engine) throw new Error('Provisioning engine not initialized');
    return engine.checkCompliance(policy);
  }, []);

  return {
    snapshot,
    run,
    cancel,
    checkCompliance,
  };
}
