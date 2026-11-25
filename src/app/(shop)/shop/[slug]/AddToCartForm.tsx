"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addToCartAction, type CartActionState } from "@/app/actions/cart";
import { formatInr } from "@/lib/money";
import { MAX_UPLOAD_BYTES } from "@/lib/storage.client";

type Model = { id: string; name: string; extraPaise: number };
type Brand = { id: string; name: string; models: Model[] };

export function AddToCartForm({
  productId,
  basePaise,
  brands,
}: {
  productId: string;
  basePaise: number;
  brands: Brand[];
}) {
  const router = useRouter();
  const [state, action] = useActionState<CartActionState, FormData>(
    addToCartAction,
    {},
  );

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const models = useMemo(
    () => brands.find((b) => b.id === brandId)?.models ?? [],
    [brandId, brands],
  );

  const selectedModel = models.find((m) => m.id === modelId);
  const unitPaise = basePaise + (selectedModel?.extraPaise ?? 0);

  // Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (state.ok) {
      router.push("/cart");
      router.refresh();
    }
  }, [state.ok, router]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);

    if (preview) URL.revokeObjectURL(preview);

    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError("That image is over 10MB — please choose a smaller file.");
      e.target.value = "";
      setPreview(null);
      setFileName(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setFileError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={action} className="mt-10 space-y-7">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />

      {/* Step 1 — phone */}
      <fieldset className="border-t border-ink/20 pt-6">
        <legend className="micro">01 / Your phone</legend>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="micro block normal-case">
              Brand
            </label>
            <select
              id="brand"
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setModelId("");
              }}
              className="mt-2 block min-h-12 w-full rounded-xl border border-ink/25 bg-cream px-4 text-[1rem] tracking-[-0.02em] outline-none focus:border-ink"
            >
              <option value="">Choose a brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phoneModelId" className="micro block normal-case">
              Model
            </label>
            <select
              id="phoneModelId"
              name="phoneModelId"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              disabled={!brandId}
              required
              className="mt-2 block min-h-12 w-full rounded-xl border border-ink/25 bg-cream px-4 text-[1rem] tracking-[-0.02em] outline-none focus:border-ink disabled:opacity-50"
            >
              <option value="">
                {brandId ? "Choose a model" : "Pick a brand first"}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.extraPaise > 0 ? ` (+${formatInr(m.extraPaise)})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!brandId ? (
          <p className="mt-3 text-[0.8125rem] text-ink/65">
            Can&rsquo;t find your model? Add it in the notes below and we&rsquo;ll
            confirm before printing.
          </p>
        ) : null}
      </fieldset>

      {/* Step 2 — artwork */}
      <fieldset className="border-t border-ink/20 pt-6">
        <legend className="micro">02 / Make it yours (optional)</legend>

        <p className="mt-3 max-w-[48ch] text-[0.9375rem] leading-relaxed tracking-[-0.02em] text-ink/75">
          Send a photograph or your own artwork and we&rsquo;ll set it into this
          design by hand, then email a proof before anything is printed.
        </p>

        <div className="mt-4 flex flex-wrap items-start gap-5">
          {preview ? (
            <div className="relative">
              {/* Local object URL, so next/image optimisation is bypassed. */}
              <Image
                src={preview}
                alt="Your uploaded artwork"
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-xl border border-ink/20 object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream"
                aria-label="Remove uploaded image"
              >
                ×
              </button>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="artwork"
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-ink px-5 text-[0.9375rem] font-medium"
            >
              {fileName ? "Choose a different image" : "Upload your image"}
            </label>
            <input
              ref={fileRef}
              id="artwork"
              name="artwork"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
              onChange={onFile}
              className="sr-only"
            />
            <p className="mt-2 text-[0.8125rem] text-ink/65">
              {fileName ?? "JPG, PNG, WEBP, HEIC or AVIF · up to 10MB"}
            </p>
            {fileError ? (
              <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-[#8b1f1f]">
                {fileError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="note" className="micro block normal-case">
            Notes for the studio
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={500}
            placeholder="A name to add, colours to favour, anything we should know."
            className="mt-2 block w-full rounded-xl border border-ink/25 bg-cream px-4 py-3 text-[1rem] tracking-[-0.02em] outline-none focus:border-ink"
          />
        </div>
      </fieldset>

      {/* Step 3 — quantity + submit */}
      <div className="border-t border-ink/20 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="micro">Qty</span>
            <div className="flex items-center rounded-full border border-ink/25">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-l-full text-lg"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span aria-live="polite" className="w-8 text-center font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-r-full text-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-[1.25rem] font-medium tracking-[-0.03em]">
            {formatInr(unitPaise * quantity)}
          </p>
        </div>

        {state.error ? (
          <p role="alert" className="mt-4 text-[0.875rem] font-medium text-[#8b1f1f]">
            {state.error}
          </p>
        ) : null}

        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pill mt-5 w-full justify-center disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add to cart"}
      {pending ? null : <span aria-hidden="true">↗</span>}
    </button>
  );
}
