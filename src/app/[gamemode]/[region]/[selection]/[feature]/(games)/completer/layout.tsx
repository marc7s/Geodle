import { CompleterGame } from '@/types/games';
import { generateStaticFeatureParams } from '@/utils';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...CompleterGame.allowedFeatures);
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
