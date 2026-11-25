"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrderAction, type CheckoutState } from "@/app/actions/checkout";
import { Field } from "@/components/form";

export function CheckoutForm({
  defaultName,
  stripeEnabled,
}: {
  defaultName: string;
  stripeEnabled: boolean;
}) {
  const [state, action] = useActionState<CheckoutState, FormData>(
    placeOrderAction,
    {},
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        defaultValue={defaultName}
        required
        error={fe.fullName}
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        error={fe.phone}
        hint="We'll message you when the proof is ready."
      />
      <Field
        label="Address"
        name="line1"
        autoComplete="address-line1"
        required
        error={fe.line1}
      />
      <Field
        label="Apartment, landmark (optional)"
        name="line2"
        autoComplete="address-line2"
        error={fe.line2}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="City"
          name="city"
          autoComplete="address-level2"
          required
          error={fe.city}
        />
        <Field
          label="State"
          name="state"
          autoComplete="address-level1"
          required
          error={fe.state}
        />
        <Field
          label="PIN code"
          name="postcode"
          inputMode="numeric"
          autoComplete="postal-code"
          required
          error={fe.postcode}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-[0.875rem] font-medium text-[#8b1f1f]">
          {state.error}
        </p>
      ) : null}

      <Submit stripeEnabled={stripeEnabled} />

      <p className="text-[0.8125rem] text-ink/70">
        {stripeEnabled
          ? "You'll be taken to Stripe to pay securely."
          : "No payment is taken now — we'll confirm your order and arrange payment directly."}
      </p>
    </form>
  );
}

function Submit({ stripeEnabled }: { stripeEnabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pill w-full justify-center disabled:opacity-60"
    >
      {pending
        ? "Placing order…"
        : stripeEnabled
          ? "Continue to payment"
          : "Place order"}
      {pending ? null : <span aria-hidden="true">↗</span>}
    </button>
  );
}
