import prisma from '@/db';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const regionNames: string[] = [
    'World',
    ...(await prisma.region.findMany()).map((r) => r.name),
  ];

  const outFolder: string = 'src/types/routing/generated';
  const outPath: string = join(outFolder, 'regions.ts');

  mkdirSync(outFolder, { recursive: true });
  writeFileSync(
    outPath,
    `// Define a custom type for the possible GameRegions
export const gameRegions = [${regionNames.map((r) => `'${r}'`).join(', ')}] as const;
export type GameRegion = (typeof gameRegions)[number];
    `,
    { flag: 'w' }
  );
}

main();
