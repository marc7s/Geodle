import { getCountriesDB } from '@/db';
import { createConsoleProgressBar } from '@/backendUtils';
import prisma from '@/db';
import {
  CountrySelection,
  countrySelections,
} from '@/types/routing/dynamicParams';
import { GameRegion, gameRegions } from '@/types/routing/generated/regions';
import { Country } from '@prisma/client';
import { Graph } from 'graph-data-structure';
import { getRegionSolutionLimits } from '@/optimizations';

export interface CountryPathSolution {
  c1: string;
  c2: string;
  paths: string[][];
}

interface SolutionGroup {
  selection: CountrySelection;
  region: GameRegion;
  solutions: CountryPathSolution[];
}

type PairID = string;

function getPairID(country1: Country, country2: Country): PairID {
  const isoCodes = [country1.iso3Code, country2.iso3Code].sort();
  return isoCodes.join('-');
}

async function generateSolutions(
  selection: CountrySelection,
  region: GameRegion,
  minCountriesBetween: number,
  maxCountriesBetween: number
): Promise<CountryPathSolution[]> {
  const countries: Country[] = await getCountriesDB(selection, region);
  const solutionProgress = createConsoleProgressBar(
    `Generating solutions for ${selection} countries in ${region}`
  );

  // The total number of solutions is the number of combinations (n choose k) since order does not matter
  // However, for k = 2, this is equivalent to n(n-1)/2
  solutionProgress.start(
    (countries.length * (countries.length - 1)) / 2 + 1,
    1
  );

  const graph = Graph();
  // Filled in once the graph is built, for fast lookups
  let graphNodes: Set<string> = new Set();
  const solutions: Map<PairID, CountryPathSolution> = new Map();

  function generateSolution(start: Country, end: Country): void {
    solutionProgress.increment();
    // Ensure both countries are part of the graph, otherwise at least one of them borders no countries and a solution is therefore impossible
    if (!graphNodes.has(start.iso3Code) || !graphNodes.has(end.iso3Code))
      return;

    const pairID: PairID = getPairID(start, end);

    // We only need to generate the solutions for the pairs, as we can reverse the path later to get from B -> A instead of A -> B
    if (solutions.has(pairID)) return;

    let shortestPaths: string[][] = [];
    try {
      shortestPaths = graph
        .shortestPaths(end.iso3Code, start.iso3Code) // The returned paths are reversed, so search from end to start instead
        .map((path) => path.filter((p) => typeof p === 'string'));
    } catch (err: any) {
      // There are many cases where it is not possible to find a path between two countries
      // This throws an error, but we can safely ignore it and discard this solution attempt
      if (err.message === 'No path found') return;

      // Otherwise, we should throw the error as it is unexpected
      throw err;
    }

    // Note: all paths will be of the same lengths, as they are the shortest paths
    // If the shortest path is shorter than the minimum path length, we discard this solution
    if (
      shortestPaths.some(
        (path) =>
          path.length - 2 < minCountriesBetween ||
          path.length - 2 > maxCountriesBetween
      )
    )
      return;

    const solution: CountryPathSolution = {
      c1: start.iso3Code,
      c2: end.iso3Code,
      paths: shortestPaths,
    };

    solutions.set(pairID, solution);
  }

  // Only allow countries part of the selection
  // Otherwise, solutions would be generated that pass through countries outside the selection
  const validIso3Codes = countries.map((c) => c.iso3Code);

  countries.forEach((country) => {
    // Get a list of all countries bordering the current one
    const borderingCountries = country.bordersISO3
      .split(',')
      .filter((b) => b.length > 0) // Remove countries with no bordering countries
      .filter((b) => validIso3Codes.includes(b)); // Remove bordering countries outside the selection

    // Check if the country has any bordering countries
    if (borderingCountries.length < 1) return;

    // Add edges to the graph for each bordering country
    borderingCountries.forEach((border) =>
      graph.addEdge(country.iso3Code, border)
    );
  });

  graphNodes = new Set(graph.nodes());

  // Generate solutions for all country pairs. Impossible solutions will be discarded
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++)
      generateSolution(countries[i], countries[j]);
  }

  solutionProgress.stop();

  return Array.from(solutions.values());
}

async function main() {
  const solutionGroups: SolutionGroup[] = [];

  for (const selection of countrySelections) {
    for (const region of gameRegions) {
      const [minCountriesBetween, maxCountriesBetween] =
        getRegionSolutionLimits(region);
      const solutions = await generateSolutions(
        selection,
        region,
        minCountriesBetween,
        maxCountriesBetween
      );
      solutionGroups.push({
        selection: selection,
        region: region,
        solutions: solutions,
      });
      console.log(`${solutions.length} solutions generated\n`);
    }
  }

  // Remove all existing paths
  await prisma.countryPaths.deleteMany();

  // Insert paths
  const pathProgress = createConsoleProgressBar('Inserting paths');
  pathProgress.start(
    solutionGroups
      .map((sg) => sg.solutions.length)
      .reduce((acc, l) => acc + l) + 1,
    1
  );

  for (const solutionGroup of solutionGroups) {
    await prisma.countryPaths.createMany({
      data: solutionGroup.solutions.map((solution) => ({
        selection: solutionGroup.selection,
        region: solutionGroup.region,
        country1ISO3: solution.c1,
        country2ISO3: solution.c2,
        path: solution.paths.map((path) => path.join(',')).join(';'),
      })),
    });
    pathProgress.increment(solutionGroup.solutions.length);
  }
  pathProgress.stop();
}

main().finally(() => prisma.$disconnect());
