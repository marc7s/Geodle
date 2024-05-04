import { gameModes } from '@/types/routing/dynamicParams';

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
