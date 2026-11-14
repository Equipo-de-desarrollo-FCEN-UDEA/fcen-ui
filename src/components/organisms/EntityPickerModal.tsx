import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "../atoms/Button";
import { Modal } from "../molecules/Modal";

export type EntityPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  filters?: ReactNode;
  selectedSummary?: ReactNode;
  hasError?: boolean;
  errorMessage?: string;
  children: ReactNode;
  selectedEntityId?: string | null;
  chooseLabel: string;
  onChoose: () => void;
};

export const EntityPickerModal = ({
  isOpen,
  onClose,
  title,
  description,
  filters,
  selectedSummary,
  hasError = false,
  errorMessage,
  children,
  selectedEntityId,
  chooseLabel,
  onChoose,
}: EntityPickerModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    description={description}
    size="lg"
    className="max-h-[88vh] max-w-6xl overflow-hidden"
    showCloseButton={false}
  >
    <div className="max-h-[66vh] space-y-4 overflow-y-auto pr-1">
      {filters}
      {selectedSummary}
      {hasError && errorMessage && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage}
        </div>
      )}
      {children}
    </div>
    <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
      <Button label="Cancelar" variant="outline" iconLeft={<X size={18} aria-hidden />} onClick={onClose} />
      {selectedEntityId && (
        <Button label={chooseLabel} iconLeft={<Check size={18} aria-hidden />} onClick={onChoose} />
      )}
    </div>
  </Modal>
);
