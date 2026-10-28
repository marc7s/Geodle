'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FaCog } from 'react-icons/fa';

import { Game } from '@/types/games';
import GameBuilder from '@/app/game-builder/GameBuilder';
import { GameParams } from '@/types/routing/dynamicParams';
import { Checkbox } from '@/components/ui/checkbox';
import { useAutoGuess } from '@/settings';

interface Props {
  fixedGame?: Game;
  gameParams?: GameParams;
}

export default function GameBuilderDialog(props: Props) {
  const [autoGuess, setAutoGuess] = useAutoGuess();

  return (
    <AlertDialog>
      <AlertDialogTrigger className='py-2'>
        <FaCog size={20} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Configure your game</AlertDialogTitle>
          <div className='py-6'>
            <GameBuilder
              isPopup={true}
              fixedGame={props.fixedGame}
              gameParams={props.gameParams}
            />
          </div>
          <div className='text-center text-2xl mb-1'>Settings</div>
          <div className='flex items-center justify-center space-x-2'>
            <Checkbox
              id='auto-guess'
              checked={autoGuess}
              onCheckedChange={(checked) => setAutoGuess(checked === true)}
            />
            <label
              htmlFor='auto-guess'
              className='text-sm font-medium leading-none'
            >
              Submit answers while typing
            </label>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
