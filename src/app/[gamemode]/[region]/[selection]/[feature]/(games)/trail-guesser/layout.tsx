import { generateStaticFeatureParams } from '@/utils';
import { TrailGuesserGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...TrailGuesserGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
