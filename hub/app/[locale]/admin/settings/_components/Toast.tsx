"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [message, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 md:justify-end md:px-6">
      <p
        role="status"
        className="w-full rounded-lg border border-border/40 bg-card px-4 py-3 text-sm text-card-foreground transition-opacity duration-200 ease-out motion-reduce:transition-none md:w-80"
      >
        {message}
      </p>
    </div>
  );
}
