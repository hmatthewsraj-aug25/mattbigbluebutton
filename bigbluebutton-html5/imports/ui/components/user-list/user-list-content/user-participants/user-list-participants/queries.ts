import { gql } from '@apollo/client';

export interface UsersCountSubscriptionResponse {
  user_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const CURRENT_USER_SUBSCRIPTION = gql`
subscription UserListCurrUser {
  user_current {
    userId 
    isModerator
    guest
    presenter
    locked
  }
}`;

export const USER_AGGREGATE_COUNT_SUBSCRIPTION = gql`
subscription UsersCount {
  user_aggregate {
    aggregate {
      count
    }
  }
}
`;

export default {
  CURRENT_USER_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
};
