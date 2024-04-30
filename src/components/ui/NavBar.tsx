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

import Link from 'next/link';

export default function NavBar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Geodle</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Link href='/training/Europe/countries/geodle'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Europe
              </NavigationMenuLink>
            </Link>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>City Guesser</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Link href='/training/Europe/capitals/city-guesser'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Europe
              </NavigationMenuLink>
            </Link>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Trail Guesser</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Link href='/training/World/countries/trail-guesser'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                World
              </NavigationMenuLink>
            </Link>
            <Link href='/training/Europe/countries/trail-guesser'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Europe
              </NavigationMenuLink>
            </Link>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Complete</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Link href='/training/Europe/countries/complete/flag/name'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Flag - Name
              </NavigationMenuLink>
            </Link>
            <Link href='/training/Europe/countries/complete/flag/capital&name'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Flag - Capital&Name
              </NavigationMenuLink>
            </Link>
            <Link href='/training/Europe/countries/complete/capital&flag/name'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Capital&Flag - Name
              </NavigationMenuLink>
            </Link>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
