import { type Theme, webLightTheme } from '@fluentui/react-components';
import { createV9Theme } from '@fluentui/react-migration-v8-v9';
import { createTheme, type ITheme as V8Theme } from '@fluentui/theme';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

export function createFluentV9ThemeFromSPFxTheme(
  themeVariant: IReadonlyTheme | undefined,
): Theme {
  if (!themeVariant) return webLightTheme;

  try {
    const v8Theme: V8Theme = createTheme({
      palette: themeVariant.palette,
      semanticColors: themeVariant.semanticColors,
      fonts: themeVariant.fonts,
      isInverted: themeVariant.isInverted,
    });

    return createV9Theme(v8Theme, {
      ...webLightTheme,
      fontFamilyBase: v8Theme.fonts.medium.fontFamily,
    });
  } catch {
    return webLightTheme;
  }
}
