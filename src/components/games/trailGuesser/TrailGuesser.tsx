'use client';

import { useEffect, useState } from 'react';
import { FaLongArrowAltUp } from 'react-icons/fa';
import { GeoPoint, GeoVector2, getVectorBetweenCoordinates } from '@/geoUtils';
import { getFormattedDistance } from '@/format';
import SelectQuestionTask, {
  SelectQuestionOption,
} from '@/components/SelectQuestionTask';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Feature,
  GameParams,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { GameContext, useGameContext } from '@/context/Game';
import { TrailGuesserGame } from '@/types/games';

export interface TrailFeature {
  point: GeoPoint;
  displayValue: string;
  selectValue: string;
}

interface FeatureGuess {
  guessedFeature: TrailFeature;
  vectorToCorrect: GeoVector2;
}

interface Props {
  title: string;
  feature: Feature;
  allowedGuesses: number;
  dropdownFeatures: TrailFeature[];
  correctFeature: TrailFeature;
  gameConfig: GameParams;
}

export default function TrailGuesser({
  title,
  feature,
  allowedGuesses,
  dropdownFeatures,
  correctFeature,
  gameConfig,
}: Props) {
  const [guesses, setGuesses] = useState<FeatureGuess[]>([]);
  const singularFeature: string = formatSingularFeature(feature);

  const gameContext: GameContext = useGameContext();
  // Initialize the game
  useEffect(() => {
    gameContext.init({ game: TrailGuesserGame, params: gameConfig });
  }, [gameContext, gameConfig]);

  // Clear the guesses whenever the correct country changes
  useEffect(() => {
    setGuesses([]);
  }, [correctFeature]);

  function addGuess(featureGuess: FeatureGuess) {
    if (guesses.length === 0) gameContext.start();
    setGuesses([...guesses, featureGuess]);
  }

  function handleCorrectGuess() {
    addGuess({
      guessedFeature: correctFeature,
      vectorToCorrect: {
        origin: correctFeature.point,
        distance: 0,
        bearingDeg: 0,
      },
    });

    gameContext.finish({
      singleWithTries: true,

      gaveUp: false,
      availableTries: allowedGuesses,
      numberOfTries: guesses.length,
    });
  }

  function handleIncorrectGuess(guess: SelectQuestionOption) {
    const guessedFeature: TrailFeature | undefined = dropdownFeatures.find(
      (e) => e.selectValue === guess.value
    );
    if (!guessedFeature) return;

    const featureGuess: FeatureGuess = {
      guessedFeature: guessedFeature,
      vectorToCorrect: getVectorBetweenCoordinates(
        guessedFeature.point,
        correctFeature.point
      ),
    };
    addGuess(featureGuess);
  }

  function getGuessRow(guess: FeatureGuess | undefined) {
    return (
      <>
        <TableCell>{guess ? guess.guessedFeature.displayValue : ''}</TableCell>
        <TableCell>
          {guess ? getFormattedDistance(guess.vectorToCorrect.distance) : ''}
        </TableCell>
        <TableCell>
          {guess ? (
            <FaLongArrowAltUp
              size={30}
              style={{
                transform: `rotate(${guess.vectorToCorrect.bearingDeg}deg)`,
              }}
            />
          ) : (
            ''
          )}
        </TableCell>
      </>
    );
  }

  function getFeatureGuessList(allowedGuesses: number) {
    // Generate an array of indices for all possible guess slots
    const possibleGuessIndices: number[] = Array.from(
      Array(allowedGuesses).keys()
    );
    const guessList: JSX.Element[] = possibleGuessIndices.map((i) => {
      const guess: FeatureGuess | undefined = guesses.at(i);
      const isCorrect: boolean = guess?.guessedFeature === correctFeature;
      return (
        <TableRow key={i} className={isCorrect ? 'bg-green-700' : ''}>
          {isCorrect ? (
            <TableCell colSpan={3} className='text-center'>
              {guess?.guessedFeature.displayValue}
            </TableCell>
          ) : (
            getGuessRow(guess)
          )}
        </TableRow>
      );
    });
    return (
      <div className='max-w-lg mb-10'>
        <Table>
          <TableCaption>
            {guesses.length}/{allowedGuesses} guesses used
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center capitalize'>
                {singularFeature}
              </TableHead>
              <TableHead className='text-center'>Distance</TableHead>
              <TableHead className='text-center'>Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='text-lg'>{guessList}</TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-2xl mb-5'>{title}</div>
      {getFeatureGuessList(allowedGuesses)}
      <div className='mb-2'>Enter your guess</div>
      <div>
        <SelectQuestionTask
          options={dropdownFeatures.map((e) => {
            return { value: e.selectValue, label: e.displayValue };
          })}
          dropdownPlaceholder={`Select ${singularFeature}...`}
          searchPlaceholder={`Search ${feature}...`}
          correctValue={correctFeature.selectValue}
          onQuestionStarted={() => {}}
          onCorrectAnswer={handleCorrectGuess}
          onIncorrectAnswer={handleIncorrectGuess}
        ></SelectQuestionTask>
      </div>
    </div>
  );
}
