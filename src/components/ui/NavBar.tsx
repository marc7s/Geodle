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
          <NavigationMenuTrigger>City Guess</NavigationMenuTrigger>
          <NavigationMenuContent>
            <Link href='/training/Europe/capitals/city-guess'>
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
                Flag-Name
              </NavigationMenuLink>
            </Link>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
