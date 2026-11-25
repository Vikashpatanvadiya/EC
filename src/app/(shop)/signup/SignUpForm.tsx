"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type FormState } from "@/app/actions/auth";
import { Field, SubmitButton } from "@/components/form";

export function SignUpForm() {
  const [state, action] = useActionState<FormState, FormData>(signUpAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <Field label="Name" name="name" autoComplete="name" required error={fe.name} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fe.email}
      />
      <Field
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        error={fe.phone}
        hint="So we can reach you about your design proof."
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fe.password}
        hint="At least 8 characters."
      />

      {state.error ? (
        <p role="alert" className="text-[0.875rem] font-medium text-[#8b1f1f]">
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <SubmitButton pending={pending}>Create account</SubmitButton>;
}
