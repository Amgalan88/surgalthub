"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePassword, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="password">Шинэ нууц үг</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm_password">Нууц үг давтах</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Хадгалж байна..." : "Нууц үг шинэчлэх"}
      </Button>
    </form>
  );
}
