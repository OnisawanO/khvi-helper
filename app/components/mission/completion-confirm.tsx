import { CheckCircleIcon } from "@heroicons/react/24/outline";

export type CompletionConfirmCopy = {
  title: string;
  body: string;
  userLabel: string;
  interpreterLabel: string;
  confirmedLabel: string;
  waitingLabel: string;
  confirmAction: string;
};

export function CompletionConfirm({
  copy,
  viewerRole,
  userConfirmedDoneAt,
  interpreterConfirmedDoneAt,
  onConfirm,
}: {
  copy: CompletionConfirmCopy;
  viewerRole: "user" | "interpreter";
  userConfirmedDoneAt: string | null;
  interpreterConfirmedDoneAt: string | null;
  onConfirm: () => void;
}) {
  const viewerHasConfirmed = viewerRole === "user" ? Boolean(userConfirmedDoneAt) : Boolean(interpreterConfirmedDoneAt);

  return (
    <section className="rounded-[var(--khvi-radius-lg)] border border-[#7fbfa4] bg-[#e6f4ef] p-6 shadow-[var(--khvi-shadow-soft)] sm:p-8">
      <h2 className="text-lg font-extrabold text-[#087557]">{copy.title}</h2>
      <p className="mt-2 text-sm text-[#0f5c46]">{copy.body}</p>

      <ul className="mt-4 space-y-2">
        <li className="flex items-center gap-2 text-sm text-[#0f5c46]">
          <CheckCircleIcon aria-hidden="true" className={`h-5 w-5 ${userConfirmedDoneAt ? "text-[#087557]" : "text-[#9fc9b8]"}`} />
          {copy.userLabel}: {userConfirmedDoneAt ? copy.confirmedLabel : copy.waitingLabel}
        </li>
        <li className="flex items-center gap-2 text-sm text-[#0f5c46]">
          <CheckCircleIcon aria-hidden="true" className={`h-5 w-5 ${interpreterConfirmedDoneAt ? "text-[#087557]" : "text-[#9fc9b8]"}`} />
          {copy.interpreterLabel}: {interpreterConfirmedDoneAt ? copy.confirmedLabel : copy.waitingLabel}
        </li>
      </ul>

      {viewerHasConfirmed ? null : (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 rounded-lg bg-[#087557] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#066647] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-sun)]"
        >
          {copy.confirmAction}
        </button>
      )}
    </section>
  );
}
