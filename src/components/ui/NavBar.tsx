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
import { Feature, GameParams } from '@/types/routing/dynamicParams';
import { GameRegion } from '@/types/routing/generated/regions';

import Link from 'next/link';
import React from 'react';

function generateHref(
  gameName: string,
  { params }: GameParams,
  additionalParameters?: string
) {
  return `/${params.gamemode}/${params.region}/${params.feature}/${gameName}${additionalParameters ? `/${additionalParameters}` : ''}`;
}

const minigames: {
  title: string;
  gameName: string;
  description: string;
  region?: GameRegion;
  feature?: Feature;
  additionalParameters?: string;
}[] = [
  {
    title: 'City Guesser',
    gameName: 'city-guesser',
    description: 'Guess the cities marked in the map',
    feature: 'capitals',
  },
  {
    title: 'Completer',
    gameName: 'completer',
    description: 'Complete the missing information',
    additionalParameters: 'flag/name',
  },
  {
    title: 'Geodle',
    gameName: 'geodle',
    description: 'A Wordle variant, but you have to guess a country or capital',
  },
  {
    title: 'Trail Guesser',
    gameName: 'trail-guesser',
    description: 'Every guess guides you toward the correct answer',
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
              {minigames.map((minigame) => (
                <ListItem
                  key={minigame.title}
                  title={minigame.title}
                  href={generateHref(
                    minigame.gameName,
                    {
                      params: {
                        gamemode: 'daily',
                        region: minigame.region ?? 'World',
                        feature: minigame.feature ?? 'countries',
                      },
                    },
                    minigame.additionalParameters
                  )}
                >
                  {minigame.description}
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
                  key={minigame.title}
                  title={minigame.title}
                  href={generateHref(
                    minigame.gameName,
                    {
                      params: {
                        gamemode: 'training',
                        region: minigame.region ?? 'World',
                        feature: minigame.feature ?? 'countries',
                      },
                    },
                    minigame.additionalParameters
                  )}
                >
                  {minigame.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
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
