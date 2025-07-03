import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { pollTypes } from '../service';
import Styled from '../styles';

const intlMessages = defineMessages({
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  deleteRespDesc: {
    id: 'app.poll.deleteRespDesc',
    description: '',
  },
  emptyPollOpt: {
    id: 'app.poll.emptyPollOpt',
    description: 'screen reader for blank poll option',
  },
});

interface PollInputsProps {
  optList: Array<{ val: string }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void;
  handleRemoveOption: (i: number) => void;
  type: string | null;
  error: string | null;
  isQuiz: boolean;
  correctAnswer: {
    text: string;
    index: number;
  };
  setCorrectAnswer: (param: {text: string, index: number }) => void;
}

const PollInputs: React.FC<PollInputsProps> = ({
  optList,
  handleInputChange,
  handleRemoveOption,
  type,
  error,
  isQuiz,
  correctAnswer,
  setCorrectAnswer,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
  const MIN_OPTIONS_LENGTH = 2;
  const intl = useIntl();
  let hasVal = false;
  return optList.slice(0, MAX_CUSTOM_FIELDS).map((o: { val: string }, i: number) => {
    const pollOptionKey = `poll-option-${i}`;
    if (o.val && o.val.length > 0) hasVal = true;
    return (
      <span key={pollOptionKey}>
        <Styled.OptionWrapper>
          <Styled.PollOptionInput
            type="text"
            value={o.val}
            placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
            data-test="pollOptionItem"
            onChange={(e) => handleInputChange(e, i)}
            maxLength={MAX_INPUT_CHARS}
            onPaste={(e) => { e.stopPropagation(); }}
            onCut={(e) => { e.stopPropagation(); }}
            onCopy={(e) => { e.stopPropagation(); }}
          />
          {isQuiz && (
            <Styled.CorrectAnswerCheckbox
              type="checkbox"
              id={`correct-answer-${i}`}
              checked={correctAnswer.index === i && correctAnswer.text === o.val}
              disabled={o.val.length === 0}
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                if (ev.target.checked) {
                  setCorrectAnswer({
                    text: o.val,
                    index: i,
                  });
                }
              }}
            />
          )}
          {optList.length > MIN_OPTIONS_LENGTH && (
            <Styled.DeletePollOptionButton
              label={intl.formatMessage(intlMessages.delete)}
              aria-describedby={`option-${i}`}
              icon="delete"
              data-test="deletePollOption"
              hideLabel
              circle
              color="default"
              onClick={() => {
                handleRemoveOption(i);
              }}
            />
          )}
          <span className="sr-only" id={`option-${i}`}>
            {intl.formatMessage(
              intlMessages.deleteRespDesc,
              { option: o.val || intl.formatMessage(intlMessages.emptyPollOpt) },
            )}
          </span>
        </Styled.OptionWrapper>
        {!hasVal && type !== pollTypes.Response && error ? (
          <Styled.InputError data-test="errorNoValueInput">{error}</Styled.InputError>
        ) : (
          <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
        )}
      </span>
    );
  });
};

export default PollInputs;
