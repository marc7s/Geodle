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
import { getFormattedElapsedTime } from '@/format';

export interface DialogAction {
  title: string;
  onClicked: () => void;
}

export interface CompletedResult {
  correct: number;
  total: number;
  timeElapsedMS: number;
}

interface Props {
  show: boolean;
  title?: string;
  results: CompletedResult;
  description: string;
  actions: DialogAction[];
  onClose: () => void;
}

export default function CompletedDialog(props: Props) {
  return (
    <AlertDialog open={props.show}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title ?? 'All done!'}</AlertDialogTitle>
          <AlertDialogDescription className='whitespace-pre-wrap'>
            {props.description}
          </AlertDialogDescription>
          <div className='flex-col pt-4'>
            <div>
              Correct guesses: {props.results.correct}/{props.results.total}
            </div>
            <div>
              Total time: {getFormattedElapsedTime(props.results.timeElapsedMS)}
            </div>
            <div>
              Average time per guess:{' '}
              {props.results.correct < 1
                ? 'N/A'
                : getFormattedElapsedTime(
                    props.results.timeElapsedMS / props.results.correct
                  )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onClose}>Cancel</AlertDialogCancel>
          {props.actions.map((a, i) => (
            <AlertDialogAction onClick={a.onClicked} key={i}>
              {a.title}
            </AlertDialogAction>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
