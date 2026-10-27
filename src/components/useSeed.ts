'use client';

import { useEffect, useState } from 'react';
import { Game } from '@/types/games';
import { GameParams } from '@/types/routing/dynamicParams';
import { DailyGameAdditionalConfig, getDailySeed } from '@/utils';

// The URL search parameter that holds the seed, e.g. `?seed=17`
export const seedSearchParam: string = 'seed';

/**
 * Gets the seed that decides the solution of a game.
 *
 * Seeds go from 1 to `seedCount`. The seed is read from the URL, so a game can be shared.
 * If the URL has no valid seed, the daily seed (daily mode) or a random seed (training mode) is used,
 * and added to the URL.
 *
 * Returns undefined until the seed is known, since the URL is only available in the browser
 */
export function useSeed(
  game: Game,
  gameConfig: GameParams,
  seedCount: number,
  additionalDailyConfig: DailyGameAdditionalConfig = {}
): number | undefined {
  const [seed, setSeed] = useState<number | undefined>(undefined);

  const { gamemode, region, selection, feature } = gameConfig.params;
  const dailyConfigKey: string = JSON.stringify(additionalDailyConfig);

  useEffect(() => {
    // Games with a single seed do not use it to pick the solution, so keep it out of the URL
    if (seedCount <= 1) {
      setSeed(1);
      return;
    }

    const url: URL = new URL(window.location.href);
    const urlSeed: number = Number(url.searchParams.get(seedSearchParam));
    if (Number.isInteger(urlSeed) && urlSeed >= 1 && urlSeed <= seedCount) {
      setSeed(urlSeed);
      return;
    }

    const newSeed: number =
      gamemode === 'daily'
        ? getDailySeed(
            seedCount,
            game,
            gameConfig,
            new Date(),
            additionalDailyConfig
          )
        : Math.floor(Math.random() * seedCount) + 1;

    // Replace (not push) the URL, so going back does not land on the seedless URL again
    url.searchParams.set(seedSearchParam, newSeed.toString());
    window.history.replaceState(window.history.state, '', url);
    setSeed(newSeed);
    // The params are listed individually, since the objects are recreated on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, gamemode, region, selection, feature, seedCount, dailyConfigKey]);

  return seed;
}
