'use client';

import { useState } from 'react';
import styles from './QuestionTask.module.scss';
import { isCorrect } from '@/utils';

export interface Question {
  knownMatches: string[];
  question: string;
  answers: string[];
  correct?: boolean;
  caseSensitive?: boolean;
}

interface Props {
  question: Question;
  onCorrectAnswer: (_: Question, correctAnswer: string) => void;
  onIncorrectAnswer: (_: Question, correctAnswer: string | undefined) => void;
  allowGivingUp?: boolean;
}

export default function QuestionTask({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
  allowGivingUp = true,
}: Props) {
  const [answer, setAnswer] = useState('');

  if (!question) return <>Unknown question!</>;

  function onAnswerChange(newAnswer: string) {
    setAnswer(newAnswer);
    const matchingAnswer: string | undefined = question.answers.find((a) =>
      isCorrect(newAnswer, a, question.caseSensitive)
    );

    if (matchingAnswer) {
      onCorrectAnswer(question, matchingAnswer);
      setAnswer('');
    } else onIncorrectAnswer(question, matchingAnswer);
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
        />
        {allowGivingUp ? (
          <input
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
