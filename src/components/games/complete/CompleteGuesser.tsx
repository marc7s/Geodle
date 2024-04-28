'use client';

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Question } from '../../QuestionTask';
import CompleteTask from './CompleteTask';
import { useEffect, useState } from 'react';

export interface CompleteQuestion {
  knownQuestions: Question[];
  completeQuestions: Question[];
}

interface Props {
  questions: CompleteQuestion[];
}

export default function CompleteGuesser({ questions }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <>
      <Carousel
        orientation='horizontal'
        opts={{ align: 'center', loop: false }}
        setApi={setApi}
      >
        <CarouselContent>
          {questions.map((q, i) => (
            <CarouselItem
              key={i}
              className='p-0 w-full text-center flex justify-center'
            >
              <div className='m-5 max-w-xl grow'>
                <CompleteTask
                  key={i}
                  knownQuestions={q.knownQuestions}
                  questions={q.completeQuestions}
                  title='Country'
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className='py-2 text-center text-sm text-muted-foreground'>
        Question {current} of {count}
      </div>
    </>
  );
}
