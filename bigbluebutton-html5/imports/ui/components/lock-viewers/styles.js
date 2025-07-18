import styled from 'styled-components';
import { styled as materialStyled } from '@mui/material/styles';
import { Checkbox } from '@mui/material';
import {
  smPaddingX,
  titlePositionLeft,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGray,
  colorGrayLabel,
  colorPrimary,
  colorBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const LockViewersModal = styled(ModalSimple)`
  padding: 0px;
  border-radius: 1rem;
`;

const Container = styled.div`
  padding: 1.14rem 2.25rem 1.14rem;
  border-top: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  gap: 1rem;
`;

const Description = styled.div`
  text-align: start;
  color: ${colorGray};
  margin-bottom: 1rem;
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
  padding-top: 0.5rem;
`;

const SubHeader = styled.header`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
  margin-bottom: ${titlePositionLeft};
`;

const Bold = styled.div`
  font-weight: bold;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: flex-start;
  gap: 0.5rem;
  align-items: center;

  & > :first-child {
    margin: 0;

    [dir="rtl"] & {
      margin: 0;
    }
  }
`;

const ColToggle = styled.div`
  display: flex;
  flex-grow: 0;
  flex-basis: 0;
  margin: 0;

  [dir="rtl"] & {
    margin: 0;
  }
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0;

  [dir="rtl"] & {
    margin: 0;
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const FormElementLeft = styled(FormElement)`
  display: flex;
  justify-content: flex-start;
  flex-flow: row;
  align-items: center;
`;

const Label = styled.div`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
`;

const Footer = styled.div`
  display: flex;
  padding: 1.7rem;
`;

const Actions = styled.div`
  margin-left: auto;
  margin-right: 0;

  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 3px;
  }
`;

const ButtonCancel = styled(Button)`
  margin: 0 0.25rem;
  width: 10rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
`;

const ButtonApply = styled(Button)`
  margin: 0 0.25rem;
  width: 10.75rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
`;

const MaterialCheckbox = materialStyled(Checkbox)({
  padding: '0.2rem',
  color: colorGray,
  '&.Mui-checked': {
    color: colorPrimary,
  },
});

export default {
  ToggleLabel,
  LockViewersModal,
  Container,
  Description,
  Form,
  SubHeader,
  Bold,
  Row,
  ColToggle,
  Col,
  FormElement,
  FormElementLeft,
  Label,
  Footer,
  Actions,
  ButtonCancel,
  ButtonApply,
  MaterialCheckbox,
};
