import { getFlagURL, prismaDecodeStringList } from '@/utils';
import { Question } from '@/components/QuestionTask';
import { CombinedCountry, getCombinedCountries } from '@/api';
import CompleteGuesser, {
  CompleteQuestion,
} from '@/components/CompleteGuesser';
import { Attribute, CompleteGameParams } from '@/types/routing/dynamicParams';

function getSetValues(...arr: (string | null)[]) {
  const result: string[] = [];
  arr.forEach((v) => {
    if (v) result.push(v);
  });

  return result;
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
      question: 'Name',
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
    answers: possibleQuestion.answers,
    imageUrl: possibleQuestion.imageUrl,
  };
}

export default async function CompletePage({ params }: CompleteGameParams) {
  const combined: CombinedCountry[] = await getCombinedCountries();
  const completeQuestions: CompleteQuestion[] = combined
    .map((c) => combinedToPossibleQuestions(c, params.known.includes('flag')))
    .map((qs) => {
      return {
        knownQuestions: qs
          .filter((q) => params.known.includes(q.attribute))
          .map((pq) => possibleToQuestion(pq)),
        completeQuestions: qs
          .filter((q) => params.guess?.includes(q.attribute))
          .map((pq) => possibleToQuestion(pq)),
      };
    });

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='m-10 max-w-lg'>
        <CompleteGuesser questions={completeQuestions} />
      </div>
    </div>
  );
}
