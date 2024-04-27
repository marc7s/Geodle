import { attributes } from '@/types/routing/dynamicParams';

// Generate allowed known values
export async function generateStaticParams() {
  return attributes.map((a) => {
    return { known: a };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
