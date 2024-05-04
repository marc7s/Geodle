/** @type {import('next').NextConfig} */

import { execSync } from 'child_process';
import pkg from './package.json' with { type: 'json' };

const version = pkg.version;
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildDate = new Date().toLocaleString('sv-SE');

const nextConfig = {
  output: 'export',
  env: {
    APP_VERSION: version,
    APP_HASH: commitHash,
    APP_DATE: buildDate,
  },
};

export default nextConfig;
