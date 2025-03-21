'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Game,
  PointGuesserGame,
  CompleterGame,
  GeodleGame,
  TrailGuesserGame,
  PuzzleGuesserGame,
  OutlinerGame,
  PatherGame,
} from '@/types/games';
import { Feature, GameParams } from '@/types/routing/dynamicParams';

import Link from 'next/link';
import React from 'react';

const minigames: {
  game: Game;
  hrefGenerator: (_: GameParams) => string;
  preferredFeature?: Feature;
  noDaily?: boolean;
}[] = [
  {
    game: PointGuesserGame,
    hrefGenerator: (gp: GameParams) => PointGuesserGame.getHref(gp),
    preferredFeature: 'capitals',
  },
  {
    game: CompleterGame,
    hrefGenerator: (gp: GameParams) =>
      CompleterGame.getCompleterHref({
        ...gp.params,
        knownAttributes: 'flag',
        guessAttributes: 'name',
      }),
  },
  {
    game: GeodleGame,
    hrefGenerator: (gp: GameParams) => GeodleGame.getHref(gp),
  },
  {
    game: TrailGuesserGame,
    hrefGenerator: (gp: GameParams) => TrailGuesserGame.getHref(gp),
  },
  {
    game: PuzzleGuesserGame,
    hrefGenerator: (gp: GameParams) => PuzzleGuesserGame.getHref(gp),
    noDaily: true,
  },
  {
    game: OutlinerGame,
    hrefGenerator: (gp: GameParams) => OutlinerGame.getHref(gp),
  },
  {
    game: PatherGame,
    hrefGenerator: (gp: GameParams) => PatherGame.getHref(gp),
  },
];

const infoPages: {
  title: string;
  description: string;
  relHref: string;
}[] = [
  {
    title: 'Countries',
    description: 'See information about each country',
    relHref: 'country',
  },
  {
    title: 'Capitals',
    description: 'See information about each capital',
    relHref: 'capital',
  },
];

export default function NavBar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Daily</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
              <li
                style={{
                  gridRow: `span ${minigames.length} / span ${minigames.length}`,
                }}
                className='row-span-4'
              >
                <NavigationMenuLink asChild>
                  <>
                    <div className='mb-2 mt-4 text-lg font-medium'>
                      Daily games
                    </div>
                    <p className='text-sm leading-tight text-muted-foreground'>
                      The same minigames, but with a unique solution each day
                    </p>
                  </>
                </NavigationMenuLink>
              </li>
              {minigames
                .filter((m) => m.noDaily !== true)
                .map((minigame) => (
                  <ListItem
                    key={minigame.game.displayName}
                    title={minigame.game.displayName}
                    href={minigame.hrefGenerator({
                      params: {
                        gamemode: 'daily',
                        region: 'World',
                        selection: 'independent',
                        feature: minigame.preferredFeature ?? 'countries',
                      },
                    })}
                  >
                    {minigame.game.description}
                  </ListItem>
                ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Minigames</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
              {minigames.map((minigame) => (
                <ListItem
                  key={minigame.game.displayName}
                  title={minigame.game.displayName}
                  href={minigame.hrefGenerator({
                    params: {
                      gamemode: 'training',
                      region: 'World',
                      selection: 'independent',
                      feature: minigame.preferredFeature ?? 'countries',
                    },
                  })}
                >
                  {minigame.game.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href='/game-builder' legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Game builder
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Info</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
              {infoPages.map((infoPage) => (
                <ListItem
                  key={infoPage.title}
                  title={infoPage.title}
                  href={`/info/${infoPage.relHref}`}
                >
                  {infoPage.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href='/about' legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
