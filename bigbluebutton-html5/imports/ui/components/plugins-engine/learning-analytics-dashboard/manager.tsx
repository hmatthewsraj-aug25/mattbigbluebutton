import { useEffect } from 'react';
import { DeleteDataArguments, LearningAnalyticsDashboardEventDetails, UpsertDataArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/types';
import { LearningAnalyticsDashboardEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/enums';
import { useMutation } from '@apollo/client';
import {
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_DATA_MUTATION,
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_DATA_MUTATION,
} from './mutations';
import { PluginLearningAnalyticsDashboardManagerProps } from './types';

const PluginLearningAnalyticsDashboardManager: React.ElementType<
  PluginLearningAnalyticsDashboardManagerProps> = ((
    props: PluginLearningAnalyticsDashboardManagerProps,
  ) => {
    const { pluginName } = props;

    const [upsertDataToLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_DATA_MUTATION,
    );

    const [deleteDataFromLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_DATA_MUTATION,
    );

    // This flow will be deprecated
    const handleSendDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        upsertDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            dataForLearningAnalyticsDashboard: eventDetails.data,
            targetUserId: '',
          },
        });
      }
    }) as EventListener;

    const handleUpsertDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as UpsertDataArguments;
        const targetUserId = eventDetails.targetUserId || '';
        upsertDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            dataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

    const handleDeleteDataFromLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as DeleteDataArguments;
        const targetUserId = eventDetails.targetUserId || '';
        deleteDataFromLearningAnalyticsDashboard({
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
        LearningAnalyticsDashboardEvents.UPSERT_DATA_COMMAND_SENT, handleUpsertDataForLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.DELETE_DATA_COMMAND_SENT,
        handleDeleteDataFromLearningAnalyticsDashboard,
      );
      window.addEventListener(
        LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendDataForLearningAnalyticsDashboard,
      );
      return () => {
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.UPSERT_DATA_COMMAND_SENT,
          handleUpsertDataForLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.DELETE_DATA_COMMAND_SENT,
          handleDeleteDataFromLearningAnalyticsDashboard,
        );
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendDataForLearningAnalyticsDashboard,
        );
      };
    }, []);
  }) as React.ElementType<PluginLearningAnalyticsDashboardManagerProps>;

export default PluginLearningAnalyticsDashboardManager;
