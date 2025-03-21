import { generateStaticFeatureParams } from '@/utils';
import { PuzzleGuesserGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...PuzzleGuesserGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
