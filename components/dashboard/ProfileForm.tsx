"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types";

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="full_name">Бүтэн нэр</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Утасны дугаар</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          Мэдээлэл шинэчлэгдлээ.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </form>
  );
}
