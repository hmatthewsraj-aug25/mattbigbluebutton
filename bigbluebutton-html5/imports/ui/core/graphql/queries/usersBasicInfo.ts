import { gql } from '@apollo/client';

const USERS_BASIC_INFO_SUBSCRIPTION = gql`
  subscription UsersBasicInfo {
    user(order_by: {nameSortable: asc, userId: asc}) {
      userId
      extId
      name
      isModerator
      currentlyInMeeting
      color
      role
      avatar
      reactionEmoji
      presenter
      away
      raiseHand
    }
  }
`;

export default USERS_BASIC_INFO_SUBSCRIPTION;
