import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  useMutation,
} from '@apollo/client';
import Styled from './styles';
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
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import useTimer from '/imports/ui/core/hooks/useTimer';
import { TimerData } from '/imports/ui/core/graphql/queries/timer';

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

interface TimerPanelProps extends Omit<TimerData, 'active' | 'elapsed' | 'startedAt' | 'startedOn'| 'accumulated'> {
  timePassed: number;
  isPaused: boolean;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  stopwatch,
  songTrack,
  time,
  running,
  timePassed,
  isPaused,
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

  const [focusedUnit, setFocusedUnit] = useState<'hours' | 'minutes' | 'seconds'>('seconds');
  const [lastSelectedTrack, setLastSelectedTrack] = useState<string | null>(null);
  const timeInSeconds = Math.max(0, Math.floor(timePassed / 1000));
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  useEffect(() => {
    if (songTrack && songTrack !== 'noTrack') {
      setLastSelectedTrack(songTrack);
    }
  }, [songTrack]);

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

  const syncTimeWithBackend = useCallback((h: number, m: number, s: number) => {
    let valid_seconds = s;
    if (!stopwatch && h === 0 && m === 0 && s === 0) {
      valid_seconds = 1;
    }

    const newTimeInMillis = (h * MILLI_IN_HOUR)
      + (m * MILLI_IN_MINUTE)
      + (valid_seconds * MILLI_IN_SECOND);

    if (newTimeInMillis !== time) {
      timerSetTime({ variables: { time: newTimeInMillis } });
      if (isPaused) {
        // The timer needs to be reset here because the time
        // already passed has to be zero
        timerReset();
      }
    }
  }, [time, timerSetTime, stopwatch, isPaused]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    const newHours = Math.max(0, Math.min(value, MAX_HOURS));
    syncTimeWithBackend(newHours, minutes, seconds);
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value || '0', 10);
    if (Number.isNaN(value)) return;
    const newMinutes = Math.max(0, Math.min(value, 59));
    syncTimeWithBackend(hours, newMinutes, seconds);
  };

  const handleSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasHourOrMinutes = hours > 0 || minutes > 0;
    const value = parseInt(event.target.value || (hasHourOrMinutes ? '0' : '1'), 10);
    if (Number.isNaN(value)) return;
    const newSeconds = Math.max(hasHourOrMinutes ? 0 : 1, Math.min(value, 59));
    syncTimeWithBackend(hours, hours, newSeconds);
  };

  const changeTime = useCallback((amountInSeconds: number) => {
    if (running) return;

    const currentTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
    let newTotalSeconds = currentTimeInSeconds + amountInSeconds;

    const maxSeconds = (MAX_HOURS * 3600) + (59 * 60) + 59;
    newTotalSeconds = Math.max(0, Math.min(newTotalSeconds, maxSeconds));

    const h = Math.floor(newTotalSeconds / 3600);
    const m = Math.floor((newTotalSeconds % 3600) / 60);
    const s = newTotalSeconds % 60;

    syncTimeWithBackend(h, m, s);
  }, [running, hours, minutes, seconds]);

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
  }, [timerStop, timerReset]);

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
              const newStartTime = (hours * MILLI_IN_HOUR)
                + (minutes * MILLI_IN_MINUTE)
                + (seconds * MILLI_IN_SECOND);

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
              {humanizeSeconds(Math.floor(timePassed / 1000))}
            </Styled.TimerCurrent>
          ) : (
            <Styled.TimeInputWrapper>
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
                    readOnly={running}
                    disabled={running}
                    value={String(hours).padStart(2, '0')}
                    maxLength={2}
                    max={MAX_HOURS}
                    min="0"
                    onChange={handleHoursChange}
                    onFocus={() => setFocusedUnit('hours')}
                    data-test="hoursInput"
                    isSelected={!running && focusedUnit === 'hours'}
                  />
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimerInput
                    type="number"
                    readOnly={running}
                    disabled={running}
                    value={String(minutes).padStart(2, '0')}
                    maxLength={2}
                    max="59"
                    min="0"
                    onChange={handleMinutesChange}
                    onFocus={() => setFocusedUnit('minutes')}
                    data-test="minutesInput"
                    isSelected={!running && focusedUnit === 'minutes'}
                  />
                  <Styled.TimeInputColon>:</Styled.TimeInputColon>
                  <Styled.TimerInput
                    type="number"
                    readOnly={running}
                    disabled={running}
                    value={String(seconds).padStart(2, '0')}
                    maxLength={2}
                    max="59"
                    min="0"
                    onChange={handleSecondsChange}
                    onFocus={() => setFocusedUnit('seconds')}
                    data-test="secondsInput"
                    isSelected={!running && focusedUnit === 'seconds'}
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
  const [timerActivate] = useMutation(TIMER_ACTIVATE);
  const [hasActivated, setHasActivated] = useState(() => {
    return localStorage.getItem('timer-has-activated') === 'true';
  });

  const { data: timerData } = useTimer();

  const activateTimer = useCallback(() => {
    if (hasActivated) {
      return;
    }
    
    const TIMER_CONFIG = window.meetingClientSettings.public.timer;
    const stopwatch = false;
    const running = false;
    const time = TIMER_CONFIG.time * MILLI_IN_MINUTE;
    
    timerActivate({ variables: { stopwatch, running, time } })
      .then(() => {
        setHasActivated(true);
        localStorage.setItem('timer-has-activated', 'true');
      })
      .catch((error) => {
        console.error('Erro ao ativar timer:', error);
      });
  }, [timerActivate, hasActivated]);

  useEffect(() => {
    if (timerData && !timerData.active && hasActivated) {
      localStorage.removeItem('timer-has-activated');
      setHasActivated(false);
    }
  }, [timerData?.active, hasActivated]);

  useEffect(() => {
    if (!timerData?.active && !hasActivated) {
      activateTimer();
    }
  }, [timerData?.active, hasActivated, activateTimer]);

  const currentTimer = timerData;

  if (currentTimer?.active) {
    const {
      stopwatch,
      songTrack,
      running,
      time,
      timePassed = 0,
      startedAt,
    } = currentTimer;

    return (
      <TimerPanel
        stopwatch={stopwatch}
        songTrack={songTrack}
        running={running}
        timePassed={timePassed}
        time={time}
        isPaused={!running && startedAt !== null}
      />
    );
  }
  
  return null;
};

export default TimerPanelContaier;