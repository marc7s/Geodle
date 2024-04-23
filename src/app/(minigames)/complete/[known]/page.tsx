import prisma from '@/app/db';
import { arrayPartition, arrayShuffle, prismaDecodeStringList } from '@/utils';
import { City, Country } from '@prisma/client';

import styles from './styles.module.scss';
import { Question } from '@/components/QuestionTask';
import CompleteTask from '@/components/CompleteTask';

interface CombinedCountry {
  country: Country;
  capital: City;
}

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

async function getCombinedCountries(): Promise<CombinedCountry[]> {
  const countries: Country[] = await prisma.country.findMany();
  const capitals: City[] = await prisma.city.findMany({
    where: { isCapital: true },
  });

  const combined: CombinedCountry[] = countries.map((c: Country) => {
    const capital: City | undefined = capitals.find(
      (cap) => cap.countryId === c.id
    );
    if (!capital) throw Error(`Capital not found for ${c.englishShortName}`);

    return {
      country: c,
      capital: capital,
    };
  });

  return arrayShuffle(combined);
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
