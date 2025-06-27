/* eslint-disable no-undef */
// Rule applied because EventListener is not undefined at all times.
import { DataConsumptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/types';
import { makeCustomHookIdentifierFromArgs } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import {
  DataConsumptionHooks,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { ObjectToCustomSubscriptionHookContainerMap } from './domain/shared/custom-subscription/types';
import { ObjectToCustomQueryHookContainerMap } from './domain/shared/custom-query/types';
import { ObjectToCustomHookContainerMap } from './types';

const hookUsageSetStateCallback = (
  mapObj: Map<string, Map<string, ObjectToCustomHookContainerMap>>,
  hookName: string, delta: number, hookArguments?: DataConsumptionArguments,
) => {
  if (hookArguments) {
    const hookArgumentsAsKey = makeCustomHookIdentifierFromArgs(hookArguments);
    // Create object from the hook with argument
    const mapToBeSet = new Map<string, ObjectToCustomSubscriptionHookContainerMap>(mapObj.get(hookName)?.entries());
    mapToBeSet.set(hookArgumentsAsKey, {
      count: (mapObj.get(hookName)?.get(hookArgumentsAsKey)?.count || 0) + delta,
      hookArguments,
    } as ObjectToCustomSubscriptionHookContainerMap);

    // Create new map with argument
    const newMap = new Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>(mapObj.entries());
    newMap.set(hookName, mapToBeSet);
    return newMap;
  } return mapObj;
};

const updateHookUsage = (
  setHookUtilizationCount: React.Dispatch<React.SetStateAction<Map<string, number>>>,
  setSubscriptionHookWithArgumentUtilizationCount: React.Dispatch<
    React.SetStateAction<Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>>>,
  setQueryHookWithArgumentUtilizationCount: React.Dispatch<
  React.SetStateAction<Map<string, Map<string, ObjectToCustomQueryHookContainerMap>>>>,
  hookName: string, delta: number, hookArguments?: DataConsumptionArguments,
): void => {
  if (hookName !== DataConsumptionHooks.CUSTOM_SUBSCRIPTION
    && hookName !== DataConsumptionHooks.CUSTOM_QUERY) {
    setHookUtilizationCount((mapObj) => {
      const newMap = new Map<string, number>(mapObj.entries());
      newMap.set(hookName, (mapObj.get(hookName) || 0) + delta);
      return newMap;
    });
  } else if (hookName === DataConsumptionHooks.CUSTOM_QUERY) {
    setQueryHookWithArgumentUtilizationCount((mapObj) => hookUsageSetStateCallback(
      mapObj, hookName, delta, hookArguments,
    ));
  } else {
    setSubscriptionHookWithArgumentUtilizationCount((mapObj) => hookUsageSetStateCallback(
      mapObj, hookName, delta, hookArguments,
    ));
  }
};

export default updateHookUsage;
