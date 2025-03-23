'use client';
import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import countries from '@/data/globe.json' with { type: 'json' };
import { Position } from './ui/globe';

const World = dynamic(() => import('./ui/globe').then((m) => m.World), {
  ssr: false,
});

interface CountryPosition {
  iso2: string;
  avgLat: number;
  avgLong: number;
}

const countryPositions: CountryPosition[] = countries.features.map((f) => {
  const coords = f.geometry.coordinates[0][0];
  return {
    iso2: f.id,
    avgLat: coords.reduce((acc, curr) => acc + curr[1], 0) / coords.length,
    avgLong: coords.reduce((acc, curr) => acc + curr[0], 0) / coords.length,
  };
});

const colors = ['#0d5f78', '#3aa8c9', '#1e5170', '#214e8a'];
const sampleArcs: Position[] = [];
for (let i = 0, arcIndex = 1; i < countryPositions.length - 2; i++) {
  if (i % 20 === 0 && i > 0) {
    arcIndex++;
  }
  sampleArcs.push({
    order: arcIndex,
    startLat: countryPositions[i].avgLat,
    startLng: countryPositions[i].avgLong,
    endLat: countryPositions[i + 1].avgLat,
    endLng: countryPositions[i + 1].avgLong,
    arcAlt: Math.random() * 0.4 + 0.05,
    color: colors[i % colors.length],
  });
}

export function RotatingGlobe() {
  const globeConfig = {
    pointSize: 4,
    globeColor: '#c2a778',
    showAtmosphere: true,
    atmosphereColor: 'rgba(255, 255, 255, 0.5)',
    atmosphereAltitude: 0.2,
    emissive: '#c2a778',
    emissiveIntensity: 0.2,
    shininess: 0.9,
    polygonColor: 'black',
    ambientLight: '#38bdf8',
    directionalLeftLight: '#ffffff',
    directionalTopLight: '#ffffff',
    pointLight: '#ffffff',
    arcTime: 1200,
    arcLength: 0.9,
    rings: 2,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.3,
  };

  return (
    <div className='flex flex-row items-center justify-center py-10 h-screen md:h-auto relative w-full z-0'>
      <div className='max-w-7xl mx-auto w-full relative overflow-visible h-full md:h-[40rem] px-4'>
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className='div'
        ></motion.div>
        <div className='absolute w-full top-20 h-72 md:h-full z-10'>
          <World data={sampleArcs} globeConfig={globeConfig} />
        </div>
      </div>
    </div>
  );
}
