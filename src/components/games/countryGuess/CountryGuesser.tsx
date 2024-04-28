'use client';

import { Country } from '@prisma/client';
import { useEffect, useState } from 'react';
import { FaLongArrowAltUp } from 'react-icons/fa';
import { GeoVector2, getVectorBetweenCoordinates } from '@/geoUtils';
import { getFormattedDistance } from '@/format';
import SelectQuestionTask, {
  SelectQuestionOption,
} from '@/components/SelectQuestionTask';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CountryGuess {
  guessedCountry: Country;
  vectorToCorrect: GeoVector2;
}

interface Props {
  title: string;
  allowedGuesses: number;
  countries: Country[];
  dropdownCountries: Country[];
  correctCountry: Country;
}

export function countryToSelectValue(country: Country): string {
  return country.englishShortName;
}

export default function CountryGuesser({
  title,
  allowedGuesses,
  countries,
  dropdownCountries,
  correctCountry,
}: Props) {
  const [guesses, setGuesses] = useState<CountryGuess[]>([]);

  // Clear the guesses whenever the correct country changes
  useEffect(() => {
    setGuesses([]);
  }, [correctCountry]);

  function addGuess(countryGuess: CountryGuess) {
    setGuesses([...guesses, countryGuess]);
  }

  function handleCorrectGuess() {
    addGuess({
      guessedCountry: correctCountry,
      vectorToCorrect: {
        origin: { lat: correctCountry.lat, long: correctCountry.long },
        distance: 0,
        bearingDeg: 0,
      },
    });
  }

  function handleIncorrectGuess(guess: SelectQuestionOption) {
    const guessedCountry: Country | undefined = countries.find(
      (c) => countryToSelectValue(c) === guess.value
    );
    if (!guessedCountry) return;

    const countryGuess: CountryGuess = {
      guessedCountry: guessedCountry,
      vectorToCorrect: getVectorBetweenCoordinates(
        { lat: guessedCountry.lat, long: guessedCountry.long },
        { lat: correctCountry.lat, long: correctCountry.long }
      ),
    };
    addGuess(countryGuess);
  }

  function getGuessRow(guess: CountryGuess | undefined) {
    return (
      <>
        <TableCell>
          {guess ? guess.guessedCountry.englishShortName : ''}
        </TableCell>
        <TableCell>
          {guess ? getFormattedDistance(guess.vectorToCorrect.distance) : ''}
        </TableCell>
        <TableCell>
          {guess ? (
            <FaLongArrowAltUp
              size={30}
              style={{
                transform: `rotate(${guess.vectorToCorrect.bearingDeg}deg)`,
              }}
            />
          ) : (
            ''
          )}
        </TableCell>
      </>
    );
  }

  function getCountryGuessList(allowedGuesses: number) {
    // Generate an array of indices for all possible guess slots
    const possibleGuessIndices: number[] = Array.from(
      Array(allowedGuesses).keys()
    );
    const guessList: JSX.Element[] = possibleGuessIndices.map((i) => {
      const guess: CountryGuess | undefined = guesses.at(i);
      const isCorrect: boolean = guess?.guessedCountry === correctCountry;
      return (
        <TableRow key={i} className={isCorrect ? 'bg-green-700' : ''}>
          {isCorrect ? (
            <TableCell colSpan={3} className='text-center'>
              {guess?.guessedCountry.englishShortName}
            </TableCell>
          ) : (
            getGuessRow(guess)
          )}
        </TableRow>
      );
    });
    return (
      <div className='max-w-lg mb-10'>
        <Table>
          <TableCaption>
            {guesses.length}/{allowedGuesses} guesses used
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'>Country</TableHead>
              <TableHead className='text-center'>Distance</TableHead>
              <TableHead className='text-center'>Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='text-lg'>{guessList}</TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-2xl mb-5'>{title}</div>
      {getCountryGuessList(allowedGuesses)}
      <div className='mb-2'>Enter your guess</div>
      <div>
        <SelectQuestionTask
          options={dropdownCountries.map((c) => {
            return { value: c.englishShortName, label: c.englishShortName };
          })}
          dropdownPlaceholder='Select country...'
          searchPlaceholder='Search countries...'
          correctValue={countryToSelectValue(correctCountry)}
          onQuestionStarted={() => {}}
          onCorrectAnswer={handleCorrectGuess}
          onIncorrectAnswer={handleIncorrectGuess}
        ></SelectQuestionTask>
      </div>
    </div>
  );
}
