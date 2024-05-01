'use client';

import GameWrapper from '@/context/Game';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GameWrapper>{children}</GameWrapper>
    </>
  );
}
