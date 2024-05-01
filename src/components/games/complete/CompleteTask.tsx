'use client';

import QuestionTask, { Question } from '../../QuestionTask';
import styles from './CompleteTask.module.scss';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CompleteQuestion } from './CompleteGuesser';

interface Props {
  completeQuestion: CompleteQuestion;
  title: string;
  onTaskComplete?: () => void;
  taskStarted?: () => void;
}

export default function CompleteTask({
  completeQuestion,
  title,
  onTaskComplete: onAllComplete,
  taskStarted,
}: Props) {
  const [taskQuestions, setTaskQuestions] = useState<Question[]>(
    completeQuestion.completeQuestions
  );

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (completeQuestion.complete) return;
    if (
      onAllComplete &&
      taskQuestions.length > 0 &&
      taskQuestions.every((q) => q.correct)
    )
      onAllComplete();
  }, [taskQuestions, onAllComplete, completeQuestion.complete]);

  function onQuestionStarted() {
    if (taskStarted) taskStarted();
  }

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
      {completeQuestion.knownQuestions.map((q, i) => (
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
              onQuestionStarted={onQuestionStarted}
              onCorrectAnswer={onCorrectAnswer}
              onIncorrectAnswer={onIncorrectAnswer}
            />
          )}
        </div>
      ))}
    </div>
  );
}
