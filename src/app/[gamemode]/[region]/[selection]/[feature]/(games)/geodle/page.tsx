import { getCountries } from '@/api';
import { getUnsupportedReason } from '@/utils';
import {
  GamePageProps,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import Geodle from '@/components/games/geodle/Geodle';
import { GeodleGame } from '@/types/games';

export default async function GeodlePage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    GeodleGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  // The solution is picked by the client, based on the seed
  const countries = await getCountries(params.selection, params.region);
  if (countries.length < 1)
    return <>Error! Could not generate the correct country</>;

  function getAllowedGuesses(): number {
    switch (params.region) {
      case 'World':
        return 6;
      case 'Africa':
        return 5;
      case 'Americas':
        return 4;
      case 'Asia':
        return 5;
      case 'Europe':
        return 4;
      case 'Oceania':
        return 3;
    }
  }

  return (
    <>
      <Geodle
        title={`Guess the ${formatSingularFeature(params.feature)} in ${formatRegion(params.region)}`}
        allowedGuessCount={getAllowedGuesses()}
        allowedGuesses={countries.map((c) => c.englishShortName)}
        gameConfig={{ params: params }}
      ></Geodle>
    </>
  );
}
