'use client';

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from './QuestionTask.module.scss';
import { isCorrect, normalizeAnswer } from '@/utils';
import { useAutoGuess } from '@/settings';

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
  // True if the correct answers are different answers (e.g. any of the missing countries),
  // false if they are alternative names for the same answer (e.g. aliases)
  multipleAnswers?: boolean;
  // Disables answering, e.g. when the game has finished
  disabled?: boolean;
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
  multipleAnswers = false,
  disabled: gameFinished = false,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [isAlreadyAnswered, setIsAlreadyAnswered] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  // After showing the answer, the button submits the answer in the field instead
  const [answerShown, setAnswerShown] = useState<boolean>(false);
  const [inputRef, setInputFocus] = useFocus();
  const [autoGuess] = useAutoGuess();

  // Set the focus on focus change
  useEffect(() => {
    if (focused) setInputFocus();
  }, [focused, setInputFocus]);

  // Reset the state if the question changes and is not complete (the question was changed)
  // Compare the content, since games recreate the question object on every render. Otherwise, the
  // first typed character would be cleared, as starting the game causes a render
  const questionKey: string = `${question.question}|${question.correctAnswers.join('|')}`;
  useEffect(() => {
    if (question.correct) return;
    setAnswer('');
    setDisabled(false);
    setAnswerShown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey, question.correct]);

  if (!question) return <>Unknown question!</>;

  // Returns true if another answer starts with the typed answer, e.g. "Dominica" and "Dominican Republic"
  // Then the answer is only submitted when pressing Enter, so the longer answer can still be typed
  function isAmbiguous(typedAnswer: string): boolean {
    const typed: string = normalizeAnswer(typedAnswer, question.caseSensitive);
    const answered: Set<string> = new Set(
      alreadyAnswered.map((a) => normalizeAnswer(a, question.caseSensitive))
    );
    const correct: Set<string> = new Set(
      question.correctAnswers.map((a) =>
        normalizeAnswer(a, question.caseSensitive)
      )
    );

    // Alternative names for the same answer lead to the same result, so they are not ambiguous
    const candidates: string[] = (
      multipleAnswers
        ? [...question.correctAnswers, ...possibleAnswers]
        : possibleAnswers
    )
      .map((a) => normalizeAnswer(a, question.caseSensitive))
      .filter((a) => multipleAnswers || !correct.has(a) || !correct.has(typed));

    return candidates.some(
      (c) => c !== typed && c.startsWith(typed) && !answered.has(c)
    );
  }

  function onAnswerChange(newAnswer: string) {
    setAnswer(newAnswer);
    if (!started) onQuestionStarted();
    setStarted(true);
    // Without auto-guessing, answers are only submitted by pressing Enter
    if (autoGuess) submitAnswer(newAnswer, false);
    // Typing changes the answer, so it is no longer a previous guess until it is checked again
    else setIsAlreadyAnswered(false);
  }

  // Checks the answer, and handles it if it matches
  // While typing, ambiguous answers are not submitted. Pressing Enter (`force`) submits them
  function submitAnswer(newAnswer: string, force: boolean) {
    if (gameFinished) return;
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
    } else if (!force && isAmbiguous(newAnswer)) {
      return;
    } else if (matchingCorrectAnswer) {
      onCorrectAnswer(question, matchingCorrectAnswer);
      setAnswer(isReusable ? '' : matchingCorrectAnswer);
      if (!isReusable) setDisabled(true);
    } else if (onIncorrectAnswer) {
      const matchingIncorrectAnswer: string | undefined = possibleAnswers.find(
        (a) => isCorrect(newAnswer, a, question.caseSensitive)
      );
      if (matchingIncorrectAnswer) {
        onIncorrectAnswer(question, matchingIncorrectAnswer);
        setIsAlreadyAnswered(true);
      }
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
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitAnswer(answer, true);
          }}
          disabled={disabled || gameFinished}
        />
        {allowGivingUp ? (
          <input
            className='ml-2 cursor-pointer'
            type='button'
            tabIndex={-1}
            disabled={disabled || gameFinished}
            onClick={() => {
              if (answerShown) return submitAnswer(answer, true);
              // Only fill in the answer, so it can be read before it is submitted
              if (!started) onQuestionStarted();
              setStarted(true);
              setAnswer(question.correctAnswers[0]);
              setAnswerShown(true);
              setInputFocus();
            }}
            value={answerShown ? 'Submit' : 'Show answer'}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
