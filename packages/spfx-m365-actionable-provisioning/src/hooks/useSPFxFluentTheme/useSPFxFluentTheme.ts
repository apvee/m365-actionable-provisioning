import type { Theme } from '@fluentui/react-components';
import {
  type BaseComponentContext,
  type IReadonlyTheme,
  ThemeProvider,
  type ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';
import * as React from 'react';

import { createFluentV9ThemeFromSPFxTheme } from '../../internal/theme/createFluentV9ThemeFromSPFxTheme';

function readTheme(context: BaseComponentContext): IReadonlyTheme | undefined {
  return context.serviceScope.consume(ThemeProvider.serviceKey).tryGetTheme();
}

export function useSPFxFluentTheme(context: BaseComponentContext): Theme {
  const [themeVariant, setThemeVariant] = React.useState<IReadonlyTheme | undefined>(
    () => readTheme(context),
  );

  React.useEffect(() => {
    const provider = context.serviceScope.consume(ThemeProvider.serviceKey);
    let active = true;
    let disposed = false;
    const observer: ISPEventObserver = {
      instanceId: `${context.instanceId}-spfx-fluent-theme`,
      componentId: context.manifest.id,
      get isDisposed() {
        return disposed;
      },
      dispose: () => {
        disposed = true;
      },
    };
    const handleThemeChanged = (args: ThemeChangedEventArgs): void => {
      if (active && !observer.isDisposed) setThemeVariant(args.theme);
    };

    setThemeVariant(provider.tryGetTheme());
    provider.themeChangedEvent.add(observer, handleThemeChanged);

    return () => {
      active = false;
      provider.themeChangedEvent.remove(observer, handleThemeChanged);
      observer.dispose();
    };
  }, [context]);

  return React.useMemo(
    () => createFluentV9ThemeFromSPFxTheme(themeVariant),
    [themeVariant],
  );
}
