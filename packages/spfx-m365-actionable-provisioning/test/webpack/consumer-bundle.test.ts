// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createPackageFixture,
  type PackageFixture,
} from '../artifact/helpers/package-fixture';
import {
  buildConsumer,
  type ConsumerBuildResult,
  type DependencyKind,
} from './helpers/build-consumer';

let fixture: PackageFixture;
const builds = new Map<DependencyKind, ConsumerBuildResult>();

beforeAll(async () => {
  fixture = createPackageFixture();
  builds.set('esm', await buildConsumer(fixture, 'esm'));
  builds.set('cjs', await buildConsumer(fixture, 'cjs'));
}, 240_000);

afterAll(() => {
  fixture?.cleanup();
});

const guardedPackages = [
  '@fluentui/react-shared-contexts',
  '@fluentui/react-portal',
  '@fluentui/react-provider',
];

describe.each<DependencyKind>(['esm', 'cjs'])('%s consumer bundle', (dependencyKind) => {
  it('compiles package and consumer components into one consistent Fluent graph', () => {
    const result = builds.get(dependencyKind);
    expect(result?.errors).toEqual([]);
    expect(result?.moduleResources.some((resource) => resource.includes(
      `/dist/${dependencyKind === 'esm' ? 'esm' : 'cjs'}/components/ProvisioningDialog/`,
    ))).toBe(true);
    expect(result?.moduleResources.some((resource) => resource.includes(
      '/node_modules/@fluentui/react-drawer/',
    ))).toBe(true);

    for (const packageName of guardedPackages) {
      const resources = result?.moduleResources.filter((resource) => (
        resource.includes(`/node_modules/${packageName}/`)
      )) ?? [];
      expect(resources.length, packageName).toBeGreaterThan(0);

      if (dependencyKind === 'esm') {
        expect(resources.every((resource) => resource.includes('/lib/')), packageName).toBe(true);
        expect(resources.some((resource) => resource.includes('/lib-commonjs/')), packageName).toBe(false);
      } else {
        expect(resources.every((resource) => resource.includes('/lib-commonjs/')), packageName).toBe(true);
        expect(resources.some((resource) => /\/lib\//.test(resource)), packageName).toBe(false);
      }
    }
  });
});
