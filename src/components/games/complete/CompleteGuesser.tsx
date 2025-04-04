'use client';

import { Question } from '../../QuestionTask';
import CompleteTask from './CompleteTask';
import { useEffect, useState } from 'react';
import { useGameContext } from '@/context/Game';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { Button } from '@/components/ui/button';
import { CompleteGameParams } from '@/types/routing/dynamicParams';
import { CompleterGame, SeedInfo } from '@/types/games';
import { DailyGameAdditionalConfig, handleSeedClientSide } from '@/utils';

export interface CompleteQuestion {
  knownQuestions: Question[];
  completeQuestions: Question[];
  complete?: boolean;
}

interface Props {
  questions: CompleteQuestion[];
  gameConfig: CompleteGameParams;
  seedInfo: SeedInfo;
  additionalDailyConfig: DailyGameAdditionalConfig;
}

export default function CompleteGuesser({
  questions,
  gameConfig,
  seedInfo,
  additionalDailyConfig,
}: Props) {
  handleSeedClientSide(
    seedInfo,
    CompleterGame,
    { params: gameConfig },
    additionalDailyConfig,
    (newSeed: number) =>
      CompleterGame.getCompleterSeededHref(gameConfig, newSeed),
    () => CompleterGame.getCompleterRandomSeededHref(gameConfig, seedInfo)
  );

  const gameContext = useGameContext();
  useEffect(() => {
    gameContext.init({
      game: CompleterGame,
      params: CompleterGame.convertParams(gameConfig),
    });
  }, [gameContext, gameConfig]);

  const [questionsLeft, setQuestionsLeft] =
    useState<CompleteQuestion[]>(questions);

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (questionsLeft.length < 1) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsLeft]);

  function skipQuestion() {
    // Move the current question to the end
    setQuestionsLeft([...questionsLeft.slice(1), questionsLeft[0]]);
  }

  function onTaskComplete() {
    // Remove the current question from the questionsLeft list
    setQuestionsLeft(questionsLeft.slice(1));
  }

  function finish(gaveUp: boolean) {
    gameContext.finish({
      guessThemAll: true,

      succeeded: true,
      gaveUp: gaveUp,
      totalQuestions: questions.length,
      missedAnswers: questionsLeft
        .filter((cq) => !cq.complete)
        .map((cq) => cq.completeQuestions.filter((q) => !q.correct))
        .map((qs) =>
          qs.map((q) => `${q.question}: ${q.correctAnswers[0]}`).join(' & ')
        ),
    });
  }

  function onTaskStarted() {
    if (!gameContext.gameStatus.timeStarted) gameContext.start();
  }

  return (
    <>
      <div className='flex flex-col justify-center'>
        {questionsLeft[0] && (
          <CompleteTask
            completeQuestion={questionsLeft[0]}
            title='Country'
            onTaskComplete={onTaskComplete}
            onTaskStarted={onTaskStarted}
          />
        )}

        <div className='py-2 text-center text-sm text-muted-foreground my-1'>
          {questionsLeft.length} questions left
        </div>

        <div className='flex flex-col items-center'>
          <Button onClick={skipQuestion} className='mb-10' variant={'outline'}>
            Skip
          </Button>
          <GiveUpDialog onGiveUp={() => finish(true)} />
        </div>
      </div>
    </>
  );
}
