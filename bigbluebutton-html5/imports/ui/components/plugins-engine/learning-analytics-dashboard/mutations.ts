import { gql } from '@apollo/client';

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardSendData($pluginName: String!,
    $dataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardSendData(
        dataForLearningAnalyticsDashboard: $dataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardDeleteData($pluginName: String!,
    $dataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardDeleteData(
        dataForLearningAnalyticsDashboard: $dataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;
