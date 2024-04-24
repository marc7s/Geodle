import { getFlagURL } from '@/utils';
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
          src={getFlagURL(props.country)}
          width={100}
          height={100}
          alt='Flag'
        ></Image>
        <h1>{props.country.englishShortName}</h1>
        <h2>Domestic name: {props.country.domesticName}</h2>
        <h2>
          Coordinates: {props.country.lat} {props.country.long}
        </h2>
      </div>
    </>
  );
}
