import React from "react";
import { cn } from "../../lib/utils";

/* AlertDialog Root */
interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
}

/* AlertDialog Context */
type AlertDialogContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextType | undefined>(
  undefined
);

export const useAlertDialogContext = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error("AlertDialog components must be used within an AlertDialog provider");
  }
  return context;
};

/* AlertDialog Trigger */
interface AlertDialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function AlertDialogTrigger({ children, asChild = false }: AlertDialogTriggerProps) {
  const { onOpenChange } = useAlertDialogContext();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        // Call the original onClick if it exists
        if (children.props.onClick) {
          children.props.onClick(e);
        }
      },
    });
  }

  return <span onClick={handleClick}>{children}</span>;
}

/* AlertDialog Content */
interface AlertDialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  const { open } = useAlertDialogContext();
  
  if (!open) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto p-4">
        <div
          className={cn(
            "bg-background max-w-md w-full rounded-lg p-6 shadow-lg mx-auto",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

/* AlertDialog Header */
interface AlertDialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

/* AlertDialog Title */
interface AlertDialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold", className)}>
      {children}
    </h2>
  );
}

/* AlertDialog Description */
interface AlertDialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground mt-2", className)}>
      {children}
    </p>
  );
}

/* AlertDialog Footer */
interface AlertDialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <div className={cn("mt-6 flex justify-end space-x-2", className)}>
      {children}
    </div>
  );
}

/* AlertDialog Action (confirm button) */
interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function AlertDialogAction({ className, children, ...props }: AlertDialogActionProps) {
  const { onOpenChange } = useAlertDialogContext();
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        className
      )}
      onClick={async (e) => {
        try {
          console.log(`AlertDialogAction: Starting click handler`);
          
          // First run the onClick handler (if any) and await it in case it's async
          // This way we wait for the action to complete before closing the dialog
          if (props.onClick) {
            console.log(`AlertDialogAction: Executing onClick handler`);
            try {
              const result = props.onClick(e);
              if (result instanceof Promise) {
                console.log(`AlertDialogAction: Awaiting async onClick result`);
                await result;
                console.log(`AlertDialogAction: onClick promise resolved`);
              } else {
                console.log(`AlertDialogAction: onClick handler completed (sync)`);
              }
            } catch (clickError) {
              console.error(`AlertDialogAction: Error in onClick handler:`, clickError);
              throw clickError; // Re-throw to be caught by outer try-catch
            }
          }
          
          // Now close the dialog after the action succeeds
          // We use setTimeout to ensure this happens after React's event loop cycle
          console.log(`AlertDialogAction: Scheduling dialog close`);
          window.setTimeout(() => {
            console.log(`AlertDialogAction: Closing dialog`);
            onOpenChange(false);
          }, 100);
        } catch (error) {
          console.error("Error in AlertDialogAction onClick handler:", error);
          // Close dialog even if the action fails
          console.log(`AlertDialogAction: Scheduling dialog close after error`);
          window.setTimeout(() => {
            console.log(`AlertDialogAction: Closing dialog after error`);
            onOpenChange(false);
          }, 100);
        }
      }}
      // Remove onClick from props so it doesn't get added twice
      {...{ ...props, onClick: undefined }}
    >
      {children}
    </button>
  );
}

/* AlertDialog Cancel (cancel button) */
interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function AlertDialogCancel({ className, children, ...props }: AlertDialogCancelProps) {
  const { onOpenChange } = useAlertDialogContext();
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "h-10 px-4 py-2",
        className
      )}
      onClick={(e) => {
        e.stopPropagation(); // Stop event propagation
        if (props.onClick) props.onClick(e);
        onOpenChange(false);
      }}
      type="button" // Explicitly set button type to prevent form submission
      {...props}
    >
      {children || "Cancel"}
    </button>
  );
}