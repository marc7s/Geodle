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
  correctAnswers: string[];
  imageUrl?: string;
  correct?: boolean;
  caseSensitive?: boolean;
}

interface Props {
  question: Question;
  onQuestionStarted: () => void;
  onCorrectAnswer: (_: Question, correctAnswer: string) => void;
  onIncorrectAnswer?: (_: Question, correctAnswer: string | undefined) => void;
  possibleAnswers?: string[];
  alreadyAnswered?: string[];
  focused?: boolean;
  isReusable?: boolean;
  allowGivingUp?: boolean;
}

export default function QuestionTask({
  question,
  onQuestionStarted,
  onCorrectAnswer,
  onIncorrectAnswer,
  possibleAnswers = question.correctAnswers,
  alreadyAnswered = [],
  focused = false,
  isReusable = false,
  allowGivingUp = true,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [isAlreadyAnswered, setIsAlreadyAnswered] = useState<boolean>(false);
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

    const matchingAlreadyAnswered: string | undefined = alreadyAnswered.find(
      (a) => isCorrect(newAnswer, a, question.caseSensitive)
    );
    const matchingCorrectAnswer: string | undefined =
      question.correctAnswers.find((a) =>
        isCorrect(newAnswer, a, question.caseSensitive)
      );

    setIsAlreadyAnswered(matchingAlreadyAnswered !== undefined);

    if (matchingAlreadyAnswered) {
      return;
    } else if (matchingCorrectAnswer) {
      onCorrectAnswer(question, matchingCorrectAnswer);
      setAnswer(isReusable ? '' : matchingCorrectAnswer);
      if (!isReusable) setDisabled(true);
    } else if (onIncorrectAnswer) {
      const matchingIncorrectAnswer: string | undefined = possibleAnswers.find(
        (a) => isCorrect(newAnswer, a, question.caseSensitive)
      );
      if (matchingIncorrectAnswer)
        onIncorrectAnswer(question, matchingIncorrectAnswer);
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
          className={`text-xl pl-1 ${isAlreadyAnswered ? 'text-orange-500 font-bold' : ''}`}
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
            onClick={() => onAnswerChange(question.correctAnswers[0])}
            value='Show answer'
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
