import { gql } from '@apollo/client';

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardSendGenericData($pluginName: String!,
    $genericDataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardSendGenericData(
        genericDataForLearningAnalyticsDashboard: $genericDataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_GENERIC_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardDeleteGenericData($pluginName: String!,
    $genericDataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardDeleteGenericData(
        genericDataForLearningAnalyticsDashboard: $genericDataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;
