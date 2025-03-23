import { generateStaticFeatureParams } from '@/utils';
import { GeodleGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...GeodleGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
