import { attributes } from '@/types/routing/dynamicParams';

// Generate allowed guess values
export async function generateStaticParams() {
  return attributes.map((a) => {
    return { guess: a };
  });
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
