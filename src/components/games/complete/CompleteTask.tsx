'use client';

import QuestionTask, { Question } from '../../QuestionTask';
import styles from './CompleteTask.module.scss';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  knownQuestions: Question[];
  questions: Question[];
  title: string;
  onAllComplete?: () => void;
}

export default function CompleteTask({
  knownQuestions,
  questions,
  title,
  onAllComplete,
}: Props) {
  const [taskQuestions, setTaskQuestions] = useState<Question[]>(questions);

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (onAllComplete && taskQuestions.every((q) => q.correct)) onAllComplete();
  }, [taskQuestions, onAllComplete]);

  function onCorrectAnswer(question: Question) {
    setTaskQuestions(
      taskQuestions.map((q) => (q === question ? { ...q, correct: true } : q))
    );
  }

  function onIncorrectAnswer(question: Question) {
    setTaskQuestions(
      taskQuestions.map((q) => (q === question ? { ...q, correct: false } : q))
    );
  }

  return (
    <div
      className={`${styles.completeTask} ${taskQuestions.every((q) => q.correct) ? styles.allCorrect : ''}`}
    >
      <h1 className={styles.title}>{title}</h1>
      {knownQuestions.map((q, i) => (
        <div key={i}>
          {q.imageUrl ? (
            <div className='flex justify-center'>
              <Image
                width={0}
                height={0}
                className='h-20 w-auto'
                src={q.imageUrl}
                alt='Image'
              />
            </div>
          ) : (
            <>
              {q.question}: {q.answers[0]}
            </>
          )}
        </div>
      ))}

      {taskQuestions.map((q, i) => (
        <div className='my-2' key={i}>
          {q.imageUrl ? (
            <div>Cannot guess images yet</div>
          ) : (
            <QuestionTask
              question={q}
              onQuestionStarted={() => {}}
              onCorrectAnswer={onCorrectAnswer}
              onIncorrectAnswer={onIncorrectAnswer}
            />
          )}
        </div>
      ))}
    </div>
  );
}
