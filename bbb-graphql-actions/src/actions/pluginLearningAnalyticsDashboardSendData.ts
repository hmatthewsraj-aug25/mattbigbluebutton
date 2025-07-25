import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
    [
      {name: 'pluginName', type: 'string', required: true},
      {name: 'dataForLearningAnalyticsDashboard', type: 'json', required: true},
      {name: 'targetUserId', type: 'string', required: true},
    ]
  )


  const dataForLearningAnalyticsDashboard = input[
    'dataForLearningAnalyticsDashboard'
  ] as Record<string, unknown>;
  if(dataForLearningAnalyticsDashboard) {
    throwErrorIfInvalidInput(dataForLearningAnalyticsDashboard,
        [
          {name: 'cardTitle', type: 'string', required: true},
          {name: 'columnTitle', type: 'string', required: true},
          {name: 'value', type: 'string', required: true},
        ]
    )
  }

  const eventName = `PluginLearningAnalyticsDashboardSendDataMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    pluginName: input.pluginName,
    dataForLearningAnalyticsDashboard: input.dataForLearningAnalyticsDashboard,
    targetUserId: input.targetUserId,
  };

  return { eventName, routing, header, body };
}
