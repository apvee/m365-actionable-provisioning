/**
 * Internal ConfirmDialog component for user confirmation prompts.
 *
 * @internal
 * @packageDocumentation
 */

import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';

import type { ConfirmDialogProps, ConfirmDialogStrings } from './ConfirmDialog.types';

import * as locStrings from 'SPFxProvisioningUIStrings';

const DEFAULT_STRINGS: ConfirmDialogStrings = {
  confirmLabel: locStrings.ConfirmDialog.ConfirmLabel,
  cancelLabel: locStrings.ConfirmDialog.CancelLabel,
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmAppearance = 'primary',
  strings,
  onConfirm,
  onCancel,
}) => {
  const s = React.useMemo(() => {
    return {
      ...DEFAULT_STRINGS,
      ...(strings ?? {}),
    } satisfies ConfirmDialogStrings;
  }, [strings]);

  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) handleCancel();
      }}
      modalType="modal"
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{message}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleCancel}>
              {s.cancelLabel}
            </Button>
            <Button appearance={confirmAppearance} onClick={handleConfirm}>
              {s.confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
