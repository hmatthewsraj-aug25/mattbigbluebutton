import React, { useContext } from 'react';
import { useMutation } from '@apollo/client';
import { MediaAreaContainerProps, ActionButtonPluginItem } from './types';
import MediaArea from './component';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import {
  useIsCameraAsContentEnabled,
  useIsPresentationEnabled,
} from '/imports/ui/services/features';
import { useIsCameraAsContentBroadcasting } from '/imports/ui/components/screenshare/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { SET_PRESENTER } from '/imports/ui/core/graphql/mutations/userMutations';
import Auth from '/imports/ui/services/auth';
import { useMeetingIsBreakout } from '/imports/ui/components/app/service';

const MediaAreaContainer = (props: MediaAreaContainerProps) => {
  const {
    amIPresenter,
    amIModerator,
    allowExternalVideo,
    intl,
    isSharingVideo,
    stopExternalVideoShare,
    isMeteorConnected,
    setPresentationFitToWidth,
    hasPresentation,
  } = props;

  const { width: browserWidth } = layoutSelectInput((i: Input) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const meetingIsBreakout = useMeetingIsBreakout();
  const hasCameraAsContent = useIsCameraAsContentBroadcasting();

  let actionButtonDropdownItems: ActionButtonPluginItem[] = [];
  if (pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems) {
    actionButtonDropdownItems = [
      ...(pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems as unknown as ActionButtonPluginItem[]),
    ];
  }

  const { allowPresentationManagementInBreakouts } = window.meetingClientSettings.public.app.breakouts;

  const isPresentationManagementDisabled = meetingIsBreakout
    && !allowPresentationManagementInBreakouts;

  const [setPresenter] = useMutation(SET_PRESENTER);

  const handleTakePresenter = () => {
    setPresenter({ variables: { userId: Auth.userID } });
  };

  const isPresentationEnabled = useIsPresentationEnabled();
  const isCameraAsContentEnabled = useIsCameraAsContentEnabled();

  return (
    <MediaArea
      actionButtonDropdownItems={actionButtonDropdownItems}
      isCameraAsContentEnabled={isCameraAsContentEnabled}
      hasCameraAsContent={hasCameraAsContent}
      handleTakePresenter={handleTakePresenter}
      isPresentationEnabled={isPresentationEnabled}
      isPresentationManagementDisabled={isPresentationManagementDisabled}
      amIPresenter={amIPresenter}
      amIModerator={amIModerator}
      allowExternalVideo={allowExternalVideo}
      intl={intl}
      isSharingVideo={isSharingVideo}
      stopExternalVideoShare={stopExternalVideoShare}
      isMeteorConnected={isMeteorConnected}
      hasPresentation={hasPresentation}
      setPresentationFitToWidth={setPresentationFitToWidth}
    />
  );
};

export default MediaAreaContainer;
