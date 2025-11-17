"use client";
import React from "react";
import ReactDOM from "react-dom";
import { X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  open: boolean;
  cancelButtonLabel?: string;
  submitButtonLabel?: string;
  onSubmit: () => void;
  confirmationMessage?: string;
  heading?: string;
  isLoading?: boolean;
  loaderColor?: string;
  customZIndex?: number;
  container?: Element;
}

const TOAST_COLOR = "#4ade80"; // Green color
const CANCEL_COLOR = "#ef4444"; // Red color

const ConfirmationMessageToast: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  cancelButtonLabel = "Cancel",
  submitButtonLabel = "Confirm",
  confirmationMessage,
  heading = "Confirm",
  isLoading = false,
  loaderColor,
  customZIndex,
  container,
}) => {
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);

  // Calculate z-index values similar to MUI modal/backdrop layering
  // Use a higher default to ensure we are above MUI Drawer(1200)/Modal(1300)
  const baseZIndex = customZIndex || 2000;
  const backdropZIndex = baseZIndex + 1;
  const paperZIndex = baseZIndex + 2;

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit();
  };

  React.useEffect(() => {
    if (open && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timeoutId = setTimeout(() => {
        if (submitButtonRef.current) {
          submitButtonRef.current.focus();
        }
      }, 100);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timeoutId);
      };
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  // Render into body to escape parent stacking contexts (e.g., Drawer)
  const portalContainer = container || (typeof document !== 'undefined' ? document.body : null);
  if (!portalContainer) return null;

  return ReactDOM.createPortal(
    <>
      {/* Non-interactive transparent backdrop to establish stacking above drawers */}
      <div
        className={cn("fixed inset-0")}
        style={{ zIndex: backdropZIndex, backgroundColor: "transparent", pointerEvents: "none" }}
        aria-hidden="true"
      />
      {/* Toast */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0",
          "bg-gradient-to-r from-green-400 to-green-600",
          "shadow-lg",
          "animate-in slide-in-from-top duration-300"
        )}
        style={{
          zIndex: paperZIndex,
          backgroundColor: TOAST_COLOR,
          pointerEvents: "auto",
        }}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        {/* Desktop Layout: Message and buttons in a row */}
        <div className="hidden sm:flex items-center justify-center px-6 py-4 gap-4">
          {/* Message */}
          {confirmationMessage && (
            <p
              id="confirmation-description"
              className="text-white text-sm md:text-base font-normal leading-relaxed"
            >
              {confirmationMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-full bg-white",
                "flex items-center justify-center",
                "transition-all duration-200 ease-in-out transform hover:scale-105",
                "hover:bg-white/90 active:bg-white/80",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              )}
              aria-label="Cancel"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </button>

            <button
              ref={submitButtonRef}
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-full bg-white",
                "flex items-center justify-center",
                "transition-all duration-200 ease-in-out transform hover:scale-105",
                "hover:bg-white/90 active:bg-white/80",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              )}
              aria-label="Confirm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" style={{ color: TOAST_COLOR }} />
              ) : (
                <Check className="w-5 h-5 md:w-6 md:h-6" style={{ color: TOAST_COLOR }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Layout: Message on top, buttons below */}
        <div className="sm:hidden flex flex-col items-center justify-center px-4 py-4 gap-3">
          {/* Message */}
          {confirmationMessage && (
            <p
              id="confirmation-description-mobile"
              className="text-white text-sm font-normal leading-relaxed text-center w-full"
            >
              {confirmationMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-full bg-white",
                "flex items-center justify-center",
                "transition-all duration-200 ease-in-out transform hover:scale-105",
                "hover:bg-white/90 active:bg-white/80",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              )}
              aria-label="Cancel"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>

            <button
              ref={submitButtonRef}
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-full bg-white",
                "flex items-center justify-center",
                "transition-all duration-200 ease-in-out transform hover:scale-105",
                "hover:bg-white/90 active:bg-white/80",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              )}
              aria-label="Confirm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: TOAST_COLOR }} />
              ) : (
                <Check className="w-5 h-5" style={{ color: TOAST_COLOR }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    portalContainer
  );
};

export default ConfirmationMessageToast;