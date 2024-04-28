import { attributes } from '@/types/routing/dynamicParams';
import { getAllParamCombinations } from '@/utils';

// Generate allowed known values
export async function generateStaticParams() {
  return getAllParamCombinations(attributes.map((a) => a)).map((a) => {
    return { knownAttributes: a };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
