'use client';

import { RotatingGlobe } from '@/components/RotatingGlobe';

export default function Home() {
  return (
    <main>
      <div className='flex flex-col justify-center items-center'>
        <h1 className='text-3xl mb-6'>Geodle</h1>
        <p>Challenge yourself in geography</p>
        <RotatingGlobe />
      </div>
    </main>
  );
}
