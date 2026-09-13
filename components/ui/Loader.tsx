"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export default function Loader({ size = "md", label, className, fullScreen }: LoaderProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={`animate-spin rounded-full border-mosque/20 border-t-mosque ${sizes[size]} ${className ?? ""}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-clearday/70 backdrop-blur-sm dark:bg-[#0f231f]/70">
        {spinner}
        {label && <p className="text-sm font-medium text-nordic-muted dark:text-gray-300">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {label && <p className="text-sm text-nordic-muted">{label}</p>}
    </div>
  );
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white ${className ?? ""}`}
      aria-hidden
    />
  );
}
