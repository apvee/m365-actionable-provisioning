/**
 * SPFx theme helpers for Fluent UI 9.
 *
 * @packageDocumentation
 */

import type { IReadonlyTheme } from '@microsoft/sp-component-base';

/**
 * @remarks
 * Intentional Fluent UI v8 bridge.
 *
 * SPFx exposes theme variants in the v8 shape. Fluent UI 9 currently needs
 * the migration utility to turn that SPFx theme into v9 tokens.
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

/**
 * Converts the current SPFx theme variant to a Fluent UI 9 theme.
 *
 * Falls back to `webLightTheme` when SPFx has no theme variant available or
 * when the migration bridge cannot convert the supplied theme.
 *
 * @public
 */
export function createFluentV9ThemeFromSPFxTheme(themeVariant?: IReadonlyTheme): Theme {
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
}
