import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { mdPadding, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';

interface MessageListProps {
  isRTL: boolean;
  $hasMessageToolbar: boolean;
}

interface UnreadButtonProps {
  isRTL: boolean;
}

export const MessageList = styled(ScrollboxVertical)<MessageListProps>`
  flex-flow: column;
  outline-style: none;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  z-index: 2;
  overflow-y: auto;
  position: relative;
  padding: 0 ${mdPadding};
`;

export const UnreadButton = styled(ButtonElipsis)<UnreadButtonProps>`
  flex-shrink: 0;
  text-transform: uppercase;
  margin-bottom: .25rem;
  z-index: 3;
  position: absolute;
  bottom: 0;

  ${({ isRTL }) => isRTL && `
    left: ${smPaddingX};
    right: 0;
  `}

  ${({ isRTL }) => !isRTL && `
    left: 0;
    right: ${smPaddingX};
  `}
`;

export const PageWrapper = styled.div``;

export const Content = styled.div`
  height: 100%;
  position: relative;
  flex-shrink: 1;
  overflow: hidden;
`;

export default {
  MessageList,
  UnreadButton,
  PageWrapper,
  Content,
};
