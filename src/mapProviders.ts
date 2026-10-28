export type MapStyle =
  | 'Default'
  | 'DefaultDark'
  | 'OSM'
  | 'Outdoors'
  | 'BlackAndWhite'
  | 'Terrain'
  | 'HideAll';

// A transparent 1x1 GIF, so empty maps have valid tiles without loading anything from the network
// An empty string would make the browser request the page itself for every tile
const transparentTile: string =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// A custom offline map provider used in empty maps
export const emptymap = (x: number, y: number, z: number, dpr = 1): string =>
  transparentTile;

export const stadiamaps =
  (mapStyle: MapStyle = 'Default') =>
  (x: number, y: number, z: number, dpr = 1): string => {
    let style: string = 'alidade_smooth';
    switch (mapStyle) {
      case 'Default':
        // Free
        style = 'alidade_smooth';
        break;
      case 'DefaultDark':
        // Free
        style = 'alidade_smooth_dark';
        break;
      case 'OSM':
        style = 'osm_bright';
        break;
      case 'Outdoors':
        // Free
        style = 'outdoors';
        break;
      case 'BlackAndWhite':
        // Free
        style = 'stamen_toner';
        break;
      case 'Terrain':
        // Free
        style = 'stamen_terrain';
        break;
      case 'HideAll':
        // Free
        style = 'stamen_watercolor';
        break;
    }
    const ext: string = [
      'alidade_smooth',
      'alidade_smooth_dark',
      'outdoors',
      'stamen_toner',
      'stamen_terrain',
      'osm_bright',
    ].includes(style)
      ? 'png'
      : 'jpg';

    return `https://tiles.stadiamaps.com/styles/${style}/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.${ext}`;
  };
