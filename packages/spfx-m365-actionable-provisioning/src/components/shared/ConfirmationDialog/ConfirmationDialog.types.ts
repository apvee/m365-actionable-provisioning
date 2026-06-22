export type ConfirmationDialogStrings = Readonly<{
  confirmLabel: string;
  cancelLabel: string;
}>;

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmAppearance?: 'primary' | 'secondary' | 'subtle';

  /** Optional localized strings overrides. */
  strings?: Partial<ConfirmationDialogStrings>;

  onConfirm: () => void;
  onCancel: () => void;
}
