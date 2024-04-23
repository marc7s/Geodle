import { Country } from '@prisma/client';
import Image from 'next/image';

interface Props {
  country?: Country;
}

export default function CountryInfo(props: Props) {
  if (!props.country) return <>Unknown country!</>;

  return (
    <>
      <div>
        <Image
          src={`/flags/${props.country.shortName}.png`}
          width={100}
          height={100}
          alt='Flag'
        ></Image>
        <h1>{props.country.shortName}</h1>
        <h2>Population: {props.country.population}</h2>
      </div>
    </>
  );
}
