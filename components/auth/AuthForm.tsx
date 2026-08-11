"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AuthFormState } from "@/lib/actions/auth";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: Mode;
  action: (
    state: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>;
  next: string;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {mode === "register" && (
        <>
          <div>
            <Label htmlFor="full_name">Бүтэн нэр</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Бат Болд"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Утасны дугаар</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="99112233"
              required
            />
          </div>
        </>
      )}

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

      <div>
        <Label htmlFor="password">Нууц үг</Label>
        <Input
          id="password"
          name="password"
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
        {pending
          ? "Түр хүлээнэ үү..."
          : mode === "login"
            ? "Нэвтрэх"
            : "Бүртгүүлэх"}
      </Button>
    </form>
  );
}
