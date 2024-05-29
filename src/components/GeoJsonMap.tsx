'use client';

import { GeoJson, Map } from 'pigeon-maps';
import { emptymap } from '@/mapProviders';
import { GeoJsonData } from '@/app/[gamemode]/[region]/[selection]/[feature]/(games)/puzzle/page';
import { MapConfig } from '@/utils';

interface Props {
  config: MapConfig;
  height: number;
  width: number;
  dataList: GeoJsonData[];
  backgroundDataList: GeoJsonData[];
}
export default function GeoJsonMap(props: Props) {
  return (
    <div className='emptyMap border-2 border-black'>
      <Map
        height={props.height}
        width={props.width}
        defaultCenter={props.config.position}
        defaultZoom={props.config.zoom ?? 6}
        provider={emptymap}
        attribution={false}
        attributionPrefix={false}
      >
        {renderGeoJsonData(props.backgroundDataList, true)}
        {renderGeoJsonData(props.dataList, false)}
      </Map>
    </div>
  );
}

function renderGeoJsonData(
  dataList: GeoJsonData[],
  background: boolean
): JSX.Element[] {
  const defaultStyle = {
    strokeWidth: '1',
    r: '10',
  };

  const foregroundStyle = (feature: GeoJsonData, hover: boolean) => {
    return hover
      ? {
          ...defaultStyle,
          fill: 'white',
          stroke: 'black',
        }
      : {
          ...defaultStyle,
          fill: '#154354',
          stroke: 'white',
        };
  };

  const backgroundStyle = (feature: GeoJsonData, hover: boolean) => {
    return {
      ...defaultStyle,
      fill: 'rgba(20, 20, 20, 0.1)',
      stroke: 'black',
    };
  };

  return dataList.map((geoData, index) => (
    <GeoJson
      key={index}
      data={geoData}
      styleCallback={background ? backgroundStyle : foregroundStyle}
    />
  ));
}
