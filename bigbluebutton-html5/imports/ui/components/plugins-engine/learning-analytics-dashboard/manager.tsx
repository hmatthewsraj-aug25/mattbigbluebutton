import { useEffect } from 'react';
import { LearningAnalyticsDashboardDeleteUserData, LearningAnalyticsDashboardEventDetails, LearningAnalyticsDashboardUserData } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/types';
import { LearningAnalyticsDashboardEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/enums';
import { useMutation } from '@apollo/client';
import {
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_USER_DATA_MUTATION,
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_USER_DATA_MUTATION,
} from './mutations';
import { PluginLearningAnalyticsDashboardManagerProps } from './types';

const PluginLearningAnalyticsDashboardManager: React.ElementType<
  PluginLearningAnalyticsDashboardManagerProps> = ((
    props: PluginLearningAnalyticsDashboardManagerProps,
  ) => {
    const { pluginName } = props;

    const [upsertUserDataToLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_USER_DATA_MUTATION,
    );

    const [deleteUserDataFromLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_USER_DATA_MUTATION,
    );

    // This flow will be deprecated
    const handleSendDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        upsertUserDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            userDataForLearningAnalyticsDashboard: eventDetails.data,
            targetUserId: '',
          },
        });
      }
    }) as EventListener;

    const handleUpsertUserDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as LearningAnalyticsDashboardUserData;
        const targetUserId = eventDetails.targetUserId || '';
        upsertUserDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            userDataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

    const handleDeleteUserDataFromLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as LearningAnalyticsDashboardDeleteUserData;
        const targetUserId = eventDetails.targetUserId || '';
        deleteUserDataFromLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            dataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

    useEffect(() => {
      window.addEventListener(
        LearningAnalyticsDashboardEvents.UPSERT_USER_DATA_COMMAND_SENT,
        handleUpsertUserDataForLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.DELETE_USER_DATA_COMMAND_SENT,
        handleDeleteUserDataFromLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendDataForLearningAnalyticsDashboard,
      );
      return () => {
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.UPSERT_USER_DATA_COMMAND_SENT,
          handleUpsertUserDataForLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.DELETE_USER_DATA_COMMAND_SENT,
          handleDeleteUserDataFromLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendDataForLearningAnalyticsDashboard,
        );
      };
    }, []);
  }) as React.ElementType<PluginLearningAnalyticsDashboardManagerProps>;

export default PluginLearningAnalyticsDashboardManager;
