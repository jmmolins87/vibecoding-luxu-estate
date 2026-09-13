"use client";

import Icon from "@/components/ui/Icon";

/**
 * Stepper `- valor +` del diseño `add_edit_property_form`
 * (Bedrooms / Bathrooms / Parking).
 */
export default function CounterStepper({
  id,
  value,
  min = 0,
  max = 99,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  id: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center border-r border-gray-100 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <input
        id={id}
        readOnly
        tabIndex={-1}
        value={value}
        aria-live="polite"
        className="w-10 border-none bg-transparent p-0 text-center text-sm font-medium text-nordic focus:ring-0 dark:text-white"
      />
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center border-l border-gray-100 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}
