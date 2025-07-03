import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { ObjectToCustomQueryHookContainerMap, QueryHookWithArgumentContainerToRender } from '../domain/shared/custom-query/types';
import { ObjectToCustomSubscriptionHookContainerMap, SubscriptionHookWithArgumentContainerToRender } from '../domain/shared/custom-subscription/types';

export interface CustomDataConsumptionHooksErrorBoundaryProps {
  hookWithArguments: SubscriptionHookWithArgumentContainerToRender | QueryHookWithArgumentContainerToRender;
  dataConsumptionHook: DataConsumptionHooks;
  setDataConsumptionHookWithArgumentUtilizationCount: React.Dispatch<
      React.SetStateAction<Map<string, Map<
      string, ObjectToCustomSubscriptionHookContainerMap | ObjectToCustomQueryHookContainerMap
      >>>>,
  children: React.ReactNode;
}

export interface ErrorInformation {
  errorMessage: string;
  errorCode: string;
  dataConsumptionInformation: {
    query: string,
    variables?: object,
  }
}

export interface DataConsumptionFallbackHandlerProps {
  errorInformation: ErrorInformation;
  hook: DataConsumptionHooks;
  setDataConsumptionHookWithArgumentUtilizationCount: React.Dispatch<
    React.SetStateAction<Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>>>;
}
