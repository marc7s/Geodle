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
import { PuzzleGuesserGame } from '@/types/games';
import QuestionTask, { Question } from '@/components/QuestionTask';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { MapConfig } from '@/utils';
import { GeoOutlineData } from '@/geoUtils';

interface Props {
  title: string;
  feature: Feature;
  allowedGuesses: number;
  answer: GeoOutlineData;
  possibleAnswers: string[];
  gameConfig: GameParams;
  mapConfig: MapConfig;
}

export default function Outliner({
  title,
  feature,
  allowedGuesses,
  answer,
  possibleAnswers,
  gameConfig,
  mapConfig,
}: Props) {
  const singularFeature: string = formatSingularFeature(feature);
  const [guesses, setGuesses] = useState<string[]>([]);

  const question: Question = {
    question: `Guess the ${singularFeature} based on its outline`,
    correctAnswers: answer.answers,
  };

  const gameContext: GameContext = useGameContext();
  // Initialize the game
  useEffect(() => {
    gameContext.init({ game: PuzzleGuesserGame, params: gameConfig });
  }, [gameContext, gameConfig]);

  function handleQuestionStarted() {
    gameContext.start();
  }

  function handleCorrectGuess(_: Question, answer: string) {
    finish(true, false);
  }

  function handleIncorrectGuess(
    _: Question,
    correctAnswer: string | undefined
  ) {
    if (correctAnswer === undefined) return;
    setGuesses([...guesses, correctAnswer]);
  }

  // Check whether the user has run out of guesses
  useEffect(() => {
    if (guesses.length < allowedGuesses) return;
    finish(false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses]);

  function finish(succeded: boolean, gaveUp: boolean) {
    // If we got it correct, we need to add that guess as a try
    const tries = guesses.length + (succeded ? 1 : 0);
    gameContext.finish({
      singleWithTries: true,

      correctAnswer: answer.answers[0],
      succeeded: !gaveUp && succeded,
      gaveUp: gaveUp,
      availableTries: allowedGuesses,
      numberOfTries: tries,
    });
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-2xl mb-5'>{title}</div>
      <GeoJsonMap
        config={mapConfig}
        height={800}
        width={800}
        isStatic={true}
        dataList={[answer.outline]}
        backgroundDataList={[]}
        highlightOnHover={false}
      />
      <QuestionTask
        question={question}
        onQuestionStarted={handleQuestionStarted}
        onCorrectAnswer={handleCorrectGuess}
        onIncorrectAnswer={handleIncorrectGuess}
        possibleAnswers={possibleAnswers}
        allowGivingUp={false}
        isReusable={true}
      />
      <div className='mb-4'>{allowedGuesses - guesses.length} guesses left</div>
      {gameContext.gameStatus.timeStarted && (
        <GiveUpDialog onGiveUp={() => finish(false, true)} />
      )}
    </div>
  );
}
