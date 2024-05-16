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
  onTaskStarted?: () => void;
}

export default function CompleteTask({
  completeQuestion,
  title,
  onTaskComplete: onAllComplete,
  onTaskStarted,
}: Props) {
  const [taskQuestions, setTaskQuestions] = useState<Question[]>(
    completeQuestion.completeQuestions
  );

  // Check if all questions have been correctly guessed
  useEffect(() => {
    setTaskQuestions(completeQuestion.completeQuestions);
  }, [completeQuestion]);

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (completeQuestion.complete) return;
    if (
      onAllComplete &&
      taskQuestions.length > 0 &&
      taskQuestions.every((q) => q.correct)
    )
      onAllComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskQuestions]);

  function onQuestionStarted() {
    if (onTaskStarted) onTaskStarted();
  }

  function onCorrectAnswer(question: Question) {
    setTaskQuestions(
      taskQuestions.map((q) => (q === question ? { ...q, correct: true } : q))
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
        <div className='my-1' key={i}>
          {q.imageUrl ? (
            <div>Cannot guess images yet</div>
          ) : (
            <QuestionTask
              question={q}
              onQuestionStarted={onQuestionStarted}
              onCorrectAnswer={onCorrectAnswer}
              focused={
                q.question === taskQuestions.find((q) => !q.correct)?.question
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
