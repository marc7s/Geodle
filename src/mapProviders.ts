export type MapStyle =
  | 'Default'
  | 'DefaultDark'
  | 'OSM'
  | 'Outdoors'
  | 'BlackAndWhite'
  | 'Terrain'
  | 'HideAll';

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
