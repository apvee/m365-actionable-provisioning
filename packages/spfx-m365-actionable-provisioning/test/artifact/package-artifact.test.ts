// @vitest-environment node

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createPackageFixture,
  type PackageFixture,
} from './helpers/package-fixture';

let fixture: PackageFixture;

beforeAll(() => {
  fixture = createPackageFixture();
}, 180_000);

afterAll(() => {
  fixture?.cleanup();
});

describe('packed package artifact', () => {
  it('contains only the publishable dual-package layout', () => {
    expect(fixture.paths).toContain('dist/esm/index.js');
    expect(fixture.paths).toContain('dist/cjs/index.js');
    expect(fixture.paths).toContain('dist/types/index.d.ts');
    expect(fixture.paths).toContain('dist/cjs/package.json');
    expect(fixture.paths).toContain('dist/loc/en-us.js');
    expect(fixture.paths.some((entry) => entry.startsWith('lib/'))).toBe(false);
    expect(fixture.paths.some((entry) => entry.startsWith('src/'))).toBe(false);
    expect(fixture.paths.some((entry) => entry.startsWith('test/'))).toBe(false);
  });

  it('installs a physical package instead of linking the workspace', () => {
    expect(lstatSync(fixture.installedPackageRoot).isSymbolicLink()).toBe(false);
    expect(realpathSync(fixture.installedPackageRoot))
      .toMatch(new RegExp(`^${realpathSync(fixture.fixtureRoot).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  it('resolves import and require to their matching conditional entry points', () => {
    const esmResolver = path.join(fixture.fixtureRoot, 'resolve-esm.mjs');
    const cjsResolver = path.join(fixture.fixtureRoot, 'resolve-cjs.cjs');
    writeFileSync(
      esmResolver,
      "console.log(import.meta.resolve('@apvee/spfx-m365-actionable-provisioning'));\n",
      'utf8',
    );
    writeFileSync(
      cjsResolver,
      "console.log(require.resolve('@apvee/spfx-m365-actionable-provisioning'));\n",
      'utf8',
    );

    const esmEntry = execFileSync(process.execPath, [esmResolver], {
      cwd: fixture.fixtureRoot,
      encoding: 'utf8',
    }).trim();
    const cjsEntry = execFileSync(process.execPath, [cjsResolver], {
      cwd: fixture.fixtureRoot,
      encoding: 'utf8',
    }).trim();

    expect(esmEntry).toMatch(/\/dist\/esm\/index\.js$/);
    expect(cjsEntry).toMatch(/\/dist\/cjs\/index\.js$/);
  });

  it('deduplicates React and Fluent shared-context packages', () => {
    const dependencyTree = JSON.parse(execFileSync(
      'npm',
      ['ls', '--all', '--json'],
      {
        cwd: fixture.fixtureRoot,
        env: fixture.npmEnvironment,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
      },
    ));
    expect(dependencyTree.problems ?? []).toEqual([]);
    const physicalPaths = new Map<string, Set<string>>();

    const inspectPackage = (packagePath: string): void => {
      const manifestPath = path.join(packagePath, 'package.json');
      if (!existsSync(manifestPath)) return;

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { name?: string };
      if (manifest.name && (
        manifest.name === 'react'
        || manifest.name === 'react-dom'
        || manifest.name.startsWith('@fluentui/')
      )) {
        const paths = physicalPaths.get(manifest.name) ?? new Set<string>();
        paths.add(realpathSync(packagePath));
        physicalPaths.set(manifest.name, paths);
      }

      inspectNodeModules(path.join(packagePath, 'node_modules'));
    };

    const inspectNodeModules = (nodeModulesPath: string): void => {
      if (!existsSync(nodeModulesPath)) return;

      for (const entry of readdirSync(nodeModulesPath, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const entryPath = path.join(nodeModulesPath, entry.name);
        if (entry.name.startsWith('@')) {
          for (const scopedEntry of readdirSync(entryPath, { withFileTypes: true })) {
            if (scopedEntry.isDirectory()) {
              inspectPackage(path.join(entryPath, scopedEntry.name));
            }
          }
        } else {
          inspectPackage(entryPath);
        }
      }
    };

    inspectNodeModules(path.join(fixture.fixtureRoot, 'node_modules'));
    expect(physicalPaths.get('react')?.size).toBe(1);
    expect(physicalPaths.get('react-dom')?.size).toBe(1);
    const guardedFluentPackages = [
      '@fluentui/react-components',
      '@fluentui/react-icons',
      '@fluentui/react-migration-v8-v9',
      '@fluentui/react-portal',
      '@fluentui/react-provider',
      '@fluentui/react-shared-contexts',
      '@fluentui/theme',
    ];
    for (const packageName of guardedFluentPackages) {
      expect(physicalPaths.get(packageName)?.size, packageName).toBe(1);
    }

    const nestedModules = path.join(fixture.installedPackageRoot, 'node_modules');
    if (lstatSync(fixture.installedPackageRoot).isDirectory()) {
      const packageManifest = readFileSync(
        path.join(fixture.installedPackageRoot, 'package.json'),
        'utf8',
      );
      expect(packageManifest).toContain('"version": "2.0.0"');
      expect(fixture.findGuardedDependenciesBelow(nestedModules)).toEqual([]);
    }
  });
});
