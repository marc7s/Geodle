'use client';

import { Colors } from '@/colors';
import { MapConfig } from '@/utils';
import { Map, Marker, Overlay, Point } from 'pigeon-maps';
import styles from './MapPointGuesser.module.scss';
import { useEffect, useState } from 'react';
import QuestionTask, { Question } from './QuestionTask';
import { MapStyle, stadiamaps } from '@/mapProviders';
import { isMobile } from 'react-device-detect';
import CompletedDialog, {
  CompletedResult,
  DialogAction,
} from './ui/CompletedDialog';
import GiveUpDialog from './ui/GiveUpDialog';

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

interface Status {
  timeStarted?: number;
  done: boolean;
  gaveUp?: boolean;
}

export default function MapPointGuesser(props: Props) {
  const [marked, setMarked] = useState<PointInfo[]>([]);
  const [hovered, setHovered] = useState<PointInfo>();
  const [points, setPoints] = useState<PointInfo[]>(props.points);
  const [status, setStatus] = useState<Status>({ done: false, gaveUp: false });

  function finish(gaveUp: boolean) {
    setStatus({ ...status, done: true, gaveUp: gaveUp });
  }

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (points.every((p) => p.complete)) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

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

  const completedActions: DialogAction[] = [
    {
      title: 'Go again',
      onClicked: () => location.reload(),
    },
  ];

  function handleCorrectGuess(_: Question, correctAnswer: string) {
    const pointInfo: PointInfo | undefined = points.find((p) =>
      p.answers.includes(correctAnswer)
    );
    if (!pointInfo) return;

    setPoints(
      points.map((p) => (p === pointInfo ? { ...p, complete: true } : p))
    );
  }

  function generateDescription(): string {
    if (!status.gaveUp) return 'Great job! Here are your statistics:';

    // Get all missed points
    const missedPoints: PointInfo[] = points.filter((p) => !p.complete);

    // Get a limited list of the missed answers to print
    const missedAnswers: string[] = missedPoints
      .slice(0, 15) // Limit the list
      .map((p) => p.answers[0]); // Get the first answer for each point

    const limitedMissingCount: number =
      missedPoints.length - missedAnswers.length;

    return `Here are ${limitedMissingCount > 0 ? 'some of ' : ''}the ones you missed:\n\n${missedAnswers.join(', ')}${limitedMissingCount > 0 ? `... (and ${limitedMissingCount} more)` : ''}`;
  }

  function generateResults(): CompletedResult {
    return {
      timeElapsedMS: status.timeStarted ? Date.now() - status.timeStarted : NaN,
      correct: points.filter((p) => p.complete).length,
      total: points.length,
    };
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
          onQuestionStarted={() => {
            setStatus({ ...status, timeStarted: Date.now() });
          }}
          onCorrectAnswer={handleCorrectGuess}
          onIncorrectAnswer={() => {}}
        ></QuestionTask>
      </div>
      <div className='flex flex-row justify-end'>
        <GiveUpDialog onGiveUp={() => finish(true)}></GiveUpDialog>
      </div>

      <CompletedDialog
        show={status.done}
        title={status.gaveUp ? 'Nice try!' : undefined}
        description={generateDescription()}
        actions={completedActions}
        results={generateResults()}
        onClose={() =>
          setStatus({ timeStarted: undefined, done: false, gaveUp: false })
        }
      ></CompletedDialog>
    </div>
  );
}
