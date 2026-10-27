'use client';

// Disable SSR for maps, as it will throw errors due to being out of sync otherwise
// See https://nextjs.org/docs/app/guides/lazy-loading#skipping-ssr
// This has to be done in a client component, since server components cannot disable SSR
import dynamic from 'next/dynamic';

const MapPointGuesser = dynamic(() => import('@/components/MapPointGuesser'), {
  ssr: false,
});

export default MapPointGuesser;
