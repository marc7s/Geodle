import { gameRegions } from '@/types/routing/generated/regions';

// Generate all allowed regions
export async function generateStaticParams() {
  return gameRegions.map((gr) => {
    return { region: gr };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
