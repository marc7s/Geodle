import { generateStaticFeatureParams } from '@/utils';
import { PointGuesserGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...PointGuesserGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
