import { arrayPartition, getFlagURL, prismaDecodeStringList } from '@/utils';
import { Question } from '@/components/QuestionTask';
import { CombinedCountry, getCombinedCountries } from '@/api';
import CompleteGuesser, {
  CompleteQuestion,
} from '@/components/CompleteGuesser';

function getSetValues(...arr: (string | null)[]) {
  const result: string[] = [];
  arr.forEach((v) => {
    if (v) result.push(v);
  });

  return result;
}

function combinedToQuestions(
  combined: CombinedCountry,
  includeFlagQuestion: boolean
): Question[] {
  const questions: Question[] = [
    {
      knownMatches: ['name', 'shortName', 'longName'],
      question: 'Name',
      answers: getSetValues(
        combined.country.englishShortName,
        combined.country.englishLongName,
        ...prismaDecodeStringList(combined.country.aliases)
      ),
    },
    {
      knownMatches: ['capital'],
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
          knownMatches: ['flag'],
          question: 'Flag',
          imageUrl: getFlagURL(combined.country),
          answers: [combined.country.englishShortName],
        },
      ]
    : questions;
}

export default async function CompletePage({ params }: any) {
  const combined: CombinedCountry[] = await getCombinedCountries();
  const completeQuestions: CompleteQuestion[] = combined
    .map((c) => combinedToQuestions(c, params.known.includes('flag')))
    .map((qs) => {
      const [knownData, complete] = arrayPartition(qs, (q) =>
        q.knownMatches.some((m) => params.known.includes(m))
      );
      return {
        knownQuestions: knownData,
        completeQuestions: complete,
      };
    });

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='m-10 max-w-lg'>
        <CompleteGuesser questions={completeQuestions} known={params.known} />
      </div>
    </div>
  );
}
