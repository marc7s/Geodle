import {
  DailyGameAdditionalConfig,
  generateStaticSeedParams,
  getFlagURL,
  getSetValues,
  getSolutions,
  prismaDecodeStringList,
} from '@/utils';
import { Question } from '@/components/QuestionTask';
import { getCombinedCountries } from '@/api';
import {
  Attribute,
  CompleteGameParams,
  formatRegion,
  GameParams,
} from '@/types/routing/dynamicParams';
import CompleteGuesser, {
  CompleteQuestion,
} from '@/components/games/complete/CompleteGuesser';
import { CompleterGame, SeedInfo } from '@/types/games';
import { getSeed } from '@/backendUtils';
import { CombinedCountry } from '@/db';
import { cache } from 'react';

const getCompleterPossibilitiesCached = cache(getCompleterPossibilities);

// In training, there is only a single seed
// The order of the array does not matter, as you have to guess them all
// In daily mode, a single value is selected and so then the seed decides the solution
export async function generateStaticParams({
  params,
}: {
  params: CompleteGameParams;
}) {
  const gameParams: GameParams = CompleterGame.convertParams(params);
  const knownAttrs: string[] = CompleterGame.decodeAttributes(
    params.knownAttributes
  );
  const guessAttrs: string[] = CompleterGame.decodeAttributes(
    params.guessAttributes
  );

  // Remove invalid combinations, where you are supposed to guess a known attribute
  if (knownAttrs.some((knownAttr) => guessAttrs.includes(knownAttr))) return [];

  return generateStaticSeedParams(
    () => getCompleterPossibilitiesCached(gameParams),
    CompleterGame,
    gameParams,
    params.gamemode === 'training'
  );
}

async function getCompleterPossibilities({
  params,
}: GameParams): Promise<CombinedCountry[]> {
  return getCombinedCountries(params.selection, params.region);
}

interface PossibleQuestion {
  attribute: Attribute;
  question: string;
  answers: string[];
  imageUrl?: string;
}

function combinedToPossibleQuestions(
  combined: CombinedCountry,
  includeFlagQuestion: boolean
): PossibleQuestion[] {
  const questions: PossibleQuestion[] = [
    {
      attribute: 'name',
      question: 'Country',
      answers: getSetValues(
        combined.country.englishShortName,
        combined.country.englishLongName,
        ...prismaDecodeStringList(combined.country.aliases)
      ),
    },
    {
      attribute: 'capital',
      question: 'Capital',
      answers: [
        combined.capital.englishName,
        ...prismaDecodeStringList(combined.capital.aliases),
      ],
    },
  ];

  return includeFlagQuestion
    ? [
        ...questions,
        {
          attribute: 'flag',
          question: 'Flag',
          imageUrl: getFlagURL(combined.country),
          answers: [combined.country.englishShortName],
        },
      ]
    : questions;
}

function possibleToQuestion(possibleQuestion: PossibleQuestion): Question {
  return {
    question: possibleQuestion.question,
    correctAnswers: possibleQuestion.answers,
    imageUrl: possibleQuestion.imageUrl,
  };
}

export default async function CompleterPage({
  params,
}: {
  params: CompleteGameParams;
}) {
  const knownAttributes: string[] = CompleterGame.decodeAttributes(
    params.knownAttributes
  );
  const guessAttributes: string[] = CompleterGame.decodeAttributes(
    params.guessAttributes
  );

  const combined: CombinedCountry[] = await getCompleterPossibilitiesCached({
    params,
  });

  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    CompleterGame.getCompleterSeededHref(params, newSeed)
  );

  const combinedCountries: CombinedCountry[] | undefined = getSolutions(
    {
      params: params,
    },
    combined,
    seed
  );

  if (!combinedCountries) return <>Error! Could not get solutions</>;

  const completeQuestions: CompleteQuestion[] = combinedCountries
    .map((c) =>
      combinedToPossibleQuestions(c, knownAttributes.includes('flag'))
    )
    .map((qs) => {
      return {
        knownQuestions: qs
          .filter((q) => knownAttributes.includes(q.attribute))
          .map((pq) => possibleToQuestion(pq)),
        completeQuestions: qs
          .filter((q) => guessAttributes.includes(q.attribute))
          .map((pq) => possibleToQuestion(pq)),
      };
    });

  const seedInfo: SeedInfo = {
    seed: seed,
    seedCount: params.gamemode === 'training' ? 1 : combined.length,
  };

  const additionalDailyConfig: DailyGameAdditionalConfig = {
    knownAttributes: CompleterGame.encodeAttributes(knownAttributes),
    guessAttributes: CompleterGame.encodeAttributes(guessAttributes),
  };

  return (
    <>
      <h1 className='text-center text-2xl'>
        Complete the missing information for these {params.feature} in{' '}
        {formatRegion(params.region)}
      </h1>
      <div className='flex flex-col justify-center items-center'>
        <div className='m-10 max-w-xl'>
          <CompleteGuesser
            questions={completeQuestions}
            gameConfig={params}
            seedInfo={seedInfo}
            additionalDailyConfig={additionalDailyConfig}
          />
        </div>
      </div>
    </>
  );
}
