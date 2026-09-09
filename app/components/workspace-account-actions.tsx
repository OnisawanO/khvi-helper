"use client";

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useCopyLocale } from "./app-shell";

export function WorkspaceAccountActions({ onSignOut }: { onSignOut: () => void }) {
  const zh = useCopyLocale() === "zh";

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-(--khvi-radius-sm) border border-(--khvi-teal)/30 px-3 text-sm font-bold hover:bg-(--khvi-paper)"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">{zh ? "退出" : "Sign out"}</span>
    </button>
  );
}
