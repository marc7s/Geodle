import { generateStaticFeatureParams } from '@/utils';
import { PatherGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...PatherGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
