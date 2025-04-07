import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DeleteSubscriptionDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  subscriptionName: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A dedicated dialog component for subscription deletion confirmation
 */
const DeleteSubscriptionDialog: React.FC<DeleteSubscriptionDialogProps> = ({
  isOpen,
  isDeleting,
  subscriptionName,
  onClose,
  onConfirm,
}) => {
  // Function to handle the delete confirmation
  const handleDelete = () => {
    console.log('Delete confirmation clicked for:', subscriptionName);
    onConfirm();
    // Note: We don't close the dialog here, it will be closed by the parent component
    // after the deletion is complete or fails, to show loading state
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará la subscripción "{subscriptionName}" permanentemente.
            No podrás deshacer esta acción.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubscriptionDialog; 