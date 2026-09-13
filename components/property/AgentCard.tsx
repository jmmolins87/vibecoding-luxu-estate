"use client";

import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { formatPrice, type Property } from "@/types/property";
import { useTranslations, useLocale } from "@/lib/i18n/client";

interface AgentCardProps {
  property: Property;
}

/**
 * Server Component: tarjeta de precio + agente (sticky en desktop).
 * Los CTAs enlazan a WhatsApp (`wa.me`) y `tel:` — cero JS, cero widgets.
 */
export default function AgentCard({ property }: AgentCardProps) {
  const { t } = useTranslations();
  const locale = useLocale();
  const { agent } = property;
  const visitText = encodeURIComponent(
    t("property.scheduleMessage", { name: agent.name, title: property.title, address: property.address }),
  );
  const contactText = encodeURIComponent(
    t("property.contactMessage", { name: agent.name, title: property.title, address: property.address }),
  );

  return (
    <div className="rounded-xl border border-mosque/5 bg-white p-6 shadow-sm dark:bg-white/5">
      <div className="mb-4">
        <h1 className="mb-2 text-4xl font-light text-nordic dark:text-white">
          {formatPrice(property, locale)}
          {property.priceSuffix && (
            <span className="text-lg font-normal text-nordic-muted">
              {property.priceSuffix}
            </span>
          )}
        </h1>
        <p className="flex items-center gap-1 font-medium text-nordic/60 dark:text-gray-300">
          <Icon name="place" className="h-4 w-4 text-mosque" />
          {property.address}
        </p>
      </div>

      <div className="my-6 h-px bg-slate-100 dark:bg-white/10" />

      <div className="mb-6 flex items-center gap-4">
        {agent.photo ? (
          <Image
            src={agent.photo}
            alt={agent.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mosque/10 font-bold text-mosque">
            {agent.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-nordic dark:text-white">
            {agent.name}
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium text-mosque">
            <Icon name="star" className="h-3.5 w-3.5" />
            <span>{agent.rating}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={agent.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("property.chatWith", { name: agent.name })}
            className="rounded-full bg-mosque/10 p-2 text-mosque transition-colors hover:bg-mosque hover:text-white"
          >
            <Icon name="chat" className="h-4 w-4" />
          </a>
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              aria-label={t("property.call", { name: agent.name })}
              className="rounded-full bg-mosque/10 p-2 text-mosque transition-colors hover:bg-mosque hover:text-white"
            >
              <Icon name="call" className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <a
          href={`${agent.whatsapp}?text=${visitText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-mosque px-6 py-4 font-medium text-white shadow-lg shadow-mosque/20 transition-all hover:bg-[#005544]"
        >
          <Icon
            name="calendar"
            className="h-5 w-5 transition-transform group-hover:scale-110"
          />
          {t("property.scheduleVisit")}
        </a>
        <a
          href={`${agent.whatsapp}?text=${contactText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-nordic/10 bg-transparent px-6 py-4 font-medium text-nordic/80 transition-all hover:border-mosque hover:text-mosque dark:text-gray-200"
        >
          <Icon name="mail" className="h-5 w-5" />
          {t("property.contactAgent")}
        </a>
      </div>
    </div>
  );
}
