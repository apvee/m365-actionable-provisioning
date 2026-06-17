/**
 * Internal confirmation dialog component for user confirmation prompts.
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

import type { ConfirmationDialogProps, ConfirmationDialogStrings } from './ConfirmationDialog.types';

import * as locStrings from 'SPFxProvisioningUIStrings';

const DEFAULT_STRINGS: ConfirmationDialogStrings = {
  confirmLabel: locStrings.ConfirmDialog.ConfirmLabel,
  cancelLabel: locStrings.ConfirmDialog.CancelLabel,
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
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
    } satisfies ConfirmationDialogStrings;
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

ConfirmationDialog.displayName = 'ConfirmationDialog';
