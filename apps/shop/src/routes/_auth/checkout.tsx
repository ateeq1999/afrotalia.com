import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { addAddress, getCheckoutContext, placeOrder } from "@/functions/checkout";
import { formatTZS } from "@/lib/shop";

export const Route = createFileRoute("/_auth/checkout")({
  component: CheckoutPage,
  loader: async () => {
    const context = await getCheckoutContext();
    if (context.itemCount === 0) throw redirect({ to: "/cart" });
    return context;
  },
});

const STEPS = ["Address", "Delivery", "Payment", "Confirmation"] as const;
type Step = 0 | 1 | 2 | 3;

const PAYMENT_METHODS = [
  { value: "mpesa" as const, label: "Mobile money" },
  { value: "card" as const, label: "Card" },
  { value: "bank" as const, label: "Bank transfer" },
];

const inputClass = cn(
  "h-11 w-full rounded-lg border border-[#E4E4E7] bg-white px-3 text-[14px] outline-none transition-colors",
  "placeholder:text-[#8F8F98] focus:border-brand-green-700 disabled:cursor-not-allowed disabled:opacity-50",
);

function StepIndicator({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 text-[12px] font-medium">
      {STEPS.map((label, index) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold",
              index <= step ? "border-brand-green-700 bg-brand-green-700 text-white" : "border-[#E4E4E7] text-[#52525B]",
            )}
          >
            {index + 1}
          </span>
          <span className={index === step ? "text-[#18181B]" : "text-[#52525B]"}>{label}</span>
          {index < STEPS.length - 1 ? <span className="mx-1 h-px w-6 bg-[#E4E4E7]" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  );
}

function CheckoutPage() {
  const initial = Route.useLoaderData();

  const [addresses, setAddresses] = useState(initial.addresses);
  const [step, setStep] = useState<Step>(addresses.length > 0 ? 0 : 0);
  const [addressId, setAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const [deliveryMethodId, setDeliveryMethodId] = useState<string | null>(initial.deliveryMethods[0]?.id ?? null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("mpesa");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState<number | null>(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    country: "Tanzania",
    region: "",
    city: "",
    district: "",
    street: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const selectedDelivery = initial.deliveryMethods.find((m) => m.id === deliveryMethodId) ?? null;
  const deliveryFee = selectedDelivery?.fee ?? 0;
  const total = initial.itemsTotal + deliveryFee;

  const saveAddress = async () => {
    if (savingAddress) return;
    setSavingAddress(true);
    setError(null);
    try {
      const result = await addAddress({
        data: {
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          country: addressForm.country,
          region: addressForm.region,
          city: addressForm.city,
          district: addressForm.district || undefined,
          street: addressForm.street || undefined,
        },
      });
      if (!result) {
        setError("Couldn't save that address. Try again.");
        return;
      }
      const next = { id: result.id, ...addressForm, district: addressForm.district || null, street: addressForm.street || null, additional: null };
      setAddresses((prev) => [...prev, next]);
      setAddressId(result.id);
      setShowAddressForm(false);
    } finally {
      setSavingAddress(false);
    }
  };

  const place = async () => {
    if (submitting || !addressId || !deliveryMethodId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await placeOrder({ data: { addressId, deliveryMethodId, paymentMethod } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPlacedOrderId(result.orderId);
      setPlacedTotal(result.total);
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrderId) {
    return (
      <main className="bg-white font-sans text-[#18181B] antialiased">
        <div className="mx-auto w-full max-w-[560px] px-4 py-16 text-center sm:px-5">
          <h1 className="text-[26px] font-bold tracking-tight">Order placed</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#52525B]">
            Thanks — your order for {placedTotal !== null ? formatTZS(placedTotal) : ""} is confirmed. This is a mock
            payment for development; no real charge was made.
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-green-700 px-6 text-[14px] font-bold text-white transition-colors hover:bg-brand-green-700/90"
          >
            View your orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white font-sans text-[#18181B] antialiased">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-8 sm:px-5">
        <h1 className="text-[26px] font-bold tracking-tight">Checkout</h1>
        <div className="mt-5">
          <StepIndicator step={step} />
        </div>

        <div className="mt-6 rounded-xl border border-[#E4E4E7] p-5 sm:p-6">
          {step === 0 ? (
            <div>
              <h2 className="text-[15px] font-bold">Delivery address</h2>
              {addresses.length > 0 && !showAddressForm ? (
                <div role="radiogroup" aria-label="Delivery address" className="mt-4 space-y-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[13px] transition-colors",
                        addressId === a.id ? "border-brand-green-700 bg-brand-green-700/5" : "border-[#E4E4E7]",
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold">{a.fullName}</span>
                        <span className="block text-[#52525B]">
                          {[a.street, a.district, a.city, a.region, a.country].filter(Boolean).join(", ")}
                        </span>
                        <span className="block text-[#52525B]">{a.phone}</span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-[13px] font-medium text-brand-green-700 hover:underline"
                  >
                    + Add a new address
                  </button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Full name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                    className={cn(inputClass, "sm:col-span-2")}
                  />
                  <input
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="Region"
                    value={addressForm.region}
                    onChange={(e) => setAddressForm((p) => ({ ...p, region: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="District (optional)"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm((p) => ({ ...p, district: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="Street (optional)"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))}
                    className={inputClass}
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <button
                      type="button"
                      disabled={savingAddress || !addressForm.fullName || !addressForm.phone || !addressForm.region || !addressForm.city}
                      onClick={() => void saveAddress()}
                      className={cn(
                        "h-11 flex-1 rounded-lg text-[14px] font-bold text-white transition-colors",
                        savingAddress ? "bg-[#F4F4F5] text-[#8F8F98]" : "bg-brand-green-700 hover:bg-brand-green-700/90",
                      )}
                    >
                      {savingAddress ? "Saving…" : "Save address"}
                    </button>
                    {addresses.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="h-11 rounded-lg border border-[#E4E4E7] px-4 text-[14px] font-medium"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-[15px] font-bold">Delivery method</h2>
              <div role="radiogroup" aria-label="Delivery method" className="mt-4 space-y-2">
                {initial.deliveryMethods.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3 text-[13px] transition-colors",
                      deliveryMethodId === m.id ? "border-brand-green-700 bg-brand-green-700/5" : "border-[#E4E4E7]",
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethodId === m.id}
                        onChange={() => setDeliveryMethodId(m.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold">{m.name}</span>
                        <span className="block text-[#52525B]">{m.description}</span>
                        <span className="block text-[#52525B]">{m.etaLabel}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-bold tabular-nums">{formatTZS(m.fee)}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-[15px] font-bold">Payment method</h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-4 grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={paymentMethod === m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={cn(
                      "h-11 rounded-lg border px-2 text-[13px] font-semibold transition-colors",
                      paymentMethod === m.value
                        ? "border-brand-green-700 bg-brand-green-700/10 text-brand-green-700"
                        : "border-[#E4E4E7] text-[#18181B] hover:border-[#18181B]/20",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-[#52525B]">
                This is a mock charge for development — no real payment is taken.
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="text-[15px] font-bold">Review &amp; confirm</h2>
              <dl className="mt-4 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-[#52525B]">Items</dt>
                  <dd className="font-medium tabular-nums">{formatTZS(initial.itemsTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#52525B]">Delivery ({selectedDelivery?.name})</dt>
                  <dd className="font-medium tabular-nums">{formatTZS(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-[#E4E4E7] pt-2 text-[15px]">
                  <dt className="font-bold">Total</dt>
                  <dd className="font-bold tabular-nums">{formatTZS(total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[12px] text-[#52525B]">
                The total is recalculated on the server at checkout — this preview may differ momentarily from the
                final charge if prices changed.
              </p>
            </div>
          ) : null}

          <div aria-live="polite" role="status" className="mt-4 min-h-[20px]">
            {error ? <p className="text-[13px] font-medium text-[#DC2626]">{error}</p> : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              className={cn(
                "h-11 rounded-lg border border-[#E4E4E7] px-5 text-[14px] font-medium transition-colors",
                step === 0 ? "cursor-not-allowed opacity-40" : "hover:border-[#18181B]/20",
              )}
            >
              Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 0 && !addressId) || (step === 1 && !deliveryMethodId)}
                onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
                className={cn(
                  "h-11 rounded-lg px-6 text-[14px] font-bold text-white transition-colors",
                  (step === 0 && !addressId) || (step === 1 && !deliveryMethodId)
                    ? "cursor-not-allowed bg-[#F4F4F5] text-[#8F8F98]"
                    : "bg-brand-green-700 hover:bg-brand-green-700/90",
                )}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void place()}
                className={cn(
                  "h-11 rounded-lg px-6 text-[14px] font-bold text-white transition-colors",
                  submitting ? "cursor-not-allowed bg-[#F4F4F5] text-[#8F8F98]" : "bg-brand-green-700 hover:bg-brand-green-700/90",
                )}
              >
                {submitting ? "Placing order…" : `Place order · ${formatTZS(total)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
