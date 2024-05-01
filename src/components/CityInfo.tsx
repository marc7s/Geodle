'use client';

import { City, Country } from '@prisma/client';
import CountryInfo from './CountryInfo';
import StaticMap from './StaticMap';

interface Props {
  city?: City;
  country?: Country;
}

export default function CityInfo(props: Props) {
  if (!props.city) return <>Unknown city!</>;

  return (
    <>
      <div className='flex flex-col items-center'>
        <h1 className='text-3xl'>{props.city.englishName}</h1>
        <h2>Domestic name: {props.city.domesticName}</h2>
        <h2></h2>
        <h2>
          Coordinates: {props.city.lat} {props.city.long}
        </h2>
        <div className='mt-10'>
          <StaticMap
            height={500}
            width={500}
            marker={true}
            position={[props.city.lat, props.city.long]}
            zoom={5}
            mapStyle='OSM'
          />
        </div>
      </div>
      {props.country ? (
        <div className='flex flex-col items-center mt-5'>
          <div className='mb-3 text-xl'>
            {props.city.isCapital ? 'Capital of' : 'Located in'}:
          </div>
          <CountryInfo country={props.country} hideMap={true} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
