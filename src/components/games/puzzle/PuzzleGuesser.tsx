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
import {
  GeoJsonData,
  PuzzlePiece,
} from '@/app/[gamemode]/[region]/[selection]/[feature]/(games)/puzzle/page';
import QuestionTask, { Question } from '@/components/QuestionTask';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { MapConfig } from '@/utils';

interface Props {
  title: string;
  feature: Feature;
  puzzlePieces: PuzzlePiece[];
  backgroundData: GeoJsonData[];
  gameConfig: GameParams;
  mapConfig: MapConfig;
}

export default function PuzzleGuesser({
  title,
  feature,
  puzzlePieces,
  backgroundData,
  gameConfig,
  mapConfig,
}: Props) {
  const singularFeature: string = formatSingularFeature(feature);
  const [pieces, setPieces] = useState<PuzzlePiece[]>(puzzlePieces);

  const question: Question = {
    question: `Guess the name of any missing ${singularFeature}`,
    answers: pieces.map((p) => p.name),
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
    setPieces(
      pieces.map((p) => (p.name === answer ? { ...p, guessed: true } : p))
    );
  }

  function finish(gaveUp: boolean) {
    gameContext.finish({
      guessThemAll: true,

      gaveUp: gaveUp,
      totalQuestions: pieces.length,
      missedAnswers: pieces.filter((p) => !p.guessed).map((p) => p.name),
    });
  }

  // Check whether all pieces have been guessed
  useEffect(() => {
    if (pieces.every((p) => p.guessed)) finish(false);
  }, [pieces]);

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-2xl mb-5'>{title}</div>
      <GeoJsonMap
        config={mapConfig}
        height={800}
        width={800}
        dataList={pieces.filter((p) => p.guessed).map((p) => p.outline)}
        backgroundDataList={backgroundData}
      />
      <QuestionTask
        question={question}
        onQuestionStarted={handleQuestionStarted}
        onCorrectAnswer={handleCorrectGuess}
        allowGivingUp={false}
        isReusable={true}
      />
      <div className='mb-4'>{pieces.filter((p) => !p.guessed).length} left</div>
      {gameContext.gameStatus.timeStarted && (
        <GiveUpDialog onGiveUp={() => finish(true)} />
      )}
    </div>
  );
}
