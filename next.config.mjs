/** @type {import('next').NextConfig} */

import { execSync } from 'child_process';
import pkg from './package.json' with { type: 'json' };

const version = pkg.version;
// The build should not fail where git is unavailable, e.g. a build from a source archive without .git
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}
const commitHash = getCommitHash();
const buildDate = new Date().toLocaleString('sv-SE');

const nextConfig = {
  // Handle the open issue in Next.js with output: 'export' by only setting it when building for production
  // https://github.com/vercel/next.js/issues/56253#issuecomment-2077150712
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  env: {
    APP_VERSION: version,
    APP_HASH: commitHash,
    APP_DATE: buildDate,
  },
};

export default nextConfig;
