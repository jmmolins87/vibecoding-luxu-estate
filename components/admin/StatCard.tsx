import Icon, { type IconName } from "@/components/ui/Icon";

export default function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-nordic/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-nordic/60 dark:text-gray-400">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent
              ? "bg-mosque text-white"
              : "bg-mosque/10 text-mosque dark:text-hint"
          }`}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-nordic dark:text-white">
        {value}
      </p>
    </div>
  );
}
