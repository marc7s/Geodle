'use client';

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from './QuestionTask.module.scss';
import { isCorrect } from '@/utils';

const useFocus = (): [any, () => void] => {
  const htmlElRef: MutableRefObject<any> = useRef(null);
  const setFocus = (): void => {
    htmlElRef?.current?.focus?.();
  };

  return [htmlElRef, setFocus];
};

export interface Question {
  question: string;
  answers: string[];
  imageUrl?: string;
  correct?: boolean;
  caseSensitive?: boolean;
}

interface Props {
  question: Question;
  onQuestionStarted: () => void;
  onCorrectAnswer: (_: Question, correctAnswer: string) => void;
  onIncorrectAnswer?: (_: Question, correctAnswer: string | undefined) => void;
  focused?: boolean;
  isReusable?: boolean;
  allowGivingUp?: boolean;
}

export default function QuestionTask({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
  onQuestionStarted,
  focused = false,
  isReusable = false,
  allowGivingUp = true,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [started, setStarted] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [inputRef, setInputFocus] = useFocus();

  // Set the focus on focus change
  useEffect(() => {
    if (focused) setInputFocus();
  }, [focused, setInputFocus]);

  // Reset the state if the question changes and is not complete (the question was changed)
  useEffect(() => {
    if (question.correct) return;
    setAnswer('');
    setDisabled(false);
  }, [question]);

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
    } else if (onIncorrectAnswer) {
      onIncorrectAnswer(question, matchingAnswer);
    }
  }

  return (
    <>
      <div
        className={`${question.correct ? styles.correct : styles.incorrect} flex px-3 py-[0.5rem] rounded-lg`}
      >
        <h1 className='text-xl mr-3'>{question.question}:</h1>
        <input
          ref={inputRef}
          className='text-xl pl-1'
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
            value='Show answer'
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
