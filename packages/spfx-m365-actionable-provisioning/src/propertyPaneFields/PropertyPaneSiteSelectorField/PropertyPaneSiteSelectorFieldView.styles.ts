/**
 * Internal styles for PropertyPaneSiteSelectorField view.
 *
 * @internal
 * @packageDocumentation
 */

import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';

export const useStyles = makeStyles({
  tagPrimaryText: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionContent: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchContainer: {
    marginTop: tokens.spacingVerticalS,
  },
  hubNotAvailable: {
    color: tokens.colorNeutralForeground3,
    marginLeft: tokens.spacingHorizontalL,
  },
});
