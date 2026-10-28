import CompletedDialog, { DialogAction } from '@/components/ui/CompletedDialog';
import GameBuilderDialog from '@/components/ui/GameBuilderDialog';
import { Button } from '@/components/ui/button';
import { seedSearchParam } from '@/components/useSeed';
import { Game } from '@/types/games';
import { GameParams } from '@/types/routing/dynamicParams';
import React, { createContext, useContext, useState } from 'react';

interface FinishedGameStatusBase {
  succeeded: boolean;
  gaveUp: boolean;
}

export type FinishedGameStatus =
  FinishedGameStatusSingleWithTries | FinishedGameStatusGuessThemAll;

export interface FinishedGameStatusSingleWithTries extends FinishedGameStatusBase {
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

// The seed of the current game, and how many seeds the game has
export interface SeedInfo {
  // The `linkName` of the game the seed belongs to
  game: string;
  seed: number;
  seedCount: number;
}

export interface GameContext {
  init: (gameWithParams: GameWithParams) => void;
  start: () => void;
  finish: (finishStatus: FinishedGameStatus) => void;
  gameStatus: GameStatus;
  // True once the game has been won, lost or given up. Games should stop accepting guesses then
  isFinished: boolean;
  // Set by `useSeed`, so a new game can pick a different seed
  setSeedInfo: (seedInfo: SeedInfo) => void;
  gameWithParams?: GameWithParams;
}

const defaultGameUI: GameContext = {
  init: () => {},
  start: () => {},
  finish: () => {},
  gameStatus: {},
  isFinished: false,
  setSeedInfo: () => {},
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
  const [seedInfo, setSeedInfo] = useState<SeedInfo>();
  // Changing this remounts the game, which then reads the seed from the URL again
  const [gameNumber, setGameNumber] = useState<number>(0);
  // The completed dialog can be closed without starting a new game, e.g. after winning the daily game
  const [dialogClosed, setDialogClosed] = useState<boolean>(false);

  // The provider is kept when navigating between games, so a new game resets the status
  function initGame(contextGameWithParams: GameWithParams) {
    if (
      gameWithParams?.game.linkName === contextGameWithParams.game.linkName &&
      JSON.stringify(gameWithParams.params) ===
        JSON.stringify(contextGameWithParams.params)
    )
      return;

    setGameWithParams(contextGameWithParams);
    resetGame();
  }

  // Use functional updates, since a game can start and finish in the same event (e.g. a correct first guess)
  // Starting is ignored if the game has already started, so games can call it on every guess
  function startGame() {
    const timeStarted: number = new Date().getTime();
    setStatus((s) => (s.timeStarted ? s : { ...s, timeStarted: timeStarted }));
  }

  // Finishing is ignored if the game has already finished
  function finishGame(finishStatus: FinishedGameStatus) {
    const timeFinished: number = new Date().getTime();
    setStatus((s) =>
      s.finishedStatus
        ? s
        : { ...s, timeFinished: timeFinished, finishedStatus: finishStatus }
    );
  }

  function resetGame() {
    setDialogClosed(false);
    setStatus({
      timeStarted: undefined,
      timeFinished: undefined,
      finishedStatus: undefined,
    });
  }

  // Whether the answer depends on the seed. Otherwise, the game has a single seed and is shuffled when started
  // The seed info is only replaced (never cleared), since clearing it could race with `useSeed` setting it,
  // so check that it belongs to the current game
  const dependsOnSeed: boolean =
    seedInfo !== undefined &&
    seedInfo.game === gameWithParams?.game.linkName &&
    seedInfo.seedCount > 1;

  // Starts the same game with a different seed. Games with a single seed are restarted
  function newGame() {
    if (seedInfo && dependsOnSeed) {
      // Pick from the other seeds, by skipping over the current one
      let newSeed: number =
        Math.floor(Math.random() * (seedInfo.seedCount - 1)) + 1;
      if (newSeed >= seedInfo.seed) newSeed++;

      const url: URL = new URL(window.location.href);
      url.searchParams.set(seedSearchParam, newSeed.toString());
      window.history.replaceState(window.history.state, '', url);
    }
    resetGame();
    setGameNumber((n) => n + 1);
  }

  const isTraining: boolean =
    gameWithParams?.params.params.gamemode === 'training';

  // The answer is shown when the game is lost, so there is no need to retry the same game
  // Training: games that depend on the seed continue with a different one, the others are restarted (and reshuffled)
  // Daily: there is only one game per day, so the dialog can only be closed
  const completedAction: DialogAction = isTraining
    ? { title: dependsOnSeed ? 'Play next' : 'Go again', onClicked: newGame }
    : { title: 'Close', onClicked: () => setDialogClosed(true) };

  return (
    <>
      <DefaultGameContext.Provider
        value={{
          init: initGame,
          start: startGame,
          finish: finishGame,
          gameStatus: status,
          isFinished: status.finishedStatus !== undefined,
          setSeedInfo: setSeedInfo,
          gameWithParams: gameWithParams,
        }}
      >
        <div className='absolute top-2 right-2 flex items-center gap-3'>
          {isTraining && (
            <Button variant='outline' size='sm' onClick={newGame}>
              New game
            </Button>
          )}
          {gameWithParams && (
            <GameBuilderDialog
              fixedGame={gameWithParams.game}
              gameParams={gameWithParams.params}
            />
          )}
        </div>
        <React.Fragment key={gameNumber}>{children}</React.Fragment>
      </DefaultGameContext.Provider>
      <CompletedDialog
        actions={[completedAction]}
        finishedStatus={status.finishedStatus}
        timeElapsedMS={
          (status.timeFinished ?? NaN) - (status.timeStarted ?? NaN)
        }
        closed={dialogClosed}
      ></CompletedDialog>
    </>
  );
}
