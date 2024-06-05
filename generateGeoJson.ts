import { GameRegion } from '@/types/routing/generated/regions';
import { ExecException, exec } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const dataBasePath: string = join(
  process.cwd(),
  'node_modules/geojson-places/data'
);

// Source directories
const continentsDir: string = join(dataBasePath, 'continents');
const countriesDir: string = join(dataBasePath, 'countries');

// Output directories
const outputDir: string = join(process.cwd(), 'src/data/generated/geo');
const countriesOutputDir: string = join(outputDir, 'countries');
const regionsOutputDir: string = join(outputDir, 'regions');

// North and South America need to be combined into a single file
const northSouthAmericaPaths: string[] = ['NA.json', 'SA.json'];
const availableContinentPaths: string[] = readdirSync(continentsDir)
  .filter((f) => f.match(/[A-Z]{2}\.json/))
  .filter((f) => f !== 'AN.json') // Remove Antarctica
  .filter((p) => !northSouthAmericaPaths.includes(p)); // Remove combined continent

const availableCountryPaths: string[] = readdirSync(countriesDir).filter((f) =>
  f.match(/[A-Z]{2}\.json/)
);

function continentFileToRegion(continent: string): GameRegion {
  switch (continent) {
    case 'AF.json':
      return 'Africa';
    case 'AS.json':
      return 'Asia';
    case 'EU.json':
      return 'Europe';
    case 'OC.json':
      return 'Oceania';
    case 'AN.json':
      throw new Error(`Antarctica is not a region`);
    case 'NA.json':
    case 'SA.json':
      throw new Error(`NA and SA are continents that need to be combined`);
    default:
      throw new Error(`Unknown continent: ${continent}`);
  }
}

// Runs a Mapshaper command and returns the output as a promise
function runMapshaper(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(
      `mapshaper ${command}`,
      (
        error: ExecException | null,
        stdout: string,
        mapshaperStatus: string
      ) => {
        if (error) {
          console.error(error);
          throw error;
        }

        if (stdout.length > 0) console.log(stdout);
        if (mapshaperStatus.length > 0) console.info(mapshaperStatus);

        resolve(stdout);
      }
    );
  });
}

// Combines several files into one
function combine(paths: string[], outputPath: string): Promise<string> {
  return runMapshaper(
    `-i ${paths.join(' ')} combine-files -merge-layers -o precision=0.001 bbox ${outputPath}`
  );
}

// Copies a file to a new location, using Mapshaper to reformat it correctly
function copy(path: string, outputPath: string): Promise<string> {
  return runMapshaper(
    `${path} -o precision=0.001 bbox format=geojson geojson-type=FeatureCollection ${outputPath}`
  );
}

// Reduces the size of a GeoJSON file
function simplify(path: string, outputPath: string): Promise<string> {
  const [targetWidth, targetHeight]: [number, number] = [800, 600];
  const targetMaxZoom: number = 2;
  const resolution: string = `${targetWidth * targetMaxZoom}x${targetHeight * targetMaxZoom}`;
  return runMapshaper(
    `${path} -simplify visvalingam weighted weighting=0.7 resolution=${resolution} -o precision=0.001 format=geojson combine-layers geojson-type=FeatureCollection ${outputPath}`
  );
}

function beginSection(section: string) {
  const width: number = process.stdout.columns || 80;
  const padding: string = '-'.repeat(
    Math.floor((width - section.length - 2) / 2)
  );
  console.info(`\n\n${padding} ${section} ${padding}\n`);
}

async function main() {
  beginSection('Combining files');
  // Combines North and South America into a single Americas file
  await combine(
    northSouthAmericaPaths.map((f) => join(continentsDir, f)),
    join(outputDir, 'regions', 'Americas.json')
  );

  beginSection('Copy files');
  // Copies the remaining regions
  await Promise.all(
    availableContinentPaths.map((f) =>
      copy(
        join(continentsDir, f),
        join(regionsOutputDir, `${continentFileToRegion(f)}.json`)
      )
    )
  );

  // Copies all countries
  await Promise.all(
    availableCountryPaths.map((f) =>
      copy(join(countriesDir, f), join(countriesOutputDir, f))
    )
  );

  beginSection('Minimizing files');
  // Minimizes all regions
  const regionPaths: string[] = readdirSync(regionsOutputDir).filter((f) =>
    f.match(/^\w+\.json/)
  );
  await Promise.all(
    regionPaths.map((f) =>
      simplify(
        join(regionsOutputDir, f),
        join(regionsOutputDir, f.replace('.json', '.min.json'))
      )
    )
  );

  // Minimizes all countries
  const countryPaths: string[] = readdirSync(countriesOutputDir).filter((f) =>
    f.match(/[A-Z]{2}\.json/)
  );

  await Promise.all(
    countryPaths.map((f) =>
      simplify(
        join(countriesOutputDir, f),
        join(countriesOutputDir, f.replace('.json', '.min.json'))
      )
    )
  );
}

main();
