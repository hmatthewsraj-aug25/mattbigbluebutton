import { useEffect } from 'react';
import { gql } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { SubscriptionHookWithArgumentsContainerProps } from './types';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { SubscriptionStructure } from '/imports/ui/core/singletons/subscriptionStore';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomSubscriptionHookContainer = (props: SubscriptionHookWithArgumentsContainerProps) => {
  const { hookArguments, numberOfUses } = props;
  const { query: queryFromPlugin, variables } = hookArguments;
  const previousNumberOfUses = usePreviousValue(numberOfUses);

  let customSubscriptionData: SubscriptionStructure<any>;
  try {
    const subscriptionResult = useDeduplicatedSubscription(gql`${queryFromPlugin}`, {
      variables,
    });
    customSubscriptionData = subscriptionResult;
  } catch (err) {
    const errorMessage = `
      Error while querying custom subscriptions for plugins (query: ${queryFromPlugin}) (Error: ${err})`;
    logger.error(errorMessage);
    customSubscriptionData = {
      data: null,
      count: 0,
      error: new Error(errorMessage),
      loading: false,
      sub: null,
    };
  }

  const updateCustomSubscriptionForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customSubscriptionData,
            hook: DataConsumptionHooks.CUSTOM_SUBSCRIPTION,
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
  }, [customSubscriptionData]);
  useEffect(() => {
    const previousNumberOfUsesValue = previousNumberOfUses || 0;
    if (numberOfUses > previousNumberOfUsesValue) {
      updateCustomSubscriptionForPlugin();
    }
  }, [numberOfUses]);

  return null;
};

export default CustomSubscriptionHookContainer;
