# Geodle

Geodle is a fully static (no backend required, meaning it is very simple to host and can utilize CDNs heavily) website with geography themed minigames. The purpose of the website is to learn geography, and to allow you to customize your learning through the minigames. As such, every game is highly customisable, for example allowing you to choose the region (World, Europe, Americas etc). This allows you to focus your training depending on what you would like to improve.

To make the learning enjoyable, Geodle uses minigames of different kinds. All minigames have a `Daily` mode, where the solution is the same during that entire day. This gives you a reason to come back every day to complete the daily games, introducing a reoccuring learning pattern.

# Games

## Geodle

A game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) by Josh Wardle.
Code partly reworked from [Weirdle](https://github.com/alanrsoares/weirdle/tree/main).

The solution is unknown, but by guessing you will gain information about each letter. Green indicates that the letter is correct, and in the right position. Yellow means that the letter is included in the solution, but at a different position. Gray means that the letter is not part of the solution.

## Point Guesser

A game inspired by quizzes [like this one](https://www.sporcle.com/games/g/europecapitals).

You are presented with one or more points on the map, and your task is to guess them all - in any order.

## Trail Guesser

A game inspired by [Worldle](https://worldle.teuteuf.fr/).

The solution is unknown, but with each guess the game will tell you how far away your guess was compared with the solution, and in which direction.

## Completer

A quizzing game where you need to fill in the blanks.

This is the most versitile game, you can use it to train flags, capitals, country names, countries and flags at the same time and so on.

## Outliner

A game where you have to guess the country based on its outline. Also inspired by [Worldle](https://worldle.teuteuf.fr/).

## Puzzle

A game where you have to guess all countries, where each correct guess adds it to the map. Like laying a puzzle where each country is a piece, revealing parts of borders to missing countries as you guess. Inspired by quizzes [like this one](https://www.sporcle.com/games/g/world).

## Pather

A game inspired by [Travle](https://travle.earth/), where you are given a start and end country, and your task is to guess bordering countries that form the shortest path between them, in terms of number of countries.

# Data

## Processing

The data is processed before being imported. The processing includes modifying certain rows, in `[dataset].override.csv` files or adding rows in `[dataset].complement.csv` files. As part of the manual modifications, there is usually a comment attached to the changes for transparency.

### Exclusions

1. The Antarctic region is excluded, there were not enough valid countries to warrant a region.
2. US Minor Outlying Islands is excluded since it is not a country, and no capital could be determined

# Development

## Setup

1. Install the `Prettier` VS Code extension
2. Setup a Microsoft SQL Server instance with an admin user, as Prisma needs to modify the database during deployment
3. Create a `.env.dev` and `.env.prod` environment file and fill them in according to the example files
4. Install Mapshaper globally with `npm i -g mapshaper`

## Prisma

Prisma is used as it allows easily creating the data structures through a schema, which then both generates the necessary tables and relationships, and also generates the corresponding types. This automated type generation is the main reason it is used, as it is very convenient to have have access to the correct types in Next.js. Note that the way it is setup is completely deviant from how Prisma is meant to be used and its best practices, as migrations are not used in this project. Instead, the database is completely dropped, before being reinserted with all the data. The reason for this is that the one source of truth in this case is not the database, but the datasets. These CSV files could be updated externally, and the state of the database should reflect these datasets. Clearing the database is safe in this circumstance, since it is seeded with all the data from the datasets in the seeding step.

## Deployment

### Dev

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-dev` if you need to deploy the database
3. Run `npm run generate-dev` if you need to regenerate the types
4. Run `npm run generate-geojson` if you need to regenerate the GeoJson files
5. Build the application with the `DevDockerfile`

### Prod

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-prod` if you need to deploy the database
3. Run `npm run generate-prod` if you need to regenerate the types
4. Run `npm run generate-geojson` if you need to regenerate the GeoJson files
5. Build the application with the `ProdDockerfile`
