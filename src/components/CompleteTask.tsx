'use client';

import QuestionTask, { Question } from './QuestionTask';
import styles from './CompleteTask.module.scss';
import { useState } from 'react';

interface Props {
  knownQuestions: Question[];
  questions: Question[];
  title: string;
}

export default function CompleteTask({
  knownQuestions,
  questions,
  title,
}: Props) {
  const [allCorrect, setAllCorrect] = useState(false);

  function onCorrectAnswer(q: Question) {
    q.correct = true;
    setAllCorrect(questions.every((q) => q.correct));
  }

  function onIncorrectAnswer(q: Question) {
    q.correct = false;
    setAllCorrect(false);
  }

  return (
    <div
      className={`${styles.completeTask} ${allCorrect ? styles.allCorrect : ''}`}
    >
      <h1 className={styles.title}>{title}</h1>
      {knownQuestions.map((q) => (
        <div key={q.question}>
          {q.question}: {q.answers[0]}
        </div>
      ))}

      {questions.map((q) => (
        <QuestionTask
          key={q.question}
          question={q}
          onCorrectAnswer={onCorrectAnswer}
          onIncorrectAnswer={onIncorrectAnswer}
        />
      ))}
    </div>
  );
}
