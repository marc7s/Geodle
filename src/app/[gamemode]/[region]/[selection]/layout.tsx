import { countrySelections } from '@/types/routing/dynamicParams';

// Generate all allowed country selections
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
