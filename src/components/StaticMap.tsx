import { Map, Marker } from 'pigeon-maps';
import { MapStyle, stadiamaps } from '@/mapProviders';

interface Props {
  position: [number, number];
  height: number;
  width: number;
  marker?: boolean;
  mapStyle?: MapStyle;
  zoom?: number;
}
export default function StaticMap(props: Props) {
  return (
    <Map
      height={props.height}
      width={props.width}
      defaultCenter={props.position}
      defaultZoom={props.zoom ?? 6}
      provider={stadiamaps(props.mapStyle)}
      mouseEvents={false}
      touchEvents={false}
    >
      {props.marker ? <Marker anchor={props.position}></Marker> : <></>}
    </Map>
  );
}
