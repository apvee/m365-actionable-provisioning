import * as React from 'react';

import type { BaseComponentContext } from '@microsoft/sp-component-base';

/**
 * Props for {@link SPFxFluentProvider}.
 *
 * @public
 */
export type SPFxFluentProviderProps = Readonly<{
    context: BaseComponentContext;
    children: React.ReactNode;
    idPrefix?: string;
    applyStylesToPortals?: boolean;
}>;
