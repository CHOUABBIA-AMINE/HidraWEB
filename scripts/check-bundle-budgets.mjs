import console from 'node:console';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const kib = 1024;
const budgets = Object.freeze({
  initialJavaScriptBytes: 900 * kib,
  routeChunkBytes: 700 * kib,
  anyJavaScriptChunkBytes: 1100 * kib,
  minimumLazyRouteEntries: 20,
});

const distDirectory = resolve('dist');
const manifestPath = resolve(distDirectory, '.vite/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const manifestEntries = Object.entries(manifest);

const entryRecord =
  manifestEntries.find(([source, record]) => record.isEntry === true && source.endsWith('src/main.tsx')) ??
  manifestEntries.find(([, record]) => record.isEntry === true);

if (!entryRecord) {
  throw new Error('Bundle budget check failed: Vite manifest contains no application entry.');
}

const fileSize = async (file) => (await stat(resolve(distDirectory, file))).size;

const collectStaticJavaScript = (manifestKey, visited = new Set()) => {
  if (visited.has(manifestKey)) {
    return visited;
  }

  visited.add(manifestKey);
  const record = manifest[manifestKey];
  for (const importedKey of record?.imports ?? []) {
    collectStaticJavaScript(importedKey, visited);
  }
  return visited;
};

const staticEntryKeys = collectStaticJavaScript(entryRecord[0]);
let initialJavaScriptBytes = 0;
for (const key of staticEntryKeys) {
  const file = manifest[key]?.file;
  if (typeof file === 'string' && file.endsWith('.js')) {
    initialJavaScriptBytes += await fileSize(file);
  }
}

const routeSourcePattern = /(?:Page\.tsx$|src\/processes\/engineering\/index\.ts$|src\/features\/(?:analytics|audit|configuration|custody|documents|integration|notification|reporting|risk|simulation)\/index\.ts$)/;
const lazyRouteEntries = manifestEntries.filter(
  ([source, record]) => record.isDynamicEntry === true && routeSourcePattern.test(source),
);

const allJavaScriptFiles = [
  ...new Set(
    manifestEntries
      .map(([, record]) => record.file)
      .filter((file) => typeof file === 'string' && file.endsWith('.js')),
  ),
];

const violations = [];
if (initialJavaScriptBytes > budgets.initialJavaScriptBytes) {
  violations.push(
    `initial static JavaScript is ${(initialJavaScriptBytes / kib).toFixed(1)} KiB; budget is ${budgets.initialJavaScriptBytes / kib} KiB`,
  );
}

if (lazyRouteEntries.length < budgets.minimumLazyRouteEntries) {
  violations.push(
    `only ${lazyRouteEntries.length} route modules are emitted as lazy entries; minimum is ${budgets.minimumLazyRouteEntries}`,
  );
}

let largestRouteChunk = { source: 'none', file: 'none', bytes: 0 };
for (const [source, record] of lazyRouteEntries) {
  if (!record.file?.endsWith('.js')) {
    continue;
  }
  const bytes = await fileSize(record.file);
  if (bytes > largestRouteChunk.bytes) {
    largestRouteChunk = { source, file: record.file, bytes };
  }
  if (bytes > budgets.routeChunkBytes) {
    violations.push(
      `lazy route ${source} emits ${(bytes / kib).toFixed(1)} KiB in ${record.file}; route budget is ${budgets.routeChunkBytes / kib} KiB`,
    );
  }
}

let largestJavaScriptChunk = { file: 'none', bytes: 0 };
for (const file of allJavaScriptFiles) {
  const bytes = await fileSize(file);
  if (bytes > largestJavaScriptChunk.bytes) {
    largestJavaScriptChunk = { file, bytes };
  }
  if (bytes > budgets.anyJavaScriptChunkBytes) {
    violations.push(
      `${file} is ${(bytes / kib).toFixed(1)} KiB; maximum JavaScript chunk budget is ${budgets.anyJavaScriptChunkBytes / kib} KiB`,
    );
  }
}

console.log('HWEB-015-07 bundle budget report');
console.log(`- initial static JavaScript: ${(initialJavaScriptBytes / kib).toFixed(1)} KiB / ${budgets.initialJavaScriptBytes / kib} KiB`);
console.log(`- lazy route entries: ${lazyRouteEntries.length} / minimum ${budgets.minimumLazyRouteEntries}`);
console.log(
  `- largest lazy route chunk: ${(largestRouteChunk.bytes / kib).toFixed(1)} KiB (${largestRouteChunk.file}) / ${budgets.routeChunkBytes / kib} KiB`,
);
console.log(
  `- largest JavaScript chunk: ${(largestJavaScriptChunk.bytes / kib).toFixed(1)} KiB (${largestJavaScriptChunk.file}) / ${budgets.anyJavaScriptChunkBytes / kib} KiB`,
);

if (violations.length > 0) {
  throw new Error(`Bundle budget check failed:\n- ${violations.join('\n- ')}`);
}
