import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  useMutation,
} from '@apollo/client';
import Styled from './styles';
import GET_TIMER, { GetTimerResponse, TimerData } from '../../../core/graphql/queries/timer';
import logger from '/imports/startup/client/logger';
import { layoutDispatch } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import {
  TIMER_ACTIVATE,
  TIMER_DEACTIVATE,
  TIMER_RESET,
  TIMER_SET_SONG_TRACK,
  TIMER_SET_TIME,
  TIMER_START,
  TIMER_STOP,
  TIMER_SWITCH_MODE,
} from '../mutations';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const MAX_HOURS = 23;
const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

const TRACKS = [
  'noTrack',
  'track1',
  'track2',
  'track3',
];

const intlMessages = defineMessages({
  hideTimerLabel: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Label for hiding timer button',
  },
  title: {
    id: 'app.timer.title',
    description: 'Title for timer',
  },
  stopwatch: {
    id: 'app.timer.button.stopwatch',
    description: 'Stopwatch switch button',
  },
  timer: {
    id: 'app.timer.button.timer',
    description: 'Timer switch button',
  },
  start: {
    id: 'app.timer.button.start',
    description: 'Timer start button',
  },
  stop: {
    id: 'app.timer.button.stop',
    description: 'Timer stop button',
  },
  reset: {
    id: 'app.timer.button.reset',
    description: 'Timer reset button',
  },
  deactivate: {
    id: 'app.timer.button.deactivate',
    description: 'Timer deactivate button',
  },
  hours: {
    id: 'app.timer.hours',
    description: 'Timer hours label',
  },
  minutes: {
    id: 'app.timer.minutes',
    description: 'Timer minutes label',
  },
  seconds: {
    id: 'app.timer.seconds',
    description: 'Timer seconds label',
  },
  songs: {
    id: 'app.timer.songs',
    description: 'Musics title label',
  },
  noTrack: {
    id: 'app.timer.noTrack',
    description: 'No music radio label',
  },
  track1: {
    id: 'app.timer.track1',
    description: 'Track 1 radio label',
  },
  track2: {
    id: 'app.timer.track2',
    description: 'Track 2 radio label',
  },
  track3: {
    id: 'app.timer.track3',
    description: 'Track 3 radio label',
  },
});

interface TimerPanelProps extends Omit<TimerData, 'elapsed'> {
  timePassed: number;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  stopwatch,
  songTrack,
  time,
  running,
  timePassed,
  startedOn,
  active,
}) => {
  const [timerReset] = useMutation(TIMER_RESET);
  const [timerStart] = useMutation(TIMER_START);
  const [timerStop] = useMutation(TIMER_STOP);
  const [timerSwitchMode] = useMutation(TIMER_SWITCH_MODE);
  const [timerSetSongTrack] = useMutation(TIMER_SET_SONG_TRACK);
  const [timerSetTime] = useMutation(TIMER_SET_TIME);
  const [timerDeactivate] = useMutation(TIMER_DEACTIVATE);

  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();

  const [runningTime, setRunningTime] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const [displayHours, setDisplayHours] = useState(0);
  const [displayMinutes, setDisplayMinutes] = useState(0);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [focusedUnit, setFocusedUnit] = useState<'hours' | 'minutes' | 'seconds'>('seconds');
  const [lastSelectedTrack, setLastSelectedTrack] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialTime, setInitialTime] = useState(time);

  useEffect(() => {
    setInitialTime(time);
  }, [time]);

  useEffect(() => {
    if (songTrack && songTrack !== 'noTrack') {
      setLastSelectedTrack(songTrack);
    }
  }, [songTrack]);

  useEffect(() => {
    const timeInSeconds = Math.floor(time / 1000);
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = timeInSeconds % 60;

    setDisplayHours(h);
    setDisplayMinutes(m);
    setDisplaySeconds(s);
  }, [time]);

  useEffect(() => {
    if (running && !isEditing) {
      const timeInSeconds = Math.max(0, Math.floor(runningTime / 1000));
      const h = Math.floor(timeInSeconds / 3600);
      const m = Math.floor((timeInSeconds % 3600) / 60);
      const s = timeInSeconds % 60;

      setDisplayHours(h);
      setDisplayMinutes(m);
      setDisplaySeconds(s);
    }
  }, [runningTime, running, isEditing]);

  const headerMessage = useMemo(() => {
    return stopwatch ? intlMessages.stopwatch : intlMessages.timer;
  }, [stopwatch]);

  const switchTimer = (stopwatch: boolean) => {
    timerSwitchMode({ variables: { stopwatch } });
  };

  const setTrack = (track: string) => {
    timerSetSongTrack({ variables: { track } });
  };

  const handleMusicSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = event.target.checked;
    if (isEnabled) {
      setTrack(lastSelectedTrack || 'track1');
    } else {
      setTrack('noTrack');
    }
  };

  const syncTimeWithBackend = useCallback(() => {
    const newTimeInMillis = (displayHours * MILLI_IN_HOUR)
      + (displayMinutes * MILLI_IN_MINUTE)
      + (displaySeconds * MILLI_IN_SECOND);

    if (newTimeInMillis !== time) {
      timerSetTime({ variables: { time: newTimeInMillis } });
    }
  }, [displayHours, displayMinutes, displaySeconds, time, timerSetTime]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    setDisplayHours(Math.max(0, Math.min(value, MAX_HOURS)));
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    setDisplayMinutes(Math.max(0, Math.min(value, 59)));
  };

  const handleSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    setDisplaySeconds(Math.max(0, Math.min(value, 59)));
  };

  const changeTime = useCallback((amountInSeconds: number) => {
    if (running) return;

    const currentTimeInSeconds = (displayHours * 3600) + (displayMinutes * 60) + displaySeconds;
    let newTotalSeconds = currentTimeInSeconds + amountInSeconds;

    const maxSeconds = (MAX_HOURS * 3600) + (59 * 60) + 59;
    newTotalSeconds = Math.max(0, Math.min(newTotalSeconds, maxSeconds));

    const h = Math.floor(newTotalSeconds / 3600);
    const m = Math.floor((newTotalSeconds % 3600) / 60);
    const s = newTotalSeconds % 60;

    setDisplayHours(h);
    setDisplayMinutes(m);
    setDisplaySeconds(s);
  }, [running, displayHours, displayMinutes, displaySeconds]);

  const handleIncrement = useCallback(() => {
    let incrementAmount = 1;
    if (focusedUnit === 'minutes') incrementAmount = 60;
    if (focusedUnit === 'hours') incrementAmount = 3600;
    changeTime(incrementAmount);
  }, [focusedUnit, changeTime]);

  const handleDecrement = useCallback(() => {
    let decrementAmount = -1;
    if (focusedUnit === 'minutes') decrementAmount = -60;
    if (focusedUnit === 'hours') decrementAmount = -3600;
    changeTime(decrementAmount);
  }, [focusedUnit, changeTime]);

  const closePanel = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, []);

  const handleDeactivate = useCallback(() => {
    timerDeactivate();
    closePanel();
  }, [timerDeactivate, closePanel]);

  const handleReset = useCallback(() => {
    timerStop();
    timerReset();
    setIsEditing(false);
    if (stopwatch) {
      setRunningTime(0);
    } else {
      setRunningTime(initialTime);

      const timeInSeconds = Math.floor(initialTime / 1000);
      const h = Math.floor(timeInSeconds / 3600);
      const m = Math.floor((timeInSeconds % 3600) / 60);
      const s = timeInSeconds % 60;
      setDisplayHours(h);
      setDisplayMinutes(m);
      setDisplaySeconds(s);
    }
  }, [initialTime, stopwatch, timerStop, timerReset]);

  useEffect(() => {
    setRunningTime(timePassed);
  }, []);

  useEffect(() => {
    if (!running) {
      setRunningTime(timePassed);
    }
    if (startedOn === 0) {
      setRunningTime(timePassed);
    }
  }, [startedOn, timePassed, running]);

  useEffect(() => {
    if (running) {
      setRunningTime(timePassed < 0 ? 0 : timePassed);
      intervalRef.current = setInterval(() => {
        setRunningTime((prev) => {
          const calcTime = (Math.round(prev / 1000) * 1000);
          if (stopwatch) {
            return (calcTime < 0 ? 0 : calcTime) + 1000;
          }
          const t = (calcTime) - 1000;
          return t < 0 ? 0 : t;
        });
      }, 1000);
    } else if (!running) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const serverTime = timePassed >= 0 ? timePassed : 0;
    setRunningTime((prev) => {
      if (Math.abs(serverTime - prev) > 2000) return serverTime;
      return prev;
    });
  }, [timePassed, stopwatch, startedOn]);

  useEffect(() => {
    if (!active) {
      closePanel();
    }
  }, [active]);

  const timerMusicOptions = useMemo(() => {
    const TIMER_CONFIG = window.meetingClientSettings.public.timer;
    if (!TIMER_CONFIG.music.enabled) return null;

    return (
      <Styled.TimerSongsWrapper>
        <Styled.MusicSwitchLabel
          control={(
            <Styled.MaterialSwitch
              checked={(songTrack !== 'noTrack') && !stopwatch}
              onChange={handleMusicSwitchChange}
              disabled={running || stopwatch}
            />
          )}
          label={intl.formatMessage(intlMessages.songs)}
        />
        {(songTrack !== 'noTrack' && !stopwatch) && (
          <Styled.TimerTracks>
            {TRACKS.map((track) => {
              if (track === 'noTrack') return null;
              return (
                <Styled.TimerTrackItem key={track}>
                  <label htmlFor={track}>
                    <input
                      type="radio"
                      name="track"
                      id={track}
                      value={track}
                      checked={songTrack === track}
                      onChange={(event) => setTrack(event.target.value)}
                      disabled={running || stopwatch}
                    />
                    {intl.formatMessage(intlMessages[track as keyof typeof intlMessages])}
                  </label>
                </Styled.TimerTrackItem>
              );
            })}
          </Styled.TimerTracks>
        )}
      </Styled.TimerSongsWrapper>
    );
  }, [songTrack, stopwatch, running]);

  const isPaused = !running && (stopwatch ? runningTime > 0 : runningTime < time);

  let controlButtons;
  if (running) {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ResetButton
          color="secondary"
          label={intl.formatMessage(intlMessages.reset)}
          onClick={handleReset}
          data-test="resetTimerStopWatch"
        />
        <Styled.ControlButton
          color="danger"
          label={intl.formatMessage(intlMessages.stop)}
          onClick={timerStop}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  } else if (isPaused) {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ResetButton
          color="secondary"
          label={intl.formatMessage(intlMessages.reset)}
          onClick={handleReset}
          data-test="resetTimerStopWatch"
        />
        <Styled.ControlButton
          color="primary"
          label={intl.formatMessage(intlMessages.start)}
          onClick={timerStart}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  } else {
    controlButtons = (
      <Styled.ButtonRow>
        <Styled.ControlButton
          color="primary"
          label={intl.formatMessage(intlMessages.start)}
          onClick={() => {
            if (!stopwatch) {
              const newStartTime = (displayHours * MILLI_IN_HOUR)
                + (displayMinutes * MILLI_IN_MINUTE)
                + (displaySeconds * MILLI_IN_SECOND);

              setInitialTime(newStartTime);

              if (newStartTime !== time) {
                timerSetTime({ variables: { time: newStartTime } });
              }
            }
            timerStart();
          }}
          data-test="startStopTimer"
        />
      </Styled.ButtonRow>
    );
  }

  return (
    <>
      <Styled.HeaderContainer
        title={intl.formatMessage(intlMessages.title)}
        leftButtonProps={{
          onClick: closePanel,
          'aria-label': intl.formatMessage(intlMessages.hideTimerLabel, { 0: intl.formatMessage(headerMessage) }),
          label: intl.formatMessage(headerMessage),
        }}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.hideTimerLabel, { 0: intl.formatMessage(intlMessages.timer) }),
          'data-test': 'closeTimer',
          icon: 'minus',
          label: intl.formatMessage(intlMessages.hideTimerLabel, { 0: intl.formatMessage(intlMessages.timer) }),
          onClick: closePanel,
        }}
        data-test="timerHeader"
      />
      <Styled.Separator />
      <Styled.TimerScrollableContent id="timer-scroll-box">
        <Styled.TimerContent>
          <Styled.TimerType>
            <Styled.TimerSwitchButton
              label={intl.formatMessage(intlMessages.timer)}
              onClick={() => {
                timerStop();
                switchTimer(false);
              }}
              disabled={!stopwatch || running}
              color={!stopwatch ? 'primary' : 'secondary'}
              data-test="timerButton"
            />
            <Styled.TimerSwitchButton
              label={intl.formatMessage(intlMessages.stopwatch)}
              onClick={() => {
                timerStop();
                timerReset();
                switchTimer(true);
                setRunningTime(0);
              }}
              disabled={stopwatch || running}
              color={stopwatch ? 'primary' : 'secondary'}
              data-test="stopwatchButton"
            />
          </Styled.TimerType>

          {stopwatch ? (
            <Styled.TimerCurrent
              aria-hidden
              data-test="timerCurrent"
            >
              {humanizeSeconds(Math.floor(runningTime / 1000))}
            </Styled.TimerCurrent>
          ) : (
            <Styled.TimeInputWrapper
              onFocus={() => setIsEditing(true)}
              onBlur={() => {
                setIsEditing(false);
                syncTimeWithBackend();
              }}
            >
              <Styled.IncrementDecrementButton
                color="primary"
                label="-"
                onClick={handleDecrement}
                disabled={running}
              />
              <Styled.TimeInputGroup>
                <>
                  <Styled.TimerInput
                    type="number"
                    disabled={running && !isEditing}
                    value={String(displayHours).padStart(2, '0')}
                    maxLength={2}
                    max={MAX_HOURS}
                    min="0"
                    onChange={handleHoursChange}
                    onFocus={() => setFocusedUnit('hours')}
                    data-test="hoursInput"
                  />
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimerInput
                    type="number"
                    disabled={running && !isEditing}
                    value={String(displayMinutes).padStart(2, '0')}
                    maxLength={2}
                    max="59"
                    min="0"
                    onChange={handleMinutesChange}
                    onFocus={() => setFocusedUnit('minutes')}
                    data-test="minutesInput"
                  />
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimerInput
                    type="number"
                    disabled={running && !isEditing}
                    value={String(displaySeconds).padStart(2, '0')}
                    maxLength={2}
                    max="59"
                    min="0"
                    onChange={handleSecondsChange}
                    onFocus={() => setFocusedUnit('seconds')}
                    data-test="secondsInput"
                  />
                </>
              </Styled.TimeInputGroup>
              <Styled.IncrementDecrementButton
                color="primary"
                label="+"
                onClick={handleIncrement}
                disabled={running}
              />
            </Styled.TimeInputWrapper>
          )}

          {timerMusicOptions}

          <Styled.FooterSeparator />
          <Styled.ControlsContainer>
            {controlButtons}
            <Styled.DeactivateButton
              color="default"
              label={intl.formatMessage(intlMessages.deactivate)}
              onClick={handleDeactivate}
              data-test="deactivateTimer"
            />
          </Styled.ControlsContainer>
        </Styled.TimerContent>
      </Styled.TimerScrollableContent>
    </>
  );
};

const TimerPanelContaier: React.FC = () => {
  const [timeSync] = useTimeSync();
  const [timerActivate] = useMutation(TIMER_ACTIVATE);

  const {
    loading: timerLoading,
    error: timerError,
    data: timerData,
  } = useDeduplicatedSubscription<GetTimerResponse>(GET_TIMER);

  const activateTimer = useCallback(() => {
    const TIMER_CONFIG = window.meetingClientSettings.public.timer;
    const stopwatch = false;
    const running = false;
    const time = TIMER_CONFIG.time * MILLI_IN_MINUTE;

    return timerActivate({ variables: { stopwatch, running, time } });
  }, []);

  if (timerLoading || !timerData) return null;

  if (timerError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: timerError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  const timer = timerData.timer[0];

  const currentDate: Date = new Date();
  const startedAtDate: Date = new Date(timer.startedAt);
  const adjustedCurrent: Date = new Date(currentDate.getTime() + timeSync);
  const timeDifferenceMs: number = adjustedCurrent.getTime() - startedAtDate.getTime();

  const timePassed = timer.stopwatch ? (
    Math.floor(((timer.running ? timeDifferenceMs : 0) + timer.accumulated))
  ) : (
    Math.floor(((timer.time) - (timer.accumulated + (timer.running ? timeDifferenceMs : 0)))));

  if (!timer.active) activateTimer();

  return (
    <TimerPanel
      stopwatch={timer.stopwatch ?? false}
      songTrack={timer.songTrack ?? 'noTrack'}
      running={timer.running ?? false}
      timePassed={timePassed}
      accumulated={timer.accumulated}
      active
      time={timer.time}
      startedOn={timer.startedOn}
      startedAt={timer.startedAt}
    />
  );
};

export default TimerPanelContaier;
