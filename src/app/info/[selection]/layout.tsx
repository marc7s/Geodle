import { countrySelections } from '@/types/routing/dynamicParams';

// The country selection decides which countries and capitals are listed
export const dynamicParams = false;

export async function generateStaticParams() {
  return countrySelections.map((s) => {
    return { selection: s };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
