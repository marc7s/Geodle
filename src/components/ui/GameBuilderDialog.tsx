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

interface Props {
  fixedGame?: Game;
  gameParams?: GameParams;
}

export default function GameBuilderDialog(props: Props) {
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
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
