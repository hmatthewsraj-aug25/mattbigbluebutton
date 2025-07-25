import { gql } from '@apollo/client';

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardUpsertData($pluginName: String!,
    $dataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardUpsertData(
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
