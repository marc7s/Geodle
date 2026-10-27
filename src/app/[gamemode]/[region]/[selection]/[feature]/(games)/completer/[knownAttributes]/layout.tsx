import { CompleterGame } from '@/types/games';

// Generate allowed known values
// Combinations with every attribute are skipped, since there would be nothing left to guess
export async function generateStaticParams() {
  return [...CompleterGame.knownAttributeCombinations.entries()]
    .filter(([known]) =>
      CompleterGame.allowedGuessAttributes.some((a) => !known.includes(a))
    )
    .map(([, a]) => {
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
