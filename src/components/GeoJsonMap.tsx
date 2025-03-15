'use client';

import { GeoJson, Map } from 'pigeon-maps';
import { emptymap } from '@/mapProviders';
import { MapConfig } from '@/utils';
import { GeoJsonData } from '@/geoUtils';

type DataListStyle = 'Background' | 'Foreground' | 'Secondary';
interface GeoJsonDataWithColor extends GeoJsonData {
  color?: string;
}

interface Props {
  config: MapConfig;
  height: number;
  width: number;
  isStatic: boolean;
  backgroundDataList: GeoJsonData[];
  dataList: GeoJsonDataWithColor[];
  highlightOnHover?: boolean;
}

export default function GeoJsonMap({
  config,
  height,
  width,
  isStatic,
  backgroundDataList,
  dataList,
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
        {renderGeoJsonData(backgroundDataList, 'Background', false)}
        {renderGeoJsonData(dataList, 'Foreground', highlightOnHover)}
      </Map>
    </div>
  );
}

function renderGeoJsonData(
  dataList: GeoJsonDataWithColor[],
  style: DataListStyle,
  highlightOnHover: boolean
): JSX.Element[] {
  const defaultStyle = {
    strokeWidth: '1',
    r: '10',
  };

  const foregroundFillColor: string =
    style === 'Foreground' ? '#154354' : 'rgba(20, 150, 20, 0.8)';
  const foregroundHoverColor: string = 'white';

  const foregroundStyle = (
    feature: GeoJsonData,
    hover: boolean,
    color?: string
  ) => {
    return highlightOnHover && hover
      ? {
          ...defaultStyle,
          fill: foregroundHoverColor,
          stroke: 'black',
        }
      : {
          ...defaultStyle,
          fill: color ?? foregroundFillColor,
          stroke: 'white',
        };
  };

  const backgroundStyle = (
    feature: GeoJsonData,
    hover: boolean,
    color?: string
  ) => {
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
      styleCallback={(feature: GeoJsonData, hover: boolean) => {
        return style === 'Background'
          ? backgroundStyle(feature, hover, geoData.color)
          : foregroundStyle(feature, hover, geoData.color);
      }}
    />
  ));
}
