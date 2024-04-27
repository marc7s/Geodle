'use client';

import { useState } from 'react';
import styles from './QuestionTask.module.scss';
import { isCorrect } from '@/utils';

export interface Question {
  knownMatches: string[];
  question: string;
  answers: string[];
  imageUrl?: string;
  correct?: boolean;
  caseSensitive?: boolean;
}

interface Props {
  question: Question;
  onCorrectAnswer: (_: Question, correctAnswer: string) => void;
  onIncorrectAnswer: (_: Question, correctAnswer: string | undefined) => void;
  onQuestionStarted: () => void;
  isReusable?: boolean;
  allowGivingUp?: boolean;
}

export default function QuestionTask({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
  onQuestionStarted,
  isReusable = false,
  allowGivingUp = true,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [started, setStarted] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  if (!question) return <>Unknown question!</>;

  function onAnswerChange(newAnswer: string) {
    setAnswer(newAnswer);
    if (!started) onQuestionStarted();
    setStarted(true);
    const matchingAnswer: string | undefined = question.answers.find((a) =>
      isCorrect(newAnswer, a, question.caseSensitive)
    );

    if (matchingAnswer) {
      onCorrectAnswer(question, matchingAnswer);
      setAnswer(isReusable ? '' : matchingAnswer);
      if (!isReusable) setDisabled(true);
    } else {
      onIncorrectAnswer(question, matchingAnswer);
    }
  }

  return (
    <>
      <div
        className={`${question.correct ? styles.correct : styles.incorrect} flex`}
      >
        <h1 className='text-xl mr-3'>{question.question}:</h1>
        <input
          className='text-xl'
          type='text'
          value={answer}
          onChange={(event) => {
            onAnswerChange(event.target.value);
          }}
          disabled={disabled}
        />
        {allowGivingUp ? (
          <input
            className='ml-2 cursor-pointer'
            type='button'
            tabIndex={-1}
            onClick={() => onAnswerChange(question.answers[0])}
            value='Give up'
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
