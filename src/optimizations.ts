import { GameRegion } from './types/routing/generated/regions';

// Pather picks its solution from these paths in the browser, so they no longer affect the number of built pages
// They do affect the page size, and which solution each seed maps to, so changing them changes existing seeds

//@ Disable this to reduce the number of paths by around half
export const OPT_PATHER_USE_BIDIRECTIONAL_PATHS: boolean = false;

//@ Only keep every Nth path, to reduce the number of paths
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
