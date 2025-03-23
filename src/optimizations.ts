import { GameRegion } from './types/routing/generated/regions';

//@ Disable this to reduce the number of paths by around half
export const OPT_PATHER_USE_BIDIRECTIONAL_PATHS: boolean = false;

//@ Skip every Nth path to reduce the number of paths
//@ Set to 0 to disable
export const OPT_PATHER_SKIP_EVERY_N_PATH: number = 5;

// Custom solution limits depending on the region
// For smaller regions, include shorter paths
// For larger regions, discard shorter paths to reduce the combinations
//@ Increase minimum path length and reduce maximum path length to reduce the number of solutions
export function getRegionSolutionLimits(region: GameRegion): [number, number] {
  switch (region) {
    case 'World':
      return [5, 8];
    default:
      return [4, 7];
  }
}

// A list of display names for the games to disable seeding for
// This is useful for building in dev, when you quickly want to disable seeding for some games
// This makes them a lot quicker to build, so you can focus on performance improvements of other games
//@ Only affects development builds, used to reduce build time or to investigate game build times
//@ Add games to the list to reduce their build times by disabling seeding
export const OPT_DEBUG_DISABLE_GAME_SEED_GENERATION: string[] = [];

// Optionally select a game to isolate the build to
// This will not generate any pages for the other games (but still build the other pages that are not games)
//@ Set to a game display name to only build that game
export const OPT_DEBUG_ISOLATE_BUILD_TO_GAME: string | undefined = undefined;
