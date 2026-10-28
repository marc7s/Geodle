// Runs an npm script and prints how long it took, e.g. `node build.mjs build`
// Written in Node instead of a shell script, so it works on Windows as well
import { spawnSync } from 'child_process';

const script = process.argv[2] ?? 'build';
const start = Date.now();
// `shell` is needed on Windows, where npm is a .cmd file
const { status } = spawnSync('npm', ['run', script], {
  stdio: 'inherit',
  shell: true,
});

const seconds = Math.round((Date.now() - start) / 1000);
console.log(`Build time: ${Math.floor(seconds / 60)}m${seconds % 60}s`);
process.exit(status ?? 1);
