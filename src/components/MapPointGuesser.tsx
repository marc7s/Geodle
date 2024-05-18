'use client';

import { Colors } from '@/colors';
import { MapConfig } from '@/utils';
import { Map, Marker, Overlay, Point } from 'pigeon-maps';
import styles from './MapPointGuesser.module.scss';
import { useEffect, useState } from 'react';
import QuestionTask, { Question } from './QuestionTask';
import { MapStyle, stadiamaps } from '@/mapProviders';
import { isMobile } from 'react-device-detect';
import { Progress } from '@/components/ui/progress';
import GiveUpDialog from './ui/GiveUpDialog';
import { GameContext, useGameContext } from '@/context/Game';
import { PointGuesserGame } from '@/types/games';
import {
  GameParams,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { Button } from './ui/button';

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
  gameConfig: GameParams;
  markerWidth?: number;
}

export default function MapPointGuesser(props: Props) {
  const gameContext: GameContext = useGameContext();
  useEffect(() => {
    gameContext.init({ game: PointGuesserGame, params: props.gameConfig });
  }, [gameContext, props.gameConfig]);

  const [marked, setMarked] = useState<PointInfo[]>([]);
  const [hovered, setHovered] = useState<PointInfo>();
  const [points, setPoints] = useState<PointInfo[]>(props.points);
  const [center, setCenter] = useState<[number, number]>();
  const [zoom, setZoom] = useState<number>();

  function finish(gaveUp: boolean) {
    gameContext.finish({
      guessThemAll: true,

      gaveUp: gaveUp,
      totalQuestions: points.length,
      missedAnswers: points.filter((p) => !p.complete).map((p) => p.answers[0]),
    });
  }

  // Check if all points have been correctly guessed
  useEffect(() => {
    if (points.every((p) => p.complete)) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const question: Question = {
    question: `Enter the name of a marked ${formatSingularFeature(props.gameConfig.params.feature)}`,
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

  function centerOnUncompleted() {
    const notGuessed = points.find((p) => !p.complete);
    if (!notGuessed) return;
    setCenter(notGuessed.position);
    setZoom(5);
    setMarked([notGuessed]);
  }

  return (
    <div className='flex-col items-center justify-center'>
      <div>
        <Map
          height={900}
          width={900}
          defaultCenter={props.config.position}
          defaultZoom={props.config.zoom}
          center={center}
          minZoom={1}
          maxZoom={5}
          zoom={zoom}
          onClick={unmarkAll}
          provider={stadiamaps(props.style)}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
        >
          {points.map((pi, i) => (
            <Overlay key={i} anchor={pi.position}>
              {renderTitle(pi)}
              <div className={styles.overlayContainer}>
                <Marker
                  className={styles.marker}
                  key={i}
                  width={props.markerWidth}
                  color={(marked.includes(pi)
                    ? Colors.Focused
                    : pi.complete
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
      <div className='my-3 flex flex-row justify-center items-center'>
        <Progress
          value={
            (100 * points.filter((p) => p.complete).length) / points.length
          }
        />
        <div className='ml-2'>
          {points.filter((p) => p.complete).length}/{points.length}
        </div>
      </div>

      <div className='flex flex-row justify-center items-center space-x-2'>
        <QuestionTask
          question={question}
          allowGivingUp={false}
          isReusable={true}
          onQuestionStarted={gameContext.start}
          onCorrectAnswer={handleCorrectGuess}
          onIncorrectAnswer={() => {}}
        ></QuestionTask>
        <Button variant='secondary' onClick={centerOnUncompleted}>
          Locate
        </Button>
        <GiveUpDialog onGiveUp={() => finish(true)} />
      </div>
    </div>
  );
}
