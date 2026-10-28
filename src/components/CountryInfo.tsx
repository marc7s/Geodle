'use client';

import { getFlagURL } from '@/utils';
import { Country } from '@prisma/client';

import Image from 'next/image';
import StaticMap from './StaticMap';
import InfoField from './InfoField';

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
          // Flags have different aspect ratios, so the size is set with CSS where only the width is fixed
          // Both dimensions differ from the props then, which Next does not warn about
          width={0}
          height={0}
          className='w-[100px] h-auto'
          // The flag is at the top of the page
          loading='eager'
          alt='Flag'
        ></Image>
        <h1 className='mt-4'>{props.country.englishShortName}</h1>
        <InfoField name='Domestic name'>{props.country.domesticName}</InfoField>
        <InfoField name='Independent'>
          {props.country.isIndependent ? 'Yes' : 'No'}
        </InfoField>
        <InfoField name='Coordinates'>
          {props.country.lat} {props.country.long}
        </InfoField>

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
