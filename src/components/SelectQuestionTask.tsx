'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ComboGroup } from './ui/combo-group';

export interface SelectQuestionOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectQuestionOption[];
  correctValue: string;
  dropdownPlaceholder: string;
  searchPlaceholder: string;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: (guess: SelectQuestionOption) => void;
  onQuestionStarted: () => void;
}

export default function SelectQuestionTask({
  options,
  correctValue,
  dropdownPlaceholder,
  searchPlaceholder,
  onCorrectAnswer,
  onIncorrectAnswer,
  onQuestionStarted,
}: Props) {
  const [started, setStarted] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  // A new selection was made, handle it
  useEffect(() => {
    if (value === '') return;

    const guess: SelectQuestionOption | undefined = options.find(
      (o) => o.value.toLocaleLowerCase() === value
    );
    if (!guess) return;

    if (!started) onQuestionStarted();
    setStarted(true);

    if (guess.value === correctValue) {
      onCorrectAnswer();
    } else {
      onIncorrectAnswer(guess);
      setValue('');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
          disabled={
            value.toLocaleLowerCase() === correctValue.toLocaleLowerCase()
          }
        >
          {value
            ? options.find(
                (option) => option.value.toLocaleLowerCase() === value
              )?.label
            : dropdownPlaceholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No matches found.</CommandEmpty>
          <ComboGroup>
            {options.map((option, i) => (
              <CommandItem
                key={i}
                value={option.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </ComboGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
