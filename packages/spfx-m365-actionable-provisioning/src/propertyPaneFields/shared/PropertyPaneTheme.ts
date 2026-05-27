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

/**
 * @remarks
 * **Intentional Fluent UI v8 Bridge**
 * 
 * This file imports `createTheme` from `@fluentui/react` (v8) because:
 * 1. SPFx PropertyPane theming requires v8 theme objects for proper integration
 * 2. The `createV9Theme` migration utility from `@fluentui/react-migration-v8-v9`
 *    requires a v8 theme as input to produce a v9 theme
 * 3. There is no direct v9 API to convert SPFx `IReadonlyTheme` to Fluent UI 9 tokens
 * 
 * This is an intentional exception to Constitution Principle III (Fluent UI 9 only).
 * The v8 dependency will be removed when SPFx provides native v9 theming support.
 * 
 * Related: specs/002-audit-remediation/spec.md (Edge Cases section)
 */
import {
    createTheme,
    type Theme as V8Theme,
} from '@fluentui/react';

import {
    type Theme,
    webLightTheme,
} from '@fluentui/react-components';
import { createV9Theme } from '@fluentui/react-migration-v8-v9';

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
        if (!themeVariant) return webLightTheme;

        try {
            const v8Theme: V8Theme = createTheme({
                palette: themeVariant.palette,
                semanticColors: themeVariant.semanticColors,
                fonts: themeVariant.fonts,
                isInverted: themeVariant.isInverted,
            });

            return createV9Theme(v8Theme);
        } catch {
            return webLightTheme;
        }
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
