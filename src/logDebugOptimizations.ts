import {
  OPT_DEBUG_DISABLE_GAME_SEED_GENERATION,
  OPT_DEBUG_ISOLATE_BUILD_TO_GAME,
} from './optimizations';

function log(msg: string) {
  console.info(`\n!!! ${msg} !!!`);
}

if (OPT_DEBUG_ISOLATE_BUILD_TO_GAME !== undefined)
  log(`Isolating build to game: ${OPT_DEBUG_ISOLATE_BUILD_TO_GAME}`);

if (OPT_DEBUG_DISABLE_GAME_SEED_GENERATION.length > 0) {
  const disabledGames: string[] = OPT_DEBUG_DISABLE_GAME_SEED_GENERATION.filter(
    (displayName) =>
      OPT_DEBUG_ISOLATE_BUILD_TO_GAME === undefined ||
      OPT_DEBUG_ISOLATE_BUILD_TO_GAME === displayName
  );
  log(`Disabled seeding for: ${disabledGames.join(', ')}`);
}
