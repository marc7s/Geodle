'use client';

import { useEffect, useState } from 'react';
import { GeoJsonData, GeoJsonSource } from '@/geoUtils';

// Loaded files are shared between all components, and kept for the lifetime of the page
const loadedData: Map<string, GeoJsonData> = new Map();
const pendingData: Map<string, Promise<GeoJsonData>> = new Map();

function loadGeoJson(url: string): Promise<GeoJsonData> {
  let pending: Promise<GeoJsonData> | undefined = pendingData.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${url}: ${res.status}`);
        return res.json();
      })
      .then((data: GeoJsonData) => {
        loadedData.set(url, data);
        return data;
      })
      .finally(() => pendingData.delete(url));
    pendingData.set(url, pending);
  }
  return pending;
}

/**
 * Resolves GeoJSON sources to their data, loading file sources from the server when needed.
 * Returns the data in the same order as the sources, with `undefined` for data that is still loading
 */
export function useGeoJson(
  sources: GeoJsonSource[]
): (GeoJsonData | undefined)[] {
  const [, setLoadedCount] = useState<number>(0);

  const urls: string[] = sources.flatMap((s) => ('url' in s ? [s.url] : []));
  const urlsKey: string = urls.join('|');

  useEffect(() => {
    let active: boolean = true;
    urls
      .filter((url) => !loadedData.has(url))
      .forEach((url) =>
        loadGeoJson(url)
          .then(() => active && setLoadedCount((c) => c + 1))
          .catch(console.error)
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsKey]);

  return sources.map((s) => ('data' in s ? s.data : loadedData.get(s.url)));
}

export function onlyLoaded<T>(data: (T | undefined)[]): T[] {
  return data.filter((d): d is T => d !== undefined);
}
