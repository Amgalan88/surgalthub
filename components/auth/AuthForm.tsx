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
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Утасны дугаар</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="99112233"
              autoComplete="tel"
              pattern="\+?[0-9\s\-]{8,15}"
              title="8 оронтой утасны дугаар"
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
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
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
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
        {mode === "register" && (
          <p className="mt-1.5 text-xs text-slate-400">Доод тал нь 6 тэмдэгт.</p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          {state.notice}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={pending || Boolean(state.notice)}
      >
        {pending
          ? "Түр хүлээнэ үү..."
          : mode === "login"
            ? "Нэвтрэх"
            : "Бүртгүүлэх"}
      </Button>
    </form>
  );
}
