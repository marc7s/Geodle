// Fails if a required environment variable is missing, e.g. `dotenv -e .env.prod -- node validateEnv.mjs`
// Only checks that the variables are set, not that their values are valid

const requiredVariables = ['DATABASE_URL'];

const missing = requiredVariables.filter(
  (name) => (process.env[name] ?? '').trim() === ''
);
if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
      'Set them in the environment or in the .env file used by the script (see the .env.*.example files)'
  );
  process.exit(1);
}
console.log(`Environment variables are set: ${requiredVariables.join(', ')}`);
