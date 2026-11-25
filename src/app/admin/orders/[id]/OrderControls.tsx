"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { OrderStatus } from "@prisma/client";
import { updateOrderAction, type AdminState } from "@/app/actions/admin";
import { ALL_STATUSES, STATUS_LABEL } from "@/lib/orderStatus";

export function OrderControls({
  orderId,
  status,
  adminNote,
}: {
  orderId: string;
  status: OrderStatus;
  adminNote: string;
}) {
  const [state, action] = useActionState<AdminState, FormData>(
    updateOrderAction,
    {},
  );

  return (
    <form action={action} className="rounded-[20px] border border-ink/15 p-5">
      <h2 className="micro">Update order</h2>
      <input type="hidden" name="orderId" value={orderId} />

      <label htmlFor="status" className="micro mt-4 block normal-case">
        Status
      </label>
      {/* Keyed on the server value so a save re-mounts the control and it
          shows the saved status rather than the stale typed one. */}
      <select
        key={status}
        id="status"
        name="status"
        defaultValue={status}
        className="mt-2 block min-h-11 w-full rounded-xl border border-ink/25 bg-cream px-3 text-[0.9375rem] outline-none focus:border-ink"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <label htmlFor="adminNote" className="micro mt-4 block normal-case">
        Studio note
      </label>
      <textarea
        key={adminNote}
        id="adminNote"
        name="adminNote"
        rows={3}
        defaultValue={adminNote}
        maxLength={1000}
        placeholder="Proof sent, awaiting approval…"
        className="mt-2 block w-full rounded-xl border border-ink/25 bg-cream px-3 py-2 text-[0.9375rem] outline-none focus:border-ink"
      />
      <p className="mt-1.5 text-[0.75rem] text-ink/65">
        Internal only — the customer never sees this.
      </p>

      {state.error ? (
        <p role="alert" className="mt-3 text-[0.8125rem] font-medium text-[#8b1f1f]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="mt-3 text-[0.8125rem] font-medium">
          Saved.
        </p>
      ) : null}

      <Save />
    </form>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pill mt-4 w-full justify-center disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
