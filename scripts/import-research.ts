import { readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { importResearch } from '../src/lib/research-import.server.ts';

const [input, commit] = process.argv.slice(2);
if (!input || !commit || !/^[a-f0-9]{40}$/.test(commit))
  throw new Error(
    'Usage: pnpm research:import <public-daily.json> <verified-gh-pages-commit>',
  );
const bytes = readFileSync(input);
if (bytes.length > 5_000_000) throw new Error('Snapshot input exceeds 5 MB');
const snapshot = importResearch(
  JSON.parse(bytes.toString()) as unknown,
  commit,
);
const destination = 'data/research/snapshot.json';
const staged = `${destination}.${process.pid}.tmp`;
try {
  writeFileSync(staged, JSON.stringify(snapshot, null, 2) + '\n', {
    flag: 'wx',
  });
  renameSync(staged, destination);
} finally {
  rmSync(staged, { force: true });
}
console.log(
  `Validated public snapshot saved: ${snapshot.period}, ${snapshot.reports.length} reports.`,
);
