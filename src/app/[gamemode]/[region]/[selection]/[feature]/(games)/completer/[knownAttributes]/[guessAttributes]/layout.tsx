import { CompleterGame } from '@/types/games';

// Generate allowed guess values
// Note that not all combinations are allowed,
// since there must be no overlap between guess attributes and known attributes
// However, this is handeled in the page logic instead
export async function generateStaticParams() {
  return [...CompleterGame.guessAttributeCombinations.values()].map((a) => {
    return { guessAttributes: a };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
