import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PACKAGE_NAME = '@apvee/spfx-m365-actionable-provisioning';

type PackResult = {
  filename: string;
  files: Array<{ path: string }>;
};

export type PackageFixture = Readonly<{
  artifactRoot: string;
  cleanup: () => void;
  findGuardedDependenciesBelow: (root: string) => string[];
  fixtureRoot: string;
  installedPackageRoot: string;
  npmEnvironment: NodeJS.ProcessEnv;
  packageRoot: string;
  paths: string[];
  tarballPath: string;
}>;

function findGuardedDependenciesBelow(root: string): string[] {
  if (!existsSync(root)) return [];

  const matches: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (!entry.isDirectory()) continue;

      const relative = path.relative(root, entryPath).split(path.sep).join('/');
      if (
        relative === 'react'
        || relative === 'react-dom'
        || relative.startsWith('@fluentui/')
      ) {
        matches.push(realpathSync(entryPath));
      }

      visit(entryPath);
    }
  };

  visit(root);
  return matches.sort();
}

export function createPackageFixture(): PackageFixture {
  const packageRoot = process.cwd();
  const artifactRoot = mkdtempSync(path.join(tmpdir(), 'spfx-package-artifact-'));
  const fixtureRoot = path.join(artifactRoot, 'consumer');
  const npmEnvironment = {
    ...process.env,
    npm_config_cache: path.join(artifactRoot, '.npm-cache'),
  };
  const existingTarballs = new Set(
    readdirSync(packageRoot).filter((entry) => entry.endsWith('.tgz')),
  );
  let tarballPath: string | undefined;

  mkdirSync(fixtureRoot, { recursive: true });
  writeFileSync(
    path.join(fixtureRoot, 'package.json'),
    JSON.stringify({ name: 'spfx-package-consumer', private: true }, null, 2),
    'utf8',
  );

  const cleanup = (): void => {
    rmSync(artifactRoot, { recursive: true, force: true });
    if (tarballPath) rmSync(tarballPath, { force: true });
    for (const entry of readdirSync(packageRoot)) {
      if (entry.endsWith('.tgz') && !existingTarballs.has(entry)) {
        rmSync(path.join(packageRoot, entry), { force: true });
      }
    }
  };

  try {
    const packJson = execFileSync('npm', ['pack', '--json', '--silent'], {
      cwd: packageRoot,
      env: npmEnvironment,
      encoding: 'utf8',
    });
    const [{ filename, files }] = JSON.parse(packJson) as PackResult[];
    tarballPath = path.resolve(packageRoot, filename);

    execFileSync('npm', [
      'install',
      '--ignore-scripts',
      '--no-package-lock',
      '--no-audit',
      '--no-fund',
      tarballPath,
      '@apvee/m365-actionable-provisioning@1.0.0',
      '@apvee/react-layout-kit@1.2.0',
      '@fluentui/react-components@9.72.9',
      '@fluentui/react-icons@2.0.316',
      '@fluentui/react-migration-v8-v9@9.9.18',
      '@fluentui/react-motion-components-preview@0.14.2',
      '@fluentui/theme@2.7.2',
      '@microsoft/sp-component-base@1.21.1',
      '@microsoft/sp-core-library@1.21.1',
      '@microsoft/sp-property-pane@1.21.1',
      '@microsoft/sp-webpart-base@1.21.1',
      '@pnp/graph@4.17.0',
      '@pnp/sp@4.17.0',
      '@types/react@17.0.45',
      '@types/react-dom@17.0.17',
      'react@17.0.1',
      'react-dom@17.0.1',
      'scheduler@0.20.2',
      'stylis@4.3.6',
    ], {
      cwd: fixtureRoot,
      env: npmEnvironment,
      stdio: 'pipe',
    });

    return {
      artifactRoot,
      cleanup,
      findGuardedDependenciesBelow,
      fixtureRoot,
      installedPackageRoot: path.join(
        fixtureRoot,
        'node_modules',
        ...PACKAGE_NAME.split('/'),
      ),
      npmEnvironment,
      packageRoot,
      paths: files.map((file) => file.path),
      tarballPath,
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}
