"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import React, { useRef } from "react";

interface ActionFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  action: (formData: FormData) => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  resetOnSuccess?: boolean;
}

export function ActionForm({
  action,
  children,
  className,
  successMessage = "Changes saved successfully",
  errorMessage = "Failed to save changes",
  loadingMessage = "Saving...",
  resetOnSuccess = false,
  ...props
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        try {
          const promise = Promise.resolve(action(formData));
          toast.promise(promise, {
            loading: loadingMessage,
            success: () => {
              if (resetOnSuccess) formRef.current?.reset();
              return successMessage;
            },
            error: errorMessage,
          });
          await promise;
        } catch (error) {
          console.error("Action error:", error);
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </form>
  );
}

export function SubmitButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`${className} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
