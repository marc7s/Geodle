# Structure

## Overview

The datasets are responsible for seeding the database with all the data. The parser reads each file, converts it into the correct formats, and inserts it into the database. Since the data is supposed to be static in the database, the parser will read the datasets, process the data, and finally insert the restructured data into the database.

## Processing

For a dataset `exampleDataset.csv` (note that it might be fetched online and therefore not present in the `datasets/` folder) there might be a manual addition named `exampleDataset.complement.csv` which consists of manually added data points, for cases where data is missing. These will be combined with the original dataset by the parser.

In a similar fashion, there might exist a `exampleDataset.override.csv`, that will override the values of all columns that are not empty (except for the two special columns - the ID column and the `PROCESSING_DESCRIPTION` column). The ID column is used to identify the row it should override, and the `PROCESSING_DESCRIPTION` column is used to log a description of every change, to explain what it does.

## Updating the data

For the CSV files, simply download a new version and ensure it follows the same format, then redeploy the database. It will be reseeded with the new data.

For the countries CSV, first update the export in [the dedicated repository](https://github.com/marc7s/countries). To do this, follow the instructions for Geodl export in the README of that repository.

Then, redeploy the database. It will be reseeded with the new data which will be fetched from the updated CSV on GitHub.

Flags and GeoJSON files are fetched directly from the same repository, so updating these also requires updating the repository, but no redeployment of the database is necessary.

## Datasets

### countries.csv

This is fetched from the [the dedicated repository](https://github.com/marc7s/countries). Check the repository for when it was last updated. It is a fork of [the countries dataset by mledoze](https://github.com/mledoze/countries).

### cities.csv

Downloaded: 2024-04-24
Last Updated: 2024-03-10
Link: https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/export
