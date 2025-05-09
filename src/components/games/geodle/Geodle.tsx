'use client';

import { useEffect, useState } from 'react';
import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { toast } from 'sonner';
import { useGameContext } from '@/context/Game';
import { GameParams } from '@/types/routing/dynamicParams';
import { GeodleGame, SeedInfo } from '@/types/games';
import GiveUpDialog from '@/components/ui/GiveUpDialog';
import { handleSeedClientSide } from '@/utils';

interface CursorPosition {
  x: number;
  y: number;
}

export type LetterStatus = 'absent' | 'present' | 'correct';

export interface TileState {
  letter: string;
  status?: LetterStatus;
}
export type BoardState = TileState[][];

interface State {
  board: BoardState;
  cursor: CursorPosition;
}

interface Props {
  title: string;
  correct: string;
  allowedGuessCount: number;
  allowedGuesses: string[];
  gameConfig: GameParams;
  seedInfo: SeedInfo;
}
export default function Geodle({
  title,
  correct,
  allowedGuessCount,
  allowedGuesses,
  gameConfig,
  seedInfo,
}: Props) {
  handleSeedClientSide(
    seedInfo,
    GeodleGame,
    gameConfig,
    {},
    (newSeed: number) => GeodleGame.getSeededHref(gameConfig, newSeed),
    () => GeodleGame.getRandomSeededHref(gameConfig, seedInfo)
  );

  const gameContext = useGameContext();
  // Initialize the game
  useEffect(() => {
    gameContext.init({ game: GeodleGame, params: gameConfig });
  }, [gameContext, gameConfig]);

  const correctNoSpaces: string = correct.replaceAll(' ', '');
  const ROW_COUNT = allowedGuessCount;
  const COLUMN_COUNT = correctNoSpaces.length;

  const spaceIndices = [];
  for (let i = 0; i < correct.length; i++) {
    if (correct[i] === ' ') spaceIndices.push(i - spaceIndices.length);
  }

  const [state, setState] = useState<State>({
    board: Array(ROW_COUNT).fill(Array(COLUMN_COUNT).fill({ letter: '' })),
    cursor: { x: 0, y: 0 },
  });

  // Clear the state whenever the correct string changes
  useEffect(() => {
    const clearedBoard = state.board.map((row) =>
      row.map((_) => {
        return { letter: '' };
      })
    );
    setState({
      board: clearedBoard,
      cursor: {
        x: 0,
        y: 0,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct, ROW_COUNT, COLUMN_COUNT]);

  function insertLetterIntoBoard(
    letter: string,
    x: number,
    y: number
  ): TileState[][] {
    return state.board.map((row, rowIndex) =>
      rowIndex === y
        ? row.map((ts, i) => (i === x ? { letter: letter } : ts))
        : row
    );
  }

  function moveCursor(forward: boolean): CursorPosition {
    if (
      (!forward && state.cursor.x === 0) ||
      (forward && state.cursor.x >= COLUMN_COUNT - 1)
    )
      return state.cursor;

    let x = state.cursor.x + (forward ? 1 : -1);

    x = (COLUMN_COUNT + x) % COLUMN_COUNT;

    return { x: x, y: state.cursor.y };
  }

  function charOccurences(str: string, char: string): number {
    return (str.match(new RegExp(char, 'g')) || []).length;
  }

  function getTileStatuses(
    tileStates: TileState[],
    guess: string
  ): TileState[] {
    const correctString: string = correctNoSpaces.toLocaleLowerCase();

    // Set all the correct statuses in a first pass
    // This is to later be able to set the present statuses correctly
    const correctStatuses: TileState[] = tileStates.map((st, i) =>
      st.letter === correctString[i] ? { ...st, status: 'correct' } : st
    );

    return correctStatuses.map((st, i) =>
      st.status === 'correct'
        ? st
        : correctString.includes(st.letter) &&
            charOccurences(correctString, st.letter) -
              correctStatuses.filter(
                (cs) => cs.letter === st.letter && st.status === 'correct'
              ).length >
              charOccurences(guess.slice(0, i), st.letter)
          ? { ...st, status: 'present' }
          : { ...st, status: 'absent' }
    );
  }

  function finish(gaveUp: boolean) {
    gameContext.finish({
      singleWithTries: true,

      correctAnswer: correct,
      succeeded: !gaveUp,
      gaveUp: gaveUp,
      availableTries: allowedGuessCount,
      numberOfTries: state.cursor.y + 1,
    });
  }

  function onKeyPress(key: string) {
    // Since we are bound to the same row,
    // there is an edge case where we are at the right-most index, but we have already entered a value
    const isRightEdgeCase: boolean =
      state.cursor.x >= COLUMN_COUNT - 1 &&
      state.board[state.cursor.y][COLUMN_COUNT - 1].letter !== '';

    if (key === 'enter') {
      if (!isRightEdgeCase) return;
      const guess: string | undefined = state.board
        .at(state.cursor.y)
        ?.map((ts) => ts.letter)
        .join('');
      if (!guess) return;
      if (
        !allowedGuesses
          .map((ag) => ag.replaceAll(' ', '').toLocaleLowerCase())
          .includes(guess)
      ) {
        toast('Not a known country', {
          description: 'Your guesses must be valid countries',
        });
        return;
      }
      setState({
        board: state.board.map((row, rowIndex) =>
          rowIndex === state.cursor.y ? getTileStatuses(row, guess) : row
        ),
        cursor: { x: 0, y: state.cursor.y + 1 },
      });

      if (guess === correctNoSpaces.toLocaleLowerCase()) finish(false);
      return;
    }

    let newBoard: TileState[][] = state.board;
    let cursor: CursorPosition = state.cursor;
    if (key === 'backspace') {
      if (!isRightEdgeCase) cursor = moveCursor(false);
      newBoard = insertLetterIntoBoard('', cursor.x, cursor.y);
    } else {
      if (isRightEdgeCase) return;
      newBoard = insertLetterIntoBoard(key, state.cursor.x, state.cursor.y);
      cursor = moveCursor(true);
    }

    setState({
      board: newBoard,
      cursor: cursor,
    });
  }

  return (
    <>
      <div className='text-center text-2xl mb-5'>{title}</div>
      <div className='h-full w-full'>
        <div className='m-auto flex flex-1 flex-col justify-between p-2'>
          <Board board={state.board} spaceIndices={spaceIndices} />
          <Keyboard
            board={state.board}
            onKeyPress={onKeyPress}
            disabled={state.board.some(
              (row, rowIndex) =>
                state.cursor.y > rowIndex &&
                row.map((t) => t.letter).join('') ===
                  correctNoSpaces.toLocaleLowerCase()
            )}
          />
        </div>
      </div>
      <div className='text-center mt-20'>
        <GiveUpDialog onGiveUp={() => finish(true)} />
        {/*gameContext.gameStatus.timeStarted && (
          
        )*/}
      </div>
    </>
  );
}
