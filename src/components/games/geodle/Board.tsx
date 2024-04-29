import { BoardState, TileState, LetterStatus } from './Geodle';

export function getLetterColor(state: LetterStatus | undefined) {
  switch (state) {
    case undefined:
      return 'border-gray-50 text-black';
    case 'absent':
      return 'border-gray-500 bg-gray-500';
    case 'present':
      return 'border-yellow-500 bg-yellow-500';
    case 'correct':
      return `border-green-500 bg-green-500`;
  }
}

interface TileProps {
  state: TileState;
}
export function Tile({ state }: TileProps) {
  return (
    <div
      className={`${getLetterColor(state.status)} ${state.status ? 'text-white' : 'text-black'} grid select-none place-items-center border-2 text-2xl uppercase md:text-3xl`}
    >
      {state.letter}
    </div>
  );
}

interface Props {
  board: BoardState;
  spaceIndices: number[];
}

export function Board({ board, spaceIndices }: Props) {
  function renderTileRow(tileStates: TileState[], rowIndex: number) {
    const rowElements: JSX.Element[] = [];
    for (let colIndex = 0; colIndex < tileStates.length; colIndex++) {
      const id: string = `${rowIndex}-${colIndex}`;
      if (spaceIndices.includes(colIndex))
        rowElements.push(<div key={`${id}-space`} />);
      rowElements.push(
        <Tile key={`${id}-tile`} state={tileStates[colIndex]} />
      );
    }

    return rowElements;
  }

  const rowCount: number = board.length;
  const colCount: number = board[0].length + spaceIndices.length;

  const targetSizeRem: number = 4;
  const dynamicSizeRem: number = Math.round(
    Math.max(3, Math.min(targetSizeRem, (targetSizeRem * 8) / colCount))
  );

  return (
    <div className='flex w-full flex-grow items-center justify-center mb-3'>
      <div
        className={`m-auto grid h-min max-w-sm gap-1 md:gap-2`}
        style={{
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          width: `${dynamicSizeRem * colCount}rem`,
          maxWidth: `${targetSizeRem * colCount}rem`,
          height: `${dynamicSizeRem * rowCount}rem`,
        }}
      >
        {board.map((row, rowIndex) => renderTileRow(row, rowIndex))}
      </div>
    </div>
  );
}
