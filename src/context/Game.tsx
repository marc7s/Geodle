import CompletedDialog, { DialogAction } from '@/components/ui/CompletedDialog';
import GameBuilderDialog from '@/components/ui/GameBuilderDialog';
import { Game } from '@/types/games';
import { GameParams } from '@/types/routing/dynamicParams';
import React, { createContext, useContext, useState } from 'react';

interface FinishedGameStatusBase {
  succeeded: boolean;
  gaveUp: boolean;
}

export type FinishedGameStatus =
  | FinishedGameStatusSingleWithTries
  | FinishedGameStatusGuessThemAll;

export interface FinishedGameStatusSingleWithTries
  extends FinishedGameStatusBase {
  singleWithTries: boolean; // Discriminator

  correctAnswer: string;
  availableTries: number;
  numberOfTries: number;
}

export interface FinishedGameStatusGuessThemAll extends FinishedGameStatusBase {
  guessThemAll: boolean; // Discriminator

  totalQuestions: number;
  missedAnswers: string[];
}

interface GameStatus {
  timeStarted?: number;
  timeFinished?: number;
  finishedStatus?: FinishedGameStatus;
}

interface GameWithParams {
  game: Game;
  params: GameParams;
}

export interface GameContext {
  init: (gameWithParams: GameWithParams) => void;
  start: () => void;
  finish: (finishStatus: FinishedGameStatus) => void;
  gameStatus: GameStatus;
  gameWithParams?: GameWithParams;
}

const defaultGameUI: GameContext = {
  init: () => {},
  start: () => {},
  finish: () => {},
  gameStatus: {},
};

export function useGameContext() {
  return useContext(DefaultGameContext);
}

const DefaultGameContext = createContext<GameContext>(defaultGameUI);

export default function GameWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<GameStatus>({
    finishedStatus: undefined,
  });

  const [gameWithParams, setGameWithParams] = useState<GameWithParams>();

  function initGame(contextGameWithParams: GameWithParams) {
    if (gameWithParams?.game.linkName === contextGameWithParams.game.linkName)
      return;

    setGameWithParams(contextGameWithParams);
  }

  function startGame() {
    setStatus({ ...status, timeStarted: new Date().getTime() });
  }

  function finishGame(finishStatus: FinishedGameStatus) {
    setStatus({
      ...status,
      timeFinished: new Date().getTime(),
      finishedStatus: finishStatus,
    });
  }

  const completedActions: DialogAction[] = [
    {
      title: 'Go again',
      onClicked: () => location.reload(),
    },
  ];

  function resetGame() {
    setStatus({
      timeStarted: undefined,
      timeFinished: undefined,
      finishedStatus: undefined,
    });
  }

  return (
    <>
      <DefaultGameContext.Provider
        value={{
          init: initGame,
          start: startGame,
          finish: finishGame,
          gameStatus: status,
          gameWithParams: gameWithParams,
        }}
      >
        <div className='absolute top-2 right-2'>
          {gameWithParams && (
            <GameBuilderDialog
              fixedGame={gameWithParams.game}
              gameParams={gameWithParams.params}
            />
          )}
        </div>
        {children}
      </DefaultGameContext.Provider>
      <CompletedDialog
        actions={completedActions}
        finishedStatus={status.finishedStatus}
        timeElapsedMS={
          (status.timeFinished ?? NaN) - (status.timeStarted ?? NaN)
        }
        onClose={resetGame}
        game={gameWithParams?.game}
        params={gameWithParams?.params}
      ></CompletedDialog>
    </>
  );
}
