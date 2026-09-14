/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const workflow = readFileSync(join(process.cwd(), '.github/workflows/ci.yml'), 'utf8');
const packageJson = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
const releaseScript = readFileSync(join(process.cwd(), 'scripts/release-artifact.mjs'), 'utf8');
const releasePolicy = readFileSync(
  join(process.cwd(), 'docs/deployment/Release-Artifact-Backup-Rollback.md'),
  'utf8',
);

describe('release artifact and rollback policy', () => {
  it('binds release packaging and verification to deterministic scripts', () => {
    expect(packageJson).toContain('"release:package": "node scripts/release-artifact.mjs package"');
    expect(packageJson).toContain('"release:verify": "node scripts/release-artifact.mjs verify"');
    expect(releaseScript).toContain("createHash('sha256')");
    expect(releaseScript).toContain("process.env.HIDRA_RELEASE_SOURCE_SHA ?? process.env.GITHUB_SHA");
    expect(releaseScript).toContain("path: normalizePath(relative(releaseRoot, file))");
    expect(releaseScript).toContain('Release artifact verification failed');
  });

  it('publishes the release artifact only after the full browser regression suite succeeds', () => {
    const regressionIndex = workflow.indexOf('- name: Full Playwright regression suite');
    const uploadIndex = workflow.indexOf('- name: Upload verified release artifact');

    expect(regressionIndex).toBeGreaterThan(-1);
    expect(uploadIndex).toBeGreaterThan(regressionIndex);
    expect(workflow).toContain('name: hidraweb-release-${{ github.sha }}');
    expect(workflow).toContain('path: release/hidraweb');
    expect(workflow).toContain('if-no-files-found: error');
  });

  it('keeps frontend rollback separate from backend and database recovery', () => {
    expect(releasePolicy).toContain('Do not rebuild an old commit during rollback');
    expect(releasePolicy).toContain('does not back up or restore HidraAPI data');
    expect(releasePolicy).toContain('previously verified immutable release artifact');
    expect(releasePolicy).toContain('release-manifest.json');
  });
});
