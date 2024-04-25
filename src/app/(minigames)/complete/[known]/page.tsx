import { arrayPartition, prismaDecodeStringList } from '@/utils';

import styles from './styles.module.scss';
import { Question } from '@/components/QuestionTask';
import CompleteTask from '@/components/CompleteTask';
import { CombinedCountry, getCombinedCountries } from '@/api';

function getSetValues(...arr: (string | null)[]) {
  const result: string[] = [];
  arr.forEach((v) => {
    if (v) result.push(v);
  });

  return result;
}

function combinedToQuestions(combined: CombinedCountry): Question[] {
  return [
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
      knownMatches: ['flag'],
      question: 'Flag',
      answers: [combined.country.englishShortName],
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
}

function getCompleteTask(combined: CombinedCountry, known: string[]) {
  const [knownData, complete] = arrayPartition(
    combinedToQuestions(combined),
    (q) => q.knownMatches.some((m) => known.includes(m))
  );

  return (
    <div key={combined.country.id} className={styles.task}>
      <CompleteTask
        knownQuestions={knownData}
        questions={complete}
        title='Country'
      />
    </div>
  );
}

export default async function CompletePage({ params }: any) {
  const combined: CombinedCountry[] = await getCombinedCountries();
  return (
    <>
      {combined.map((c: CombinedCountry) => getCompleteTask(c, params.known))}
    </>
  );
}
