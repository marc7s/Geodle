export type MapStyle =
  | 'Default'
  | 'DefaultDark'
  | 'OSM'
  | 'Satellite'
  | 'Outdoors'
  | 'BlackAndWhite'
  | 'Terrain'
  | 'HideAll';

export const stadiamaps =
  (mapStyle: MapStyle = 'Default', apiKey: string | undefined) =>
  (x: number, y: number, z: number, dpr = 1): string => {
    if (apiKey === undefined && process.env.NODE_ENV === 'production')
      throw new Error(
        'Stadia Maps requires an API key. Set it in the environment variables.'
      );
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
      case 'Satellite':
        // Standard or Professional plan
        style = 'alidade_satellite';
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

    // Only use the api key in production, to not spend credits during development
    return `https://tiles.stadiamaps.com/styles/${style}/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.${ext}${process.env.NODE_ENV === 'production' ? '?api_key=' + apiKey : ''}`;
  };
