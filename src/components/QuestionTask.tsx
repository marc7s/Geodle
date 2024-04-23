'use client';

import { useState } from 'react';
import styles from './QuestionTask.module.scss';

export interface Question {
  knownMatches: string[];
  question: string;
  answers: string[];
  correct?: boolean;
  caseSensitive?: boolean;
}

interface Props {
  question: Question;
  onCorrectAnswer: (_: Question) => void;
  onIncorrectAnswer: (_: Question) => void;
}

export default function QuestionTask({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Props) {
  const [answer, setAnswer] = useState('');

  if (!question) return <>Unknown question!</>;

  const answers: string[] = question.caseSensitive
    ? question.answers
    : question.answers.map((a) => a.toLocaleLowerCase());

  function onAnswerChange(newAnswer: string) {
    setAnswer(newAnswer);
    if (
      answers.includes(
        question.caseSensitive ? newAnswer : newAnswer.toLocaleLowerCase()
      )
    )
      onCorrectAnswer(question);
    else onIncorrectAnswer(question);
  }

  return (
    <>
      <div className={question.correct ? styles.correct : styles.incorrect}>
        {question.question}:
        <input
          type='text'
          value={answer}
          onChange={(event) => {
            onAnswerChange(event.target.value);
          }}
        />
        <input
          type='button'
          tabIndex={-1}
          onClick={() => onAnswerChange(question.answers[0])}
          value='Give up'
        />
      </div>
    </>
  );
}
