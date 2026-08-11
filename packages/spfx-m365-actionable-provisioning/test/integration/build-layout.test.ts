// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packagePath = (...segments: string[]): string => resolve(process.cwd(), ...segments);

describe('package build layout', () => {
  it('emits authentic ESM, CommonJS, declarations, and localization outputs', () => {
    expect(existsSync(packagePath('dist/esm/index.js'))).toBe(true);
    expect(existsSync(packagePath('dist/cjs/index.js'))).toBe(true);
    expect(existsSync(packagePath('dist/types/index.d.ts'))).toBe(true);
    expect(existsSync(packagePath('dist/loc/en-us.js'))).toBe(true);
    expect(existsSync(packagePath('dist/cjs/package.json'))).toBe(true);
    expect(existsSync(packagePath('lib'))).toBe(false);

    const esm = readFileSync(packagePath('dist/esm/index.js'), 'utf8');
    const cjs = readFileSync(packagePath('dist/cjs/index.js'), 'utf8');
    expect(esm).toMatch(/export\s/);
    expect(esm).not.toMatch(/\brequire\s*\(/);
    expect(cjs).toMatch(/\brequire\s*\(|\bexports\./);
  });
});
