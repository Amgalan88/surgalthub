"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/lib/actions/auth";

const initialState: RequestResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState
  );

  if (state.sent) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
        И-мэйлээ шалгана уу — хэрэв энэ хаяг бүртгэлтэй бол нууц үг
        сэргээх холбоос очсон байх ёстой.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">И-мэйл</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Илгээж байна..." : "Холбоос илгээх"}
      </Button>
    </form>
  );
}
