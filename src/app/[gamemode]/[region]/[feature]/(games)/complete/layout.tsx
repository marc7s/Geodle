import { generateStaticFeatureParams } from '@/utils';

// CompleteGame supports capitals and countries
export async function generateStaticParams() {
  return generateStaticFeatureParams('capitals', 'countries');
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
