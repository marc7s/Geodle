import { Presets, SingleBar } from 'cli-progress';

export function createConsoleProgressBar(title: string) {
  return new SingleBar(
    {
      format: `${title} [{bar}] {percentage}% | {value}/{total} | Elapsed: {duration_formatted} | ETA: {eta_formatted}`,
    },
    Presets.shades_classic
  );
}

export function prismaEncodeStringList(str: string[]): string {
  // There is a limit to the string length, so we only encode the first N elements, so that the total size is below a threshold
  return str.reduce((acc, curr) => (acc.length > 500 ? acc : acc + curr), '');
}
