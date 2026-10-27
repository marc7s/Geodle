import { Presets, SingleBar } from 'cli-progress';
import unidecode from 'unidecode';

export function createConsoleProgressBar(title: string) {
  return new SingleBar(
    {
      format: `${title} [{bar}] {percentage}% | {value}/{total} | Elapsed: {duration_formatted} | ETA: {eta_formatted}`,
    },
    Presets.shades_classic
  );
}

// Encodes a list of strings as a single ;-separated string. Decoded by `prismaDecodeStringList`
export function prismaEncodeStringList(str: string[]): string {
  return str
    .map((s) => s.replaceAll(';', '').trim())
    .filter((s) => s.length > 0)
    .join(';');
}

function normalizeName(name: string): string {
  return unidecode(name).toLocaleLowerCase().trim();
}

/**
 * Keeps the alternative names that make sense as answers.
 * Answers are checked on every keystroke, so names that are too short, or the start of the name itself,
 * would be accepted before the player has finished typing. Only Latin script names are kept, since the game is in English and names are matched without diacritics
 */
export function cleanAliases(name: string, aliases: string[]): string[] {
  const normalizedName: string = normalizeName(name);
  const seen: Set<string> = new Set([normalizedName]);

  return (
    aliases
      .map((a) => a.trim())
      // Latin script, starting with a capital letter. Lowercase names are mostly machine transliterations, e.g. "jin si dui"
      .filter((a) => /^\p{Lu}[\p{Script=Latin}\p{M}\s'’.-]*$/u.test(a))
      .filter((a) => {
        const normalized: string = normalizeName(a);
        if (normalized.length < 4) return false; // Codes and abbreviations, e.g. STO
        if (normalizedName.startsWith(normalized)) return false;
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
  );
}
