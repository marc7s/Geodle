import CompletedDialog, { DialogAction } from '@/components/ui/CompletedDialog';
import React, { createContext, useContext, useState } from 'react';

interface FinishedGameStatusBase {
  gaveUp: boolean;
}

export type FinishedGameStatus =
  | FinishedGameStatusSingleWithTries
  | FinishedGameStatusGuessThemAll;

export interface FinishedGameStatusSingleWithTries
  extends FinishedGameStatusBase {
  singleWithTries: boolean; // Discriminator

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

export interface GameContext {
  start: () => void;
  finish: (finishStatus: FinishedGameStatus) => void;
  gameStatus: GameStatus;
}

const defaultGameUI: GameContext = {
  start: () => {},
  finish: () => {},
  gameStatus: {},
};

export function useGameContext() {
  return useContext(GameContext);
}

const GameContext = createContext<GameContext>(defaultGameUI);

export default function GameWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<GameStatus>({
    finishedStatus: undefined,
  });

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
      <GameContext.Provider
        value={{
          start: startGame,
          finish: finishGame,
          gameStatus: status,
        }}
      >
        {children}
      </GameContext.Provider>
      <CompletedDialog
        actions={completedActions}
        finishedStatus={status.finishedStatus}
        timeElapsedMS={
          (status.timeFinished ?? NaN) - (status.timeStarted ?? NaN)
        }
        onClose={resetGame}
      ></CompletedDialog>
    </>
  );
}
