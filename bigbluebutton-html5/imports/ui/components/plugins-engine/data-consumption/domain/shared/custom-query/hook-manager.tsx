import { useEffect } from 'react';
import {
  ApolloError,
  gql,
  OperationVariables, QueryResult, useQuery,
} from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { QueryHookWithArgumentsContainerProps } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomQueryHookContainer = (props: QueryHookWithArgumentsContainerProps) => {
  const { hookArguments, resolveQuery } = props;
  const { query: queryFromPlugin, variables } = hookArguments;

  let customQueryData: QueryResult<any, OperationVariables>;
  try {
    const queryResult = useQuery(gql`${queryFromPlugin}`, {
      variables,
    });
    customQueryData = queryResult;
  } catch (err) {
    const errorMessage = `
    Error while querying custom subscriptions for plugins (query: ${queryFromPlugin}) (Error: ${err})`;
    logger.error(errorMessage);
    customQueryData = {
      data: undefined,
      loading: false,
      error: new ApolloError({
        errorMessage,
      }),
    } as QueryResult;
  }
  const updateCustomSubscriptionForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customQueryData,
            hook: DataConsumptionHooks.CUSTOM_QUERY,
            hookArguments: {
              query: queryFromPlugin,
              variables,
            } as CustomSubscriptionArguments,
          } as UpdatedEventDetails<any>,
        },
      ),
    );
  };

  useEffect(() => {
    updateCustomSubscriptionForPlugin();
    if (!customQueryData.loading) {
      resolveQuery();
    }
  }, [customQueryData]);

  return null;
};

export default CustomQueryHookContainer;
