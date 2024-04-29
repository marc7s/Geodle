'use client';

import { useEffect } from 'react';
import { BoardState, LetterStatus } from './Geodle';
import { getLetterColor } from './Board';

const BackspaceIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    height='24'
    viewBox='0 0 24 24'
    width='24'
  >
    <path
      fill='currentcolor'
      d='M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z'
    ></path>
  </svg>
);

export const MAPPABLE_KEYS = {
  BACKSPACE: <BackspaceIcon />,
  ENTER: 'ENTER',
} as const;

export type MappableKeys = keyof typeof MAPPABLE_KEYS;

export function isMappableKey(key: string): key is MappableKeys {
  return key in MAPPABLE_KEYS;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const VALID_KEYS = KEYS.flatMap((row) =>
  row.map((key) => key.toLowerCase())
).filter(Boolean);

interface KeyProps {
  letter: string;
  children: any;
  onKeyPress: (key: any) => void;
  className?: string;
  disabled?: boolean;
}

function KeyButton({
  letter,
  children,
  onKeyPress,
  className,
  disabled,
}: KeyProps) {
  return (
    <button
      className={`${className ? className : ''} bg-gray-300 hover:bg-gray-400 active:opacity-60 md:p-3 p-1 rounded-md md:text-lg sm:text-sm text-xs font-bold transition-all md:min-w-[3rem] min-w-[2rem]`}
      onClick={() => onKeyPress(letter)}
      style={disabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
    >
      {children}
    </button>
  );
}

interface Props {
  board: BoardState;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ board, onKeyPress, disabled }: Props) {
  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (disabled) return;
      if (!VALID_KEYS.includes(e.key.toLocaleLowerCase())) return;

      onKeyPress(e.key.toLowerCase());
    }

    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyPress, disabled]);

  function getKeyButtonStatus(key: string): LetterStatus | undefined {
    for (const row of board) {
      for (const tile of row) {
        if (tile.letter.toLocaleUpperCase() === key.toLocaleUpperCase()) {
          return tile.status;
        }
      }
    }
    return undefined;
  }

  return (
    <div className='flex w-full flex-col items-center justify-center md:gap-3 gap-1 p-3'>
      {KEYS.map((row, i) => (
        <div className='flex justify-center md:gap-3 gap-1' key={i}>
          {row.map((key) => (
            <KeyButton
              key={key}
              letter={key}
              onKeyPress={(key) => {
                if (!disabled) onKeyPress(key.toLocaleLowerCase());
              }}
              disabled={disabled}
              className={`${getLetterColor(getKeyButtonStatus(key))} text-black`}
            >
              {isMappableKey(key) ? MAPPABLE_KEYS[key] : key}
            </KeyButton>
          ))}
        </div>
      ))}
    </div>
  );
}
