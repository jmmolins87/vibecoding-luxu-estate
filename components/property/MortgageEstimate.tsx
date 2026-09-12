"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";

interface MortgageEstimateProps {
  price: number;
  isRent: boolean;
  priceSuffix?: string;
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Client island: calculadora hipotecaria (enganche + tasa ajustables).
 * Fórmula estándar: M = P·r / (1 − (1+r)^−n), 30 años fijos.
 */
export default function MortgageEstimate({
  price,
  isRent,
  priceSuffix,
}: MortgageEstimateProps) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);

  const monthly = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = 360;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [price, downPct, rate]);

  if (isRent) {
    return (
      <section className="flex flex-col items-center justify-between gap-6 rounded-xl border border-mosque/10 bg-mosque/5 p-6 sm:flex-row">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-3 text-mosque shadow-sm">
            <Icon name="calendar" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-nordic dark:text-white">
              Monthly Rent
            </h3>
            <p className="text-sm text-nordic/60 dark:text-gray-300">
              <strong className="text-mosque">
                {usd(price)}
                {priceSuffix ?? "/mo"}
              </strong>{" "}
              · deposit typically 1 month
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-mosque/10 bg-mosque/5 p-6">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-3 text-mosque shadow-sm">
            <Icon name="calendar" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-nordic dark:text-white">
              Estimated Payment
            </h3>
            <p className="text-sm text-nordic/60 dark:text-gray-300">
              Starting from{" "}
              <strong className="text-mosque">{usd(monthly)}/mo</strong> with{" "}
              {downPct}% down
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 rounded-lg bg-white p-4 sm:grid-cols-2 dark:bg-white/5">
        <label className="block text-sm font-medium text-nordic dark:text-gray-200">
          Down payment: {downPct}% ({usd((price * downPct) / 100)})
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="mt-2 w-full accent-[#006655]"
          />
        </label>
        <label className="block text-sm font-medium text-nordic dark:text-gray-200">
          Interest rate: {rate.toFixed(2)}%
          <input
            type="range"
            min={3}
            max={10}
            step={0.125}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[#006655]"
          />
        </label>
      </div>
    </section>
  );
}
