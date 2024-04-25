'use client';

import { MapConfig } from '@/utils';
import { Map, Marker, Point } from 'pigeon-maps';

export interface PointInfo {
  position: Point;
}

interface Props {
  points: PointInfo[];
  config: MapConfig;
  markerWidth?: number;
}

export default function MapPointGuesser(props: Props) {
  return (
    <>
      <div>
        <Map
          height={700}
          width={700}
          defaultCenter={props.config.position}
          defaultZoom={props.config.zoom}
          maxZoom={30}
        >
          {props.points.map((pi, i) => (
            <Marker
              key={i}
              width={props.markerWidth}
              anchor={pi.position}
            ></Marker>
          ))}
        </Map>
      </div>
    </>
  );
}
