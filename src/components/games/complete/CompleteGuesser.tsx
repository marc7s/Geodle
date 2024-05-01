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
import { useGameContext } from '@/context/Game';
import GiveUpDialog from '@/components/ui/GiveUpDialog';

export interface CompleteQuestion {
  knownQuestions: Question[];
  completeQuestions: Question[];
  complete?: boolean;
}

interface Props {
  questions: CompleteQuestion[];
}

export default function CompleteGuesser({ questions }: Props) {
  const gameContext = useGameContext();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [completeQuestions, setCompleteQuestions] =
    useState<CompleteQuestion[]>(questions);

  function onTaskComplete(completeQuestion: CompleteQuestion) {
    setCompleteQuestions(
      completeQuestions.map((cq) =>
        cq === completeQuestion ? { ...cq, complete: true } : cq
      )
    );
  }

  function finish(gaveUp: boolean) {
    gameContext.finish({
      guessThemAll: true,

      gaveUp: gaveUp,
      totalQuestions: completeQuestions.length,
      missedAnswers: completeQuestions
        .filter((cq) => !cq.complete)
        .map((cq) => cq.completeQuestions.filter((q) => !q.correct))
        .map((qs) =>
          qs.map((q) => `${q.question}: ${q.answers[0]}`).join(' & ')
        ),
    });
  }

  // Check if all CompleteQuestions have been correctly filled out
  useEffect(() => {
    if (completeQuestions.every((p) => p.complete)) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeQuestions]);

  function taskStarted() {
    if (!gameContext.gameStatus.timeStarted) gameContext.start();
  }

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
          {completeQuestions.map((q, i) => (
            <CarouselItem
              key={i}
              className='p-0 w-full text-center flex justify-center'
            >
              <div className='m-5 max-w-xl grow'>
                <CompleteTask
                  key={i}
                  completeQuestion={q}
                  onTaskComplete={() => onTaskComplete(q)}
                  taskStarted={taskStarted}
                  title='Country'
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious style={{ display: current > 1 ? 'flex' : 'none' }} />
        <CarouselNext style={{ display: current < count ? 'flex' : 'none' }} />
      </Carousel>
      <div className='py-2 text-center text-sm text-muted-foreground mb-7'>
        Question {current} of {count}
      </div>
      <div className='flex flex-row justify-center'>
        <GiveUpDialog onGiveUp={() => finish(true)}></GiveUpDialog>
      </div>
    </>
  );
}
