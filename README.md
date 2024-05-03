# Geodle

Geodle is a fully static (no backend required, meaning it is very simple to host and can utilize CDNs heavily) website with geography themed minigames. The purpose of the website is to learn geography, and to allow you to customize your learning through the minigames. As such, every game is highly customisable, for example allowing you to choose the region (World, Europe, Americas etc). This allows you to focus your training depending on what you would like to improve.

To make the learning enjoyable, Geodle uses minigames of different kinds. All minigames have a `Daily` mode, where the solution is the same during that entire day. This gives you a reason to come back every day to complete the daily games, introducing a reoccuring learning pattern.

# Games

## Geodle

A game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) by Josh Wardle.
Code partly reworked from [Weirdle](https://github.com/alanrsoares/weirdle/tree/main).

The solution is unknown, but by guessing you will gain information about each letter. Green indicates that the letter is correct, and in the right position. Yellow means that the letter is included in the solution, but at a different position. Gray means that the letter is not part of the solution.

## City Guess

A game inspired by quizzes [like this one](https://www.sporcle.com/games/g/europecapitals).

You are presented with one or more points on the map, and your task is to guess them all - in any order.

## Trail Guess

A game inspired by [Worldle](https://worldle.teuteuf.fr/).

The solution is unknown, but with each guess the game will tell you how far away your guess was compared with the solution, and in which direction.

## Complete

A quizzing game where you need to fill in the blanks.

This is the most versitile game, you can use it to train flags, capitals, country names, countries and flags at the same time and so on.

# Development

## Setup

1. Install the `Prettier` VS Code extension
2. Setup a Microsoft SQL Server instance with an admin user, as Prisma needs to modify the database during deployment
3. Create a `.env.dev` and `.env.prod` environment file and fill them in according to the example files

## Deployment

### Dev

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-dev` if you need to deploy the database
3. Build the application with the `DevDockerfile`

### Prod

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-prod` if you need to deploy the database
3. Build the application with the `ProdDockerfile`
