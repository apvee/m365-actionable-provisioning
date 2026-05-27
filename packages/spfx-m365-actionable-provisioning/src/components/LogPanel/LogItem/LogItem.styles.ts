import { makeStyles, tokens } from '@fluentui/react-components';

export const useLogItemStyles = makeStyles({
  // Layout styles removed - now using @apvee/react-layout-kit components
  iconContainer: {
    flexShrink: 0,
    paddingTop: '2px',
  },
  content: {
    flex: 1,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    backgroundColor: tokens.colorPaletteRedBackground2,
    padding: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalXXS,
  },
  message: {
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXXS,
  },
  childrenContainer: {
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
    paddingLeft: tokens.spacingHorizontalXL,
    marginLeft: '9px',
    marginTop: tokens.spacingVerticalXS,
  },
  titleText: {
    display: 'block',
    wordBreak: 'break-word',
  },
  titleVerb: {
    fontWeight: tokens.fontWeightSemibold,
  },
  titleRest: {
    fontWeight: tokens.fontWeightRegular,
  },
});
