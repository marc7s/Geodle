import { CompleterGame } from '@/types/games';
import {
  StaticParamsProps,
  toCompleteGameParams,
} from '@/types/routing/dynamicParams';

// Generate allowed guess values
// There must be no overlap between guess attributes and known attributes, so only those combinations are generated
// Note: with `output: export`, every call must generate at least one route, so this cannot be handled in the page
export async function generateStaticParams(props: StaticParamsProps) {
  const knownAttributes: string[] = CompleterGame.decodeAttributes(
    toCompleteGameParams(props).knownAttributes
  );

  return [...CompleterGame.guessAttributeCombinations.entries()]
    .filter(([guess]) => guess.every((g) => !knownAttributes.includes(g)))
    .map(([, a]) => {
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
