/**
 * Internal theme management for property pane fields.
 *
 * @internal
 * @packageDocumentation
 */

import {
    type BaseComponentContext,
    type IReadonlyTheme,
    ThemeProvider,
    type ThemeChangedEventArgs,
} from '@microsoft/sp-component-base';
import type { ISPEventObserver } from '@microsoft/sp-core-library';

import {
    type Theme,
} from '@fluentui/react-components';

import { createFluentV9ThemeFromSPFxTheme } from '../../utils/spfx-theme';

export type PropertyPaneThemeController = Readonly<{
    ensureInitialized: () => void;
    dispose: () => void;
    getFluentV9Theme: () => Theme;
}>;

export function createPropertyPaneThemeController(
    context: BaseComponentContext,
    onThemeChanged: () => void
): PropertyPaneThemeController {
    let themeProvider: ThemeProvider | undefined;
    let themeVariant: IReadonlyTheme | undefined;
    let subscribed = false;

    // Adapter used for SPFx event subscription without requiring callers to cast.
    let observerDisposed = false;
    const observer: ISPEventObserver = {
        instanceId: context.instanceId,
        componentId: context.manifest.id,
        get isDisposed() {
            return observerDisposed;
        },
        dispose: () => {
            observerDisposed = true;
        },
    };

    const getFluentV9Theme = (): Theme => {
        return createFluentV9ThemeFromSPFxTheme(themeVariant);
    };

    const handleThemeChanged = (args: ThemeChangedEventArgs): void => {
        themeVariant = args.theme;
        onThemeChanged();
    };

    const ensureInitialized = (): void => {
        if (!themeProvider) {
            themeProvider = context.serviceScope.consume(ThemeProvider.serviceKey);
        }

        themeVariant = themeProvider.tryGetTheme();

        if (!subscribed) {
            themeProvider.themeChangedEvent.add(observer, handleThemeChanged);
            subscribed = true;
        }
    };

    const dispose = (): void => {
        if (themeProvider && subscribed) {
            themeProvider.themeChangedEvent.remove(observer, handleThemeChanged);
            subscribed = false;
        }
    };

    return {
        ensureInitialized,
        dispose,
        getFluentV9Theme,
    };
}
