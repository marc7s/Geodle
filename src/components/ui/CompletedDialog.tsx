'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FinishedGameStatus,
  FinishedGameStatusGuessThemAll,
  FinishedGameStatusSingleWithTries,
} from '@/context/Game';
import { getFormattedElapsedTime } from '@/format';

export interface DialogAction {
  title: string;
  onClicked: () => void;
}

function guessThemAllContent(
  finishedStatus: FinishedGameStatusGuessThemAll,
  timeElapsedMS: number
): JSX.Element {
  const correct: number =
    finishedStatus.totalQuestions - finishedStatus.missedAnswers.length;
  const total: number = finishedStatus.totalQuestions;

  // Limit the displayed missed answers based on total character length
  const limitedMissedAnswers: string[] = [];
  for (const missedAnswer of finishedStatus.missedAnswers) {
    if (limitedMissedAnswers.join('').length + missedAnswer.length > 300) break;
    limitedMissedAnswers.push(missedAnswer);
  }

  const limitedMissingCount: number =
    finishedStatus.missedAnswers.length - limitedMissedAnswers.length;

  const description: string =
    finishedStatus.missedAnswers.length < 1
      ? 'You got them all correct.'
      : `Here are ${limitedMissingCount > 0 ? 'some of ' : ''}the ones you missed:\n\n${limitedMissedAnswers.join(', ')}${limitedMissingCount > 0 ? `... (and ${limitedMissingCount} more)` : ''}`;
  return (
    <>
      <AlertDialogDescription className='whitespace-pre-wrap'>
        {description}
      </AlertDialogDescription>
      <div className='flex-col pt-4'>
        <div>
          Correct guesses: {correct}/{total}
        </div>
        <div>Total time: {getFormattedElapsedTime(timeElapsedMS)}</div>
        {total > 1 ? (
          <div>
            Average time per guess:{' '}
            {correct < 1
              ? 'N/A'
              : getFormattedElapsedTime(timeElapsedMS / correct)}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

function singleWithTriesContent(
  finishedStatus: FinishedGameStatusSingleWithTries,
  timeElapsedMS: number
): JSX.Element {
  const description: string = finishedStatus.succeeded
    ? 'You got the answer!'
    : `Better luck next time!\nThe correct answer was: ${finishedStatus.correctAnswer}`;
  return (
    <>
      <AlertDialogDescription className='whitespace-pre-wrap'>
        {description}
      </AlertDialogDescription>
      <div className='flex-col pt-4'>
        <div>
          Guesses: {finishedStatus.numberOfTries}/
          {finishedStatus.availableTries}
        </div>
        <div>Total time: {getFormattedElapsedTime(timeElapsedMS)}</div>
      </div>
    </>
  );
}

function renderContent(
  finishedGameStatus: FinishedGameStatus,
  timeElapsedMS: number
): JSX.Element {
  if ('singleWithTries' in finishedGameStatus) {
    return singleWithTriesContent(finishedGameStatus, timeElapsedMS);
  } else if ('guessThemAll' in finishedGameStatus) {
    return guessThemAllContent(finishedGameStatus, timeElapsedMS);
  }
  return <></>;
}

interface Props {
  title?: string;
  finishedStatus?: FinishedGameStatus;
  timeElapsedMS: number;
  actions: DialogAction[];
  onClose: () => void;
}
export default function CompletedDialog(props: Props) {
  return (
    <AlertDialog open={props.finishedStatus !== undefined}>
      {props.finishedStatus ? (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props.title ??
              (props.finishedStatus.gaveUp || !props.finishedStatus.succeeded)
                ? 'Nice try!'
                : 'All done!'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          {renderContent(props.finishedStatus, props.timeElapsedMS)}
          <AlertDialogFooter>
            {props.actions.map((a, i) => (
              <AlertDialogAction onClick={a.onClicked} key={i}>
                {a.title}
              </AlertDialogAction>
            ))}
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : (
        <></>
      )}
    </AlertDialog>
  );
}
