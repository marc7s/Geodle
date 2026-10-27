import {
  DailyGameAdditionalConfig,
  getFlagURL,
  getSetValues,
  prismaDecodeStringList,
} from '@/utils';
import { Question } from '@/components/QuestionTask';
import { getCombinedCountries } from '@/api';
import {
  Attribute,
  CompleteGamePageProps,
  formatRegion,
} from '@/types/routing/dynamicParams';
import CompleteGuesser, {
  CompleteQuestion,
} from '@/components/games/complete/CompleteGuesser';
import { CompleterGame } from '@/types/games';
import { CombinedCountry } from '@/db';

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

export default async function CompleterPage(props: CompleteGamePageProps) {
  const params = await props.params;
  const knownAttributes: string[] = CompleterGame.decodeAttributes(
    params.knownAttributes
  );
  const guessAttributes: string[] = CompleterGame.decodeAttributes(
    params.guessAttributes
  );

  // The client picks the questions, based on the seed
  // In training, all questions are asked in a random order. In daily mode, the seed picks a single question
  const combinedCountries: CombinedCountry[] = await getCombinedCountries(
    params.selection,
    params.region
  );

  if (combinedCountries.length < 1) return <>Error! Could not get solutions</>;

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
            possibleQuestions={completeQuestions}
            gameConfig={params}
            additionalDailyConfig={additionalDailyConfig}
          />
        </div>
      </div>
    </>
  );
}
