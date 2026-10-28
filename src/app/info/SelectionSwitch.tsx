import Link from 'next/link';
import {
  CountrySelection,
  countrySelections,
} from '@/types/routing/dynamicParams';
import { capitalize } from '@/utils';

interface Props {
  current: CountrySelection;
  // The info page type, e.g. `country`
  kind: string;
}

// Links to the same info list for every country selection
export default function SelectionSwitch({ current, kind }: Props) {
  return (
    <div className='flex justify-center gap-2 mb-6'>
      {countrySelections.map((s) => (
        <Link
          key={s}
          href={`/info/${s}/${kind}`}
          className={`px-4 py-1 rounded-full border border-gray-400 ${s === current ? 'bg-gray-800 text-white' : 'hover:bg-gray-200'}`}
          aria-current={s === current ? 'page' : undefined}
        >
          {capitalize(s)}
        </Link>
      ))}
    </div>
  );
}
