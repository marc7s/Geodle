'use client';

import { getFlagURL } from '@/utils';
import { Country } from '@prisma/client';

import Image from 'next/image';
import StaticMap from './StaticMap';

interface Props {
  country?: Country;
  hideMap?: boolean;
}

export default function CountryInfo(props: Props) {
  if (!props.country) return <>Unknown country!</>;

  return (
    <>
      <div className='flex flex-col items-center'>
        <Image
          src={getFlagURL(props.country)}
          width={100}
          height={100}
          alt='Flag'
        ></Image>
        <h1 className='mt-4'>{props.country.englishShortName}</h1>
        <h2>Domestic name: {props.country.domesticName}</h2>
        <h2>
          Coordinates: {props.country.lat} {props.country.long}
        </h2>

        {!props.hideMap ? (
          <div className='mt-10'>
            <StaticMap
              height={500}
              width={500}
              marker={false}
              position={[props.country.lat, props.country.long]}
              zoom={5}
              mapStyle='OSM'
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
