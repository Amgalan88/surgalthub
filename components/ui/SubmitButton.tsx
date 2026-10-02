"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Submit button for plain server-action forms. Disables itself while the
 * action runs so a slow connection cannot produce double submissions.
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
