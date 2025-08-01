import { useEffect, useRef } from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
  },
  away: {
    id: 'app.toast.setEmoji.away',
    description: 'toast message for set away notification',
  },
  notAway: {
    id: 'app.toast.setEmoji.notAway',
    description: 'toast message for remove away notification',
  },
});

const useUserStatusNotifications = (
  currentUserAway?: boolean,
  currentUserRaiseHand?: boolean,
  intl?: IntlShape,
) => {
  const prevAwayRef = useRef<boolean | undefined>(currentUserAway);
  const prevRaiseHandRef = useRef<boolean | undefined>(currentUserRaiseHand);

  useEffect(() => {
    if (intl && prevAwayRef.current !== currentUserAway) {
      if (currentUserAway === true) {
        notify(intl.formatMessage(intlMessages.away), 'info', 'user');
      } else if (currentUserAway === false) {
        notify(intl.formatMessage(intlMessages.notAway), 'info', 'clear_status');
      }
      prevAwayRef.current = currentUserAway;
    }
  }, [currentUserAway, intl]);

  useEffect(() => {
    if (intl && prevRaiseHandRef.current !== currentUserRaiseHand) {
      if (currentUserRaiseHand === true) {
        notify(intl.formatMessage(intlMessages.raisedHand), 'info', 'user');
      } else if (currentUserRaiseHand === false) {
        notify(intl.formatMessage(intlMessages.loweredHand), 'info', 'clear_status');
      }
      prevRaiseHandRef.current = currentUserRaiseHand;
    }
  }, [currentUserRaiseHand, intl]);
};

export default useUserStatusNotifications;
