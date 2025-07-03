/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { makeCustomHookIdentifierFromArgs } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { CustomQueryArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-query/types';
import { CustomDataConsumptionHooksErrorBoundaryProps, DataConsumptionFallbackHandlerProps, ErrorInformation } from './types';
import ErrorBoundary from '../../../common/error-boundary/component';
import { deleteSubscriptionHookEntry } from '../utils';

const fallbackHandler = (props: DataConsumptionFallbackHandlerProps) => {
  const {
    hook, errorInformation, setDataConsumptionHookWithArgumentUtilizationCount,
  } = props;
  const customSubscriptionData = {
    data: null,
    error: errorInformation,
    loading: false,
  };

  const updateCustomSubscriptionForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customSubscriptionData,
            hook,
            hookArguments: {
              query: errorInformation.dataConsumptionInformation.query,
              variables: errorInformation.dataConsumptionInformation.variables,
            } as CustomSubscriptionArguments | CustomQueryArguments,
          } as UpdatedEventDetails<any>,
        },
      ),
    );
  };

  React.useEffect(() => {
    const hookArguments = {
      query: errorInformation.dataConsumptionInformation.query,
      variables: errorInformation.dataConsumptionInformation.variables,
    };
    updateCustomSubscriptionForPlugin();
    deleteSubscriptionHookEntry(
      setDataConsumptionHookWithArgumentUtilizationCount,
      hook, hookArguments,
    );
  }, []);
  return null;
};

const CustomDataConsumptionHooksErrorBoundary: React.FC<CustomDataConsumptionHooksErrorBoundaryProps> = (
  props: CustomDataConsumptionHooksErrorBoundaryProps,
) => {
  const {
    children,
    hookWithArguments,
    dataConsumptionHook,
    setDataConsumptionHookWithArgumentUtilizationCount,
  } = props;
  const {
    query,
    variables,
  } = hookWithArguments.hookArguments;
  let errorMessage;
  let logMetadata;
  if (dataConsumptionHook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION) {
    errorMessage = `
      Error while querying custom subscriptions for plugins`;
    logMetadata = {
      logCode: 'plugin_custom_subscription_error',
      logMessage: errorMessage,
    };
  } else {
    errorMessage = `
      Error while trying to fetch data via custom query for plugin`;
    logMetadata = {
      logCode: 'plugin_custom_query_error',
      logMessage: errorMessage,
    };
  }
  const errorInformation = {
    errorMessage,
    errorCode: logMetadata.logCode,
    dataConsumptionInformation: {
      query,
      variables,
    },
  } as ErrorInformation;
  return (
    <ErrorBoundary
      key={makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}
      Fallback={() => {
        fallbackHandler({
          errorInformation,
          hook: dataConsumptionHook,
          setDataConsumptionHookWithArgumentUtilizationCount,
        });
      }}
      logMetadata={logMetadata}
      errorMessage={errorMessage}
      errorInfo={
        {
          subscriptionData: {
            query,
            variables,
          },
        }
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default CustomDataConsumptionHooksErrorBoundary;
