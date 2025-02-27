import React from "react";
import { cn } from "../../lib/utils";

/* Dialog Root */
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
      if (onOpenChange) onOpenChange(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    if (onOpenChange) onOpenChange(value);
  };

  // Create context to manage dialog state
  const contextValue = {
    open: isOpen,
    onOpenChange: handleOpenChange,
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

/* Dialog Context */
type DialogContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType | undefined>(
  undefined
);

export const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog provider");
  }
  return context;
};

/* Dialog Trigger */
interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();
  
  const handleClick = () => {
    onOpenChange(true);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
    });
  }

  return <span onClick={handleClick}>{children}</span>;
}

/* Dialog Portal */
interface DialogPortalProps {
  children: React.ReactNode;
}

export function DialogPortal({ children }: DialogPortalProps) {
  return <>{children}</>;
}

/* Dialog Overlay */
interface DialogOverlayProps {
  className?: string;
}

export function DialogOverlay({ className }: DialogOverlayProps) {
  const { open } = useDialogContext();
  
  if (!open) return null;
  
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity", 
        className
      )}
    />
  );
}

/* Dialog Content */
interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogContent({ className, children }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  
  if (!open) return null;
  
  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className={cn(
            "bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4 relative",
            className
          )}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </>
  );
}

/* Dialog Header */
interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

/* Dialog Title */
interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold", className)}>
      {children}
    </h2>
  );
}

/* Dialog Description */
interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn("text-gray-600 mt-2", className)}>
      {children}
    </p>
  );
}

/* Dialog Footer */
interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn("mt-6 flex justify-end space-x-2", className)}>
      {children}
    </div>
  );
}

/* Dialog Close */
interface DialogCloseProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogClose({ className, children }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext();
  
  return (
    <span 
      className={className}
      onClick={() => onOpenChange(false)}
    >
      {children}
    </span>
  );
} 