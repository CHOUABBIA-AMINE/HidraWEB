import console from 'node:console';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const command = process.argv[2];
const projectRoot = resolve('.');
const releaseRoot = resolve(projectRoot, 'release/hidraweb');
const appRoot = join(releaseRoot, 'app');
const deploymentRoot = join(releaseRoot, 'deploy/nginx');
const manifestPath = join(releaseRoot, 'release-manifest.json');
const sourceDistRoot = resolve(projectRoot, 'dist');
const sourceDeploymentRoot = resolve(projectRoot, 'deploy/nginx');
const deploymentFiles = ['hidra-security-headers.conf.template', 'hidraweb.conf.template'];

const normalizePath = (path) => path.split(sep).join('/');

const sha256File = async (path) => {
  const content = await readFile(path);
  return createHash('sha256').update(content).digest('hex');
};

const listFiles = async (root) => {
  const result = [];
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Release artifacts must not contain symbolic links: ${absolute}`);
      }
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        result.push(absolute);
      } else {
        throw new Error(`Unsupported release artifact entry: ${absolute}`);
      }
    }
  };
  await visit(root);
  return result;
};

const buildRecords = async () => {
  const files = [
    ...(await listFiles(appRoot)),
    ...(await listFiles(deploymentRoot)),
  ];

  const records = [];
  for (const file of files) {
    const fileStat = await stat(file);
    records.push({
      path: normalizePath(relative(releaseRoot, file)),
      sha256: await sha256File(file),
      bytes: fileStat.size,
    });
  }
  return records.sort((left, right) => left.path.localeCompare(right.path));
};

const requireSourceCommit = () => {
  const sourceCommit = process.env.HIDRA_RELEASE_SOURCE_SHA ?? process.env.GITHUB_SHA ?? 'local';
  if (sourceCommit !== 'local' && !/^[0-9a-f]{40}$/u.test(sourceCommit)) {
    throw new Error(`Invalid release source commit: ${sourceCommit}`);
  }
  return sourceCommit;
};

const packageRelease = async () => {
  await stat(sourceDistRoot).catch(() => {
    throw new Error('Production build output is missing. Run npm run build before packaging.');
  });

  await rm(releaseRoot, { recursive: true, force: true });
  await mkdir(appRoot, { recursive: true });
  await mkdir(deploymentRoot, { recursive: true });
  await cp(sourceDistRoot, appRoot, { recursive: true, errorOnExist: true });

  for (const file of deploymentFiles) {
    await cp(join(sourceDeploymentRoot, file), join(deploymentRoot, file), { errorOnExist: true });
  }

  const manifest = {
    schemaVersion: 1,
    application: 'HidraWEB',
    sourceCommit: requireSourceCommit(),
    files: await buildRecords(),
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Created verified-release candidate at ${relative(projectRoot, releaseRoot)} for ${manifest.sourceCommit}.`);
};

const verifyRelease = async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.application !== 'HidraWEB') {
    throw new Error('Release manifest identity/schema is invalid.');
  }

  const expectedSourceCommit = process.env.HIDRA_RELEASE_SOURCE_SHA ?? process.env.GITHUB_SHA;
  if (expectedSourceCommit && manifest.sourceCommit !== expectedSourceCommit) {
    throw new Error(`Release source commit mismatch: expected ${expectedSourceCommit}, found ${manifest.sourceCommit}.`);
  }

  const expectedRecords = await buildRecords();
  const actualRecords = manifest.files;
  if (!Array.isArray(actualRecords)) {
    throw new Error('Release manifest files entry is invalid.');
  }

  const expectedJson = JSON.stringify(expectedRecords);
  const actualJson = JSON.stringify(actualRecords);
  if (actualJson !== expectedJson) {
    throw new Error('Release artifact verification failed: file set, size, or SHA-256 digest drift detected.');
  }

  for (const file of deploymentFiles) {
    if (!expectedRecords.some((record) => record.path === `deploy/nginx/${file}`)) {
      throw new Error(`Required deployment template missing from release artifact: ${basename(file)}`);
    }
  }
  if (!expectedRecords.some((record) => record.path === 'app/index.html')) {
    throw new Error('Release artifact is missing app/index.html.');
  }

  console.log(`Verified ${expectedRecords.length} release files for ${manifest.sourceCommit}.`);
};

if (command === 'package') {
  await packageRelease();
} else if (command === 'verify') {
  await verifyRelease();
} else {
  throw new Error('Usage: node scripts/release-artifact.mjs <package|verify>');
}
