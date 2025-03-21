import { generateStaticFeatureParams } from '@/utils';
import { OutlinerGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...OutlinerGame.allowedFeatures);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
