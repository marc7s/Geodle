import { CompleterGame } from '@/types/games';

// Generate allowed known values
export async function generateStaticParams() {
  return [...CompleterGame.knownAttributeCombinations.values()].map((a) => {
    return { knownAttributes: a };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
