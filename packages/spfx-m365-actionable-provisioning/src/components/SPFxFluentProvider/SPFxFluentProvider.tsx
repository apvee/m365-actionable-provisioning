/**
 * SPFx-aware Fluent UI 9 provider for package consumers.
 *
 * @packageDocumentation
 */

import * as React from 'react';

import {
    type BaseComponentContext,
    type IReadonlyTheme,
    ThemeProvider,
    type ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';

import {
    FluentProvider,
    IdPrefixProvider,
} from '@fluentui/react-components';

import { createFluentV9ThemeFromSPFxTheme } from '../../utils/spfx-theme';
import type { SPFxFluentProviderProps } from './SPFxFluentProvider.types';

function readSPFxTheme(context: BaseComponentContext): IReadonlyTheme | undefined {
    return context.serviceScope.consume(ThemeProvider.serviceKey).tryGetTheme();
}

function createThemeObserver(context: BaseComponentContext): ISPEventObserver {
    let observerDisposed = false;

    return {
        instanceId: `${context.instanceId}-spfx-fluent-provider`,
        componentId: context.manifest.id,
        get isDisposed() {
            return observerDisposed;
        },
        dispose: () => {
            observerDisposed = true;
        },
    };
}

function useSPFxThemeVariant(context: BaseComponentContext): IReadonlyTheme | undefined {
    const [themeVariant, setThemeVariant] = React.useState<IReadonlyTheme | undefined>(() => readSPFxTheme(context));

    React.useEffect(() => {
        const themeProvider = context.serviceScope.consume(ThemeProvider.serviceKey);
        const observer = createThemeObserver(context);
        const handleThemeChanged = (args: ThemeChangedEventArgs): void => {
            setThemeVariant(args.theme);
        };

        setThemeVariant(themeProvider.tryGetTheme());
        themeProvider.themeChangedEvent.add(observer, handleThemeChanged);

        return () => {
            themeProvider.themeChangedEvent.remove(observer, handleThemeChanged);
            observer.dispose();
        };
    }, [context]);

    return themeVariant;
}

/**
 * Wraps SPFx React content in the same Fluent provider boundary used by the
 * package's property pane fields.
 *
 * @public
 */
export const SPFxFluentProvider: React.FC<SPFxFluentProviderProps> = ({
    children,
    context,
    idPrefix,
    applyStylesToPortals = true,
}) => {
    const themeVariant = useSPFxThemeVariant(context);
    const theme = React.useMemo(() => createFluentV9ThemeFromSPFxTheme(themeVariant), [themeVariant]);

    const content = (
        <FluentProvider theme={theme} applyStylesToPortals={applyStylesToPortals}>
            {children}
        </FluentProvider>
    );

    if (!idPrefix) return content;

    return (
        <IdPrefixProvider value={idPrefix}>
            {content}
        </IdPrefixProvider>
    );
};

SPFxFluentProvider.displayName = 'SPFxFluentProvider';
