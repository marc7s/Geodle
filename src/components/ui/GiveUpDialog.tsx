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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import styles from './GiveUpDialog.module.scss';
import { GameContext } from '@/context/Game';

interface Props {
  gameContext: GameContext;
  onGiveUp: () => void;
}

// Not rendered once the game has finished, since there is nothing left to give up
export default function GiveUpDialog(props: Props) {
  const { isFinished, gameStatus } = props.gameContext;
  if (isFinished) return <></>;
  if (!gameStatus.timeStarted) return <></>;

  return (
    <AlertDialog>
      <AlertDialogTrigger className={`py-2 ${styles.giveUpButton}`}>
        Give up
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose your current progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={props.onGiveUp}
            className={styles.giveUpButton}
          >
            Give up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
