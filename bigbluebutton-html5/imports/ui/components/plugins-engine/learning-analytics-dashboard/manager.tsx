import { useEffect } from 'react';
import { DeleteGenericDataArguments, LearningAnalyticsDashboardEventDetails, UpsertGenericDataArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/types';
import { LearningAnalyticsDashboardEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/enums';
import { useMutation } from '@apollo/client';
import {
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION,
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_GENERIC_DATA_MUTATION,
} from './mutations';
import { PluginLearningAnalyticsDashboardManagerProps } from './types';

const PluginLearningAnalyticsDashboardManager: React.ElementType<
  PluginLearningAnalyticsDashboardManagerProps> = ((
    props: PluginLearningAnalyticsDashboardManagerProps,
  ) => {
    const { pluginName } = props;

    const [sendGenericDataToLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION,
    );

    const [deleteGenericDataFromLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_GENERIC_DATA_MUTATION,
    );

    const handleSendGenericDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        sendGenericDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            genericDataForLearningAnalyticsDashboard: eventDetails.data,
            targetUserId: '',
          },
        });
      }
    }) as EventListener;

    const handleUpsertGenericDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as UpsertGenericDataArguments;
        const targetUserId = eventDetails.targetUserId || '';
        sendGenericDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            genericDataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

    const handleDeleteGenericDataFromLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as DeleteGenericDataArguments;
        const targetUserId = eventDetails.targetUserId || '';
        deleteGenericDataFromLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            genericDataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

    useEffect(() => {
      window.addEventListener(
        LearningAnalyticsDashboardEvents.UPSERT_GENERIC_DATA_SENT, handleUpsertGenericDataForLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.DELETE_GENERIC_DATA_SENT,
        handleDeleteGenericDataFromLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendGenericDataForLearningAnalyticsDashboard,
      );
      return () => {
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.UPSERT_GENERIC_DATA_SENT,
          handleUpsertGenericDataForLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.DELETE_GENERIC_DATA_SENT,
          handleDeleteGenericDataFromLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendGenericDataForLearningAnalyticsDashboard,
        );
      };
    }, []);
  }) as React.ElementType<PluginLearningAnalyticsDashboardManagerProps>;

export default PluginLearningAnalyticsDashboardManager;
