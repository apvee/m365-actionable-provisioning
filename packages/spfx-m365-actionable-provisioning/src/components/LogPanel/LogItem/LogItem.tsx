import * as React from 'react';
import { InfoLabel } from '@fluentui/react-components';
import { Fade } from '@fluentui/react-motion-components-preview';
import { Box, Flex, Stack } from '@apvee/react-layout-kit';

import { useLogItemStyles } from './LogItem.styles';
import type { LogItemProps } from './LogItem.types';

export function LogItem<TEntry>({ entry, renderers }: LogItemProps<TEntry>): JSX.Element {
  const styles = useLogItemStyles();

  const infoText = renderers.getInfo?.(entry);
  const children = renderers.getChildren(entry);

  return (
    <>
      <Fade appear visible>
        <Flex direction="row" align="flex-start" gap={{ xs: 'sm', md: 'md' }} py="xs">
          <Box className={styles.iconContainer}>{renderers.renderIcon(entry, styles)}</Box>

          <Stack gap="xs" className={styles.content}>
            <InfoLabel info={infoText}>{renderers.renderTitle(entry, styles)}</InfoLabel>

            <Flex direction="row" gap="sm" align="center" wrap="wrap">
              {renderers.renderMetadata(entry, styles)}
            </Flex>

            {renderers.renderExtra ? renderers.renderExtra(entry, styles) : null}
          </Stack>
        </Flex>
      </Fade>

      {children && children.length > 0 && (
        <div className={styles.childrenContainer}>
          {children.map((child) => (
            <LogItem key={renderers.getKey(child)} entry={child} renderers={renderers} />
          ))}
        </div>
      )}
    </>
  );
}
