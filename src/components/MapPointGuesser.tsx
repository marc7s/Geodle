'use client';

import { Colors } from '@/colors';
import { MapConfig } from '@/utils';
import { Map, Marker, Overlay, Point } from 'pigeon-maps';
import styles from './MapPointGuesser.module.scss';
import { useState } from 'react';
import QuestionTask, { Question } from './QuestionTask';
import { MapStyle, stadiamaps } from '@/mapProviders';
import { isMobile } from 'react-device-detect';

export interface PointInfo {
  position: Point;
  answers: string[];
  title?:
    | string
    | {
        completed: string;
        notCompleted?: string;
      };
  complete: boolean;
}

interface Props {
  points: PointInfo[];
  config: MapConfig;
  style: MapStyle;
  stadiaMapsAPIKey?: string;
  markerWidth?: number;
}

export default function MapPointGuesser(props: Props) {
  const [marked, setMarked] = useState<PointInfo[]>([]);
  const [hovered, setHovered] = useState<PointInfo>();
  const [points, setPoints] = useState<PointInfo[]>(props.points);

  const question: Question = {
    knownMatches: [],
    question: 'Enter the name of a capital',
    answers: props.points
      .map((p) => p.answers)
      .reduce(
        (totAnswers, pointAnswers) => totAnswers.concat(pointAnswers),
        []
      ),
  };

  function handleCorrectGuess(_: Question, correctAnswer: string) {
    const pointInfo: PointInfo | undefined = points.find((p) =>
      p.answers.includes(correctAnswer)
    );
    if (!pointInfo) return;

    setPoints(
      points.map((p) => (p === pointInfo ? { ...p, complete: true } : p))
    );
  }

  function getPointInfoTitle(pointInfo: PointInfo): string | undefined {
    if (!pointInfo.title) return undefined;

    if (typeof pointInfo.title === 'string') return pointInfo.title;

    if (pointInfo.complete) return pointInfo.title.completed;

    return pointInfo.title.notCompleted;
  }

  function renderTitle(pointInfo: PointInfo) {
    const title: string | undefined = getPointInfoTitle(pointInfo);
    if (!title) return <></>;

    return (
      <div
        className={styles.markerTitle}
        style={{
          display:
            hovered === pointInfo || marked.includes(pointInfo)
              ? 'block'
              : 'none',
        }}
      >
        {title}
      </div>
    );
  }

  function mark(pointInfo: PointInfo) {
    setMarked([...marked, pointInfo]);
  }

  function unmarkAll() {
    setMarked([]);
  }

  return (
    <div className='flex-col items-center justify-center'>
      <div>
        <Map
          height={800}
          width={800}
          defaultCenter={props.config.position}
          defaultZoom={props.config.zoom}
          maxZoom={30}
          onClick={unmarkAll}
          provider={stadiamaps(props.style, props.stadiaMapsAPIKey)}
        >
          {points.map((pi, i) => (
            <Overlay key={i} anchor={pi.position}>
              {renderTitle(pi)}
              <div className={styles.overlayContainer}>
                <Marker
                  className={styles.marker}
                  key={i}
                  width={props.markerWidth}
                  color={(pi.complete
                    ? Colors.Correct
                    : Colors.NotGuessed
                  ).toString()}
                  onMouseOver={() => {
                    // Disable on mobile, as it conflicts with the click event
                    if (!isMobile) setHovered(pi);
                  }}
                  onMouseOut={() => {
                    // Disable on mobile
                    if (!isMobile) setHovered(undefined);
                  }}
                  onClick={() => mark(pi)}
                />
              </div>
            </Overlay>
          ))}
        </Map>
      </div>
      <div>
        <QuestionTask
          question={question}
          allowGivingUp={false}
          onCorrectAnswer={handleCorrectGuess}
          onIncorrectAnswer={() => {}}
        ></QuestionTask>
      </div>
    </div>
  );
}
