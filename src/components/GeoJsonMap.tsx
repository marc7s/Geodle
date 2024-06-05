'use client';

import { GeoJson, Map } from 'pigeon-maps';
import { emptymap } from '@/mapProviders';
import { MapConfig } from '@/utils';
import { GeoJsonData } from '@/geoUtils';

interface Props {
  config: MapConfig;
  height: number;
  width: number;
  isStatic: boolean;
  dataList: GeoJsonData[];
  backgroundDataList: GeoJsonData[];
  highlightOnHover?: boolean;
}
export default function GeoJsonMap({
  config,
  height,
  width,
  isStatic,
  dataList,
  backgroundDataList,
  highlightOnHover = true,
}: Props) {
  return (
    <div className='emptyMap border-2 border-black'>
      <Map
        height={height}
        width={width}
        defaultCenter={config.position}
        defaultZoom={config.zoom ?? 6}
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        provider={emptymap}
        attribution={false}
        attributionPrefix={false}
        touchEvents={!isStatic}
        mouseEvents={!isStatic}
      >
        {renderGeoJsonData(backgroundDataList, true, false)}
        {renderGeoJsonData(dataList, false, highlightOnHover)}
      </Map>
    </div>
  );
}

function renderGeoJsonData(
  dataList: GeoJsonData[],
  background: boolean,
  highlightOnHover: boolean
): JSX.Element[] {
  const defaultStyle = {
    strokeWidth: '1',
    r: '10',
  };

  const foregroundStyle = (feature: GeoJsonData, hover: boolean) => {
    return highlightOnHover && hover
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
