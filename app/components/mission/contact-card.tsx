import { MapPinIcon, PhoneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import type { Booking } from "@/types/database.types";

export type ContactCardCopy = {
  title: string;
  privacyNote: string;
  descriptionLabel: string;
  locationLabel: string;
  contactLabel: string;
  extraContactLabel: string;
};

export function ContactCard({
  copy,
  booking,
  viewerRole,
}: {
  copy: ContactCardCopy;
  booking: Booking;
  viewerRole: "user" | "interpreter";
}) {
  const isUnlocked = booking.status !== "Open";
  const otherPartyName = viewerRole === "user" ? booking.interpreterName : booking.requesterName;
  const otherPartyPhone = viewerRole === "user" ? booking.interpreterPhone : booking.requesterPhone;

  return (
    <section className="rounded-[var(--khvi-radius-lg)] border border-[#e1e8ea] bg-[var(--khvi-surface)] p-6 shadow-[var(--khvi-shadow-soft)] sm:p-8">
      <h2 className="text-lg font-extrabold text-[var(--khvi-ink)]">{copy.title}</h2>

      <p className="mt-4 text-sm leading-7 text-[#52676f]">
        <span className="font-semibold text-[var(--khvi-ink)]">{copy.descriptionLabel}: </span>
        {booking.description}
      </p>

      <p className="mt-3 flex items-start gap-2 text-sm text-[#52676f]">
        <MapPinIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--khvi-teal)]" />
        <span>
          <span className="font-semibold text-[var(--khvi-ink)]">{copy.locationLabel}: </span>
          {booking.locationName}
        </span>
      </p>

      <div className="mt-5 border-t border-[#e1e8ea] pt-5">
        {isUnlocked ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--khvi-ink)]">{otherPartyName}</p>
            <p className="flex items-center gap-2 text-sm text-[#52676f]">
              <PhoneIcon aria-hidden="true" className="h-5 w-5 text-[var(--khvi-sage)]" />
              <span>
                <span className="font-semibold text-[var(--khvi-ink)]">{copy.contactLabel}: </span>
                {otherPartyPhone}
              </span>
            </p>
            {viewerRole === "user" && booking.interpreterExtraContact ? (
              <p className="flex items-center gap-2 text-sm text-[#52676f]">
                <ChatBubbleLeftRightIcon aria-hidden="true" className="h-5 w-5 text-[var(--khvi-sage)]" />
                <span>
                  <span className="font-semibold text-[var(--khvi-ink)]">{copy.extraContactLabel}: </span>
                  {booking.interpreterExtraContact}
                </span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[#66777d]">{copy.privacyNote}</p>
        )}
      </div>
    </section>
  );
}
