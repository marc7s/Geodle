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
import { OutlinerGame } from '@/types/games';
import QuestionTask, { Question } from '@/components/QuestionTask';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { getSolution } from '@/utils';
import { useSeed } from '@/components/useSeed';
import { GeoOutlineData } from '@/geoUtils';
import { onlyLoaded, useGeoJson } from '@/components/useGeoJson';

interface Props {
  title: string;
  feature: Feature;
  allowedGuesses: number;
  possibleSolutions: GeoOutlineData[];
  gameConfig: GameParams;
}

// Picks the solution from the possible solutions, based on the seed
export default function Outliner(props: Props) {
  const seed: number | undefined = useSeed(
    OutlinerGame,
    props.gameConfig,
    props.possibleSolutions.length
  );
  if (seed === undefined) return <></>;

  const answer: GeoOutlineData = getSolution(
    [...props.possibleSolutions],
    seed
  )!;
  return (
    <OutlinerGameBoard
      key={seed}
      {...props}
      answer={answer}
      possibleAnswers={props.possibleSolutions.map((s) => s.name)}
    />
  );
}

function OutlinerGameBoard({
  title,
  feature,
  allowedGuesses,
  answer,
  possibleAnswers,
  gameConfig,
}: Props & { answer: GeoOutlineData; possibleAnswers: string[] }) {
  const mapConfig = {
    position: answer.center,
    zoom: answer.zoomLevelToFit,
  };

  const singularFeature: string = formatSingularFeature(feature);
  const [guesses, setGuesses] = useState<string[]>([]);
  const answerOutline = onlyLoaded(useGeoJson([answer.outline]));

  const question: Question = {
    question: `Guess the ${singularFeature} based on its outline`,
    correctAnswers: answer.answers,
  };

  const gameContext: GameContext = useGameContext();
  // Initialize the game
  useEffect(() => {
    gameContext.init({ game: OutlinerGame, params: gameConfig });
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
        dataList={answerOutline}
        backgroundDataList={[]}
        highlightOnHover={false}
      />
      <QuestionTask
        question={question}
        onQuestionStarted={handleQuestionStarted}
        onCorrectAnswer={handleCorrectGuess}
        onIncorrectAnswer={handleIncorrectGuess}
        alreadyAnswered={guesses}
        possibleAnswers={possibleAnswers}
        allowGivingUp={false}
        isReusable={true}
        disabled={gameContext.isFinished}
      />
      <div className='mb-4'>{allowedGuesses - guesses.length} guesses left</div>
      <GiveUpDialog
        gameContext={gameContext}
        onGiveUp={() => finish(false, true)}
      />
    </div>
  );
}
