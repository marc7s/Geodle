'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { CompleterGame, Game, games } from '@/types/games';
import {
  Attribute,
  CompleteGameParams,
  CountrySelection,
  Feature,
  GameMode,
  GameParams,
  countrySelections,
  gameModes,
} from '@/types/routing/dynamicParams';
import { GameRegion, gameRegions } from '@/types/routing/generated/regions';
import { capitalize } from '@/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ConfigOption<T> {
  value: T;
  display: string;
}

interface Props {
  isPopup?: boolean;
  fixedGame?: Game;
  gameParams?: GameParams;
}
export default function GameBuilder(props: Props) {
  const [game, setGame] = useState<Game>();
  const [loaded, setLoaded] = useState<boolean>(props.gameParams === undefined);
  const [gamemode, setGamemode] = useState<GameMode>();
  const [region, setRegion] = useState<GameRegion>();
  const [selection, setSelection] = useState<CountrySelection>();
  const [feature, setFeature] = useState<Feature>();
  const [knownAttributes, setKnownAttributes] = useState<Attribute[]>([]);
  const [guessAttributes, setGuessAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    setGame(props.fixedGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fixedGame]);

  // Preselect the options if GameParams were passed
  useEffect(() => {
    if (!props.gameParams) return;
    setGamemode(props.gameParams.params.gamemode);
    setRegion(props.gameParams.params.region);
    setSelection(props.gameParams.params.selection);
    setFeature(props.gameParams.params.feature);

    // Preselect CompleterGame parameters
    const completeGameParams = props.gameParams.params as CompleteGameParams;

    if (completeGameParams.guessAttributes) {
      const guessAttrs: Attribute[] = [];
      CompleterGame.decodeAttributes(
        completeGameParams.guessAttributes
      ).forEach((ga) => {
        const attr = CompleterGame.allowedGuessAttributes.find(
          (aga) => aga === ga
        );
        if (attr) guessAttrs.push(attr);
      });

      setGuessAttributes(guessAttrs);
    }

    if (completeGameParams.knownAttributes) {
      const knownAttrs: Attribute[] = [];
      CompleterGame.decodeAttributes(
        completeGameParams.knownAttributes
      ).forEach((ka) => {
        const attr = CompleterGame.allowedKnownAttributes.find(
          (aka) => aka === ka
        );
        if (attr) knownAttrs.push(attr);
      });

      setKnownAttributes(knownAttrs);
    }

    setLoaded(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.gameParams]);

  useEffect(() => {
    // Only apply this effect if we have loaded the preselections
    if (!loaded) return;
    setGuessAttributes(
      guessAttributes.filter((ga) => !knownAttributes.includes(ga))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownAttributes]);

  const gameOptions: ConfigOption<Game>[] = games.map((v) => {
    return { value: v, display: capitalize(v.displayName) };
  });

  const gameModeOptions: ConfigOption<GameMode>[] = gameModes.map((v) => {
    return { value: v, display: capitalize(v) };
  });

  const regionOptions: ConfigOption<GameRegion>[] = gameRegions.map((v) => {
    return { value: v, display: capitalize(v) };
  });

  const selectionOptions: ConfigOption<CountrySelection>[] =
    countrySelections.map((v) => {
      return { value: v, display: capitalize(v) };
    });

  const featureOptions: ConfigOption<Feature>[] | undefined =
    game?.allowedFeatures.map((v) => {
      return { value: v, display: capitalize(v) };
    });

  function select<T>(
    display: string,
    options: { value: T; display: string }[],
    setter: (t: T) => void
  ) {
    const option = options.find((o) => o.display === display);
    if (!option) return;
    setter(option.value);
  }

  return (
    <div className='flex flex-col items-center'>
      {!props.isPopup && (
        <>
          <div className='text-3xl text-center mb-4'>Game builder</div>
          <div className='mb-12 text-center'>
            Configure your game the way you want to play it, and then grab the
            generated link to start playing
          </div>
        </>
      )}
      <div className='flex flex-col justify-center items-center space-y-10'>
        {!props.fixedGame && (
          <BuilderParameter
            name='Game'
            description='The minigame to play'
            parameters={gameOptions.map((o) => o.display)}
            onParamChange={(val) => select<Game>(val, gameOptions, setGame)}
          />
        )}
        {game && (
          <>
            <BuilderParameter
              name='Game Mode'
              description='Daily or Training'
              parameters={gameModeOptions.map((o) => o.display)}
              onParamChange={(val) =>
                select<GameMode>(val, gameModeOptions, setGamemode)
              }
              preselection={
                gameModeOptions.find(
                  (o) =>
                    props.gameParams &&
                    o.value === props.gameParams.params.gamemode
                )?.display
              }
            />

            <BuilderParameter
              name='Region'
              description='The region of the world the answers will be located in'
              parameters={regionOptions.map((gr) => gr.display)}
              onParamChange={(val) =>
                select<GameRegion>(val, regionOptions, setRegion)
              }
              preselection={
                regionOptions.find(
                  (o) =>
                    props.gameParams &&
                    o.value === props.gameParams.params.region
                )?.display
              }
            />

            <BuilderParameter
              name='Country selection'
              description='The selection of countries to include'
              parameters={selectionOptions.map((o) => o.display)}
              onParamChange={(val) =>
                select(val, selectionOptions, setSelection)
              }
              preselection={
                selectionOptions.find(
                  (o) =>
                    props.gameParams &&
                    o.value === props.gameParams.params.selection
                )?.display
              }
            />

            {featureOptions && (
              <BuilderParameter
                name='Feature'
                description='The feature of a country to guess'
                parameters={featureOptions.map((o) => o.display)}
                onParamChange={(val) => select(val, featureOptions, setFeature)}
                preselection={
                  featureOptions.find(
                    (o) =>
                      props.gameParams &&
                      o.value === props.gameParams.params.feature
                  )?.display
                }
              />
            )}

            {game === CompleterGame && (
              <div className='flex flex-col items-center'>
                <div className='text-center text-xl mb-1'>Known attributes</div>
                <div className='text-center text-s mb-1'>
                  The information you will be presented with
                </div>
                <div className='flex flex-col items-start space-y-2'>
                  {CompleterGame.allowedKnownAttributes.map((ka) => (
                    <div key={ka} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={knownAttributes.includes(ka)}
                        onCheckedChange={(checked) =>
                          checked
                            ? setKnownAttributes([...knownAttributes, ka])
                            : setKnownAttributes(
                                knownAttributes.filter((a) => a !== ka)
                              )
                        }
                      />
                      <label className='text-sm font-medium leading-none capitalize'>
                        {ka}
                      </label>
                    </div>
                  ))}
                </div>

                <div className='text-center text-xl mb-1 mt-10'>
                  Guess attributes
                </div>
                <div className='text-center text-s mb-1'>
                  The information you will have to guess
                </div>
                <div className='flex flex-col items-start space-y-2'>
                  {CompleterGame.allowedGuessAttributes.map((ca) => (
                    <div key={ca} className='flex items-center space-x-2'>
                      <Checkbox
                        disabled={knownAttributes.includes(ca)}
                        checked={guessAttributes.includes(ca)}
                        onCheckedChange={(checked) =>
                          checked
                            ? setGuessAttributes([...guessAttributes, ca])
                            : setGuessAttributes(
                                guessAttributes.filter((a) => a !== ca)
                              )
                        }
                      />
                      <label className='text-sm font-medium leading-none capitalize'>
                        {ca}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className='mt-12'>
        {game &&
        gamemode &&
        region &&
        selection &&
        feature &&
        (game !== CompleterGame ||
          (knownAttributes.length > 0 && guessAttributes.length > 0)) ? (
          <Link
            className='text-xl'
            target={props.isPopup ? undefined : '_blank'}
            href={
              game === CompleterGame
                ? CompleterGame.getCompleterHref({
                    gamemode: gamemode,
                    region: region,
                    selection: selection,
                    feature: feature,
                    knownAttributes: knownAttributes.join(
                      CompleterGame.separator
                    ),
                    guessAttributes: guessAttributes.join(
                      CompleterGame.separator
                    ),
                  })
                : game.getHref({
                    params: {
                      gamemode: gamemode,
                      region: region,
                      selection: selection,
                      feature: feature,
                    },
                  })
            }
          >
            <Button variant={'secondary'}>
              Click to play your configurated game
            </Button>
          </Link>
        ) : (
          <>Complete all selections to get the link</>
        )}
      </div>
    </div>
  );
}

function BuilderParameter(props: {
  name: string;
  description: string;
  parameters: string[];
  onParamChange: (p: string) => void;
  preselection?: string;
}) {
  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='text-center text-xl mb-1'>{props.name}</div>
      <div className='text-center text-s mb-1'>{props.description}</div>
      <Select
        onValueChange={props.onParamChange}
        defaultValue={props.preselection}
      >
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder={''} className='text-white' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{props.name}</SelectLabel>
            {props.parameters.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
