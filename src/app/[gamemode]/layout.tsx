import { gameModes } from '@/types/routing/dynamicParams';

// Since we already know all possible game modes, we disable dynamic params
// This means that any unknown game mode will return a 404
export const dynamicParams = false;

// In combination with disabling dynamic params, we generate all allowed gamemode combinations
export async function generateStaticParams() {
  return gameModes.map((gm) => {
    return { gamemode: gm };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
