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

# Data

## Processing

The data is processed before being imported. The processing includes modifying certain rows, in `[dataset].override.csv` files or adding rows in `[dataset].complement.csv` files. As part of the manual modifications, there is usually a comment attached to the changes for transparency.

### Exclusions

1. The Antarctic region is excluded, there were not enough valid countries to warrant a region.
2. US Minor Outlying Islands is excluded since it is not a country, and no capital could be determined

## Curated list

Geodle contains a curated list of countries that can be used to filter countries when playing. The goal of this curated list is to include countries I feel could be interesting to know about, while excluding others that are either too far-fetched or not separate enough from a main country. An example is that all countries in Antarctica are exluded since I do not really consider them to be part of a reasonable selection for this game (far-fetched). Sometimes I've included countries since they are close to other countries that are included, but would have been excluded otherwise. The reason for this is simply that since there are already countries there, I am more leniant to include borderline countries as well as "part of that group". This situation pretty much exclusively occurs for island groups. Size could also be a factor, large countries are more likely to be included. Being independent is pretty much a safe card for being included in the curated list. Having official Google street view coverage could also contribute to being included, as it is likelier to be known about - especially by Geoguessr players. The philosophy behind the curated list is that Geodle is meant for learning, so as many countries as possible are included while still trying to keep the games fun and not frustrating as remote islands tend to show up a lot in these types of minigames.

> [!NOTE]  
> This is not in any way a judgement of certain countries, nor a way of pushing opinions. The goal of Geodle is to learn, but unfortunately restrictions must be put in place as it will get too frustrating otherwise since there are so many independent countries - especially islands.

The comments in the datasets are purely for explanation and for me to remember my reasoning. Again, no opinions about the countries or statements of any kind - especially political - are intended.

# Development

## Setup

1. Install the `Prettier` VS Code extension
2. Setup a Microsoft SQL Server instance with an admin user, as Prisma needs to modify the database during deployment
3. Create a `.env.dev` and `.env.prod` environment file and fill them in according to the example files

## Prisma

Prisma is used as it allows easily creating the data structures through a schema, which then both generates the necessary tables and relationships, and also generates the corresponding types. This automated type generation is the main reason it is used, as it is very convenient to have have access to the correct types in Next.js. Note that the way it is setup is completely deviant from how Prisma is meant to be used and its best practices, as migrations are not used in this project. Instead, the database is completely dropped, before being reinserted with all the data. The reason for this is that the one source of truth in this case is not the database, but the datasets. These CSV files could be updated externally, and the state of the database should reflect these datasets. Clearing the database is safe in this circumstance, since it is seeded with all the data from the datasets in the seeding step.

## Deployment

### Dev

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-dev` if you need to deploy the database
3. Build the application with the `DevDockerfile`

### Prod

1. Setup your SQL Express database with the correct credentials. Note that the database user needs to be an administrator for Prisma to be able to migrate
2. Run `npm run deploy-prod` if you need to deploy the database
3. Build the application with the `ProdDockerfile`
