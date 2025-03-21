'use client';

// Disable SSR for maps, as it will throw errors due to being out of sync otherwise
// See https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr
import dynamic from 'next/dynamic';
const GeoJsonMap = dynamic(() => import('@/components/GeoJsonMap'), {
  ssr: false,
});

import { useEffect, useState } from 'react';
import {
  Feature,
  GameParams,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { GameContext, useGameContext } from '@/context/Game';
import { PatherGame, PuzzleGuesserGame, SeedInfo } from '@/types/games';
import QuestionTask, { Question } from '@/components/QuestionTask';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { countryBorders, handleSeedClientSide, MapConfig } from '@/utils';
import { GeoJsonData, GeoOutlineData } from '@/geoUtils';
import { PatherPiece } from '@/app/[gamemode]/[region]/[selection]/[feature]/(games)/pather/[[...seed]]/page';
import { Country } from '@prisma/client';

interface Props {
  title: string;
  feature: Feature;
  allowedGuesses: number;
  startCountry: Country;
  endCountry: Country;
  oneBestSolution: string[];
  solutionOutlines: GeoOutlineData[];
  possiblePieces: PatherPiece[];
  bestOutlines: GeoOutlineData[];
  backgroundData: GeoJsonData[];
  gameConfig: GameParams;
  mapConfig: MapConfig;
  seedInfo: SeedInfo;
}

export default function Pather({
  title,
  feature,
  allowedGuesses,
  startCountry,
  endCountry,
  oneBestSolution,
  solutionOutlines,
  possiblePieces,
  bestOutlines,
  backgroundData,
  gameConfig,
  mapConfig,
  seedInfo,
}: Props) {
  handleSeedClientSide(
    seedInfo,
    PatherGame,
    gameConfig,
    {},
    (newSeed: number) => PatherGame.getSeededHref(gameConfig, newSeed),
    () => PatherGame.getRandomSeededHref(gameConfig, seedInfo)
  );

  const singularFeature: string = formatSingularFeature(feature);
  const [guesses, setGuesses] = useState<GeoOutlineData[]>([]);

  const question: Question = {
    question: `Guess the name of any missing ${singularFeature} on the path`,
    correctAnswers: possiblePieces.map((p) => p.outline.name),
  };

  const bestOutlineColor: string = 'rgba(20, 150, 20, 0.8)'; // Color for countries part of the shortest path(s)
  const missedOutlineColor: string = 'rgba(20, 20, 20, 0.4)'; // Color for countries not part of the shortest path(s)
  const missedConnectedOutlineColor: string = 'rgba(20, 20, 150, 0.7)'; // Color for countries not part of the shortest path(s), but bordering previous guesses

  const gameContext: GameContext = useGameContext();
  // Initialize the game
  useEffect(() => {
    gameContext.init({ game: PuzzleGuesserGame, params: gameConfig });
  }, [gameContext, gameConfig]);

  function handleQuestionStarted() {
    gameContext.start();
  }

  useEffect(() => {
    const guessedNames: string[] = guesses.map((g) => g.name);
    const guessedCountries: Country[] = possiblePieces
      .filter((p) => guessedNames.includes(p.country.englishShortName))
      .map((p) => p.country);

    if (guessedCountries.length !== guesses.length) {
      console.error('Could not find one or more guessed countries');
      return;
    }

    // For a correct solution, both the start and end country must border one or more guesses
    if (
      guessedCountries.some((c) => countryBorders(c, startCountry)) &&
      guessedCountries.some((c) => countryBorders(c, endCountry))
    ) {
      if (solutionExists(startCountry, endCountry, guessedCountries))
        return finish(false, true);
    }
    if (guesses.length >= allowedGuesses) return finish(false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses]);

  function handleCorrectGuess(_: Question, answer: string) {
    const guess = possiblePieces.find(
      (p) => p.outline.name === answer
    )?.outline;
    if (!guess || guesses.find((g) => g.name === guess.name)) return;
    setGuesses([...guesses, guess]);
  }

  function finish(gaveUp: boolean, success: boolean) {
    gameContext.finish({
      guessThemAll: true,

      succeeded: success,
      gaveUp: gaveUp,
      totalQuestions: guesses.length,
      missedAnswers: success ? [] : oneBestSolution,
    });
  }

  function solutionExists(
    sourceCountry: Country,
    targetCountry: Country,
    intermediateCountries: Country[]
  ): boolean {
    if (countryBorders(sourceCountry, targetCountry)) return true;
    const borderingCountries: Country[] = intermediateCountries.filter((c) =>
      countryBorders(c, sourceCountry)
    );

    for (const newSource of borderingCountries) {
      if (
        solutionExists(
          newSource,
          targetCountry,
          intermediateCountries.filter((c) => c.id !== newSource.id)
        )
      )
        return true;
    }

    return false;
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-2xl mb-5'>{title}</div>
      <GeoJsonMap
        config={mapConfig}
        height={800}
        width={800}
        isStatic={false}
        dataList={[
          ...solutionOutlines.map((s) => {
            return { ...s.outline, color: 'orange' };
          }),
          ...guesses.map((p) => {
            return {
              ...p.outline,
              color: bestOutlines.map((d) => d.name).includes(p.name)
                ? bestOutlineColor
                : possiblePieces
                      .find((pp) => pp.outline.name === p.name)
                      ?.country.bordersISO3.split(',')
                      .some((iso3) => {
                        const borderingName: string | undefined =
                          possiblePieces.find(
                            (bc) => bc.country.iso3Code === iso3
                          )?.outline.name;
                        return (
                          borderingName &&
                          [
                            ...solutionOutlines.map((so) => so.name),
                            ...guesses.map((g) => g.name),
                          ].includes(borderingName)
                        );
                      })
                  ? missedConnectedOutlineColor
                  : missedOutlineColor,
            };
          }),
        ]}
        backgroundDataList={backgroundData}
      />
      <QuestionTask
        question={question}
        onQuestionStarted={handleQuestionStarted}
        onCorrectAnswer={handleCorrectGuess}
        alreadyAnswered={guesses.map((g) => g.name)}
        allowGivingUp={false}
        isReusable={true}
      />
      <div className='mb-4'>{allowedGuesses - guesses.length} guesses left</div>
      {gameContext.gameStatus.timeStarted && (
        <GiveUpDialog onGiveUp={() => finish(true, false)} />
      )}
    </div>
  );
}
