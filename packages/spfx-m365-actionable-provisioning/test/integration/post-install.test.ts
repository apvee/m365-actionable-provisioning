// @vitest-environment node

import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const packageRoot = process.cwd();
const postInstallScript = path.join(packageRoot, 'scripts', 'post-install.cjs');
const legacyPath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js';
const distPath = 'node_modules/@apvee/spfx-m365-actionable-provisioning/dist/loc/{locale}.js';

function runPostInstall(localizedResources: Record<string, string>): Record<string, string> {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'spfx-post-install-'));
  const configDirectory = path.join(fixtureRoot, 'config');
  const configPath = path.join(configDirectory, 'config.json');
  mkdirSync(configDirectory, { recursive: true });
  writeFileSync(configPath, JSON.stringify({ localizedResources }), 'utf8');

  try {
    execFileSync(process.execPath, [postInstallScript], {
      cwd: packageRoot,
      env: { ...process.env, INIT_CWD: fixtureRoot },
      stdio: 'pipe',
    });

    return JSON.parse(readFileSync(configPath, 'utf8')).localizedResources;
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

describe('post-install localized resource setup', () => {
  it('migrates the exact legacy localization path', () => {
    expect(runPostInstall({ SPFxProvisioningUIStrings: legacyPath }))
      .toEqual({ SPFxProvisioningUIStrings: distPath });
  });

  it('adds the localization resource when absent', () => {
    expect(runPostInstall({}))
      .toEqual({ SPFxProvisioningUIStrings: distPath });
  });

  it('preserves a consumer-defined localization path', () => {
    expect(runPostInstall({ SPFxProvisioningUIStrings: 'custom/strings/{locale}.js' }))
      .toEqual({ SPFxProvisioningUIStrings: 'custom/strings/{locale}.js' });
  });
});
