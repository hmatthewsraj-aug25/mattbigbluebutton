import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UserListDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-dropdown-item/enums';
import { DropdownItem } from './types';

export const makeDropdownPluginItem: (
  userDropdownItems: PluginSdk.UserListDropdownInterface[]) => DropdownItem[] = (
    userDropdownItems: PluginSdk.UserListDropdownInterface[],
  ) => userDropdownItems.map(
    (userDropdownItem: PluginSdk.UserListDropdownInterface) => {
      const returnValue: DropdownItem = {
        isSeparator: false,
        key: userDropdownItem.id,
        iconRight: undefined,
        onClick: undefined,
        label: undefined,
        icon: undefined,
        tooltip: undefined,
        textColor: undefined,
        allowed: undefined,
      };
      switch (userDropdownItem.type) {
        case UserListDropdownItemType.OPTION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownOption;
          returnValue.label = dropdownButton.label;
          returnValue.tooltip = dropdownButton.tooltip;
          returnValue.icon = dropdownButton.icon;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.onClick = dropdownButton.onClick;
          break;
        }
        case UserListDropdownItemType.FIXED_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownFixedContentInformation;
          returnValue.label = dropdownButton.label;
          returnValue.icon = dropdownButton.icon;
          returnValue.iconRight = dropdownButton.iconRight;
          returnValue.textColor = dropdownButton.textColor;
          returnValue.allowed = dropdownButton.allowed;
          break;
        }
        case UserListDropdownItemType.GENERIC_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownGenericContentInformation;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.contentFunction = dropdownButton.contentFunction;
          break;
        }
        case UserListDropdownItemType.SEPARATOR: {
          returnValue.allowed = true;
          returnValue.isSeparator = true;
          break;
        }
        default:
          break;
      }
      return returnValue;
    },
  );

export default makeDropdownPluginItem;
