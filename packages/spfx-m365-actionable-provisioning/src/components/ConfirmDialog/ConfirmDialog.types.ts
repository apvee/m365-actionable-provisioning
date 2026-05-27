export type ConfirmDialogStrings = Readonly<{
  confirmLabel: string;
  cancelLabel: string;
}>;

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmAppearance?: 'primary' | 'secondary' | 'subtle';

  /** Optional localized strings overrides. */
  strings?: Partial<ConfirmDialogStrings>;

  onConfirm: () => void;
  onCancel: () => void;
}
