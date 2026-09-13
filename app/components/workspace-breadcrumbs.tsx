import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export function WorkspaceBreadcrumbs({
  ariaLabel,
  currentLabel,
  homeHref,
  homeLabel,
}: {
  ariaLabel: string;
  currentLabel: string;
  homeHref: string;
  homeLabel: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="overflow-x-auto rounded-lg border border-(--khvi-teal)/20 bg-white px-4 py-3"
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        <li>
          <Link
            className="font-bold text-[#087f80] underline-offset-4 transition-colors hover:text-[#0a6465] hover:underline"
            href={homeHref}
          >
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-(--khvi-ink)/40" />
        </li>
        <li>
          <span aria-current="page" className="font-semibold text-(--khvi-ink)/70">
            {currentLabel}
          </span>
        </li>
      </ol>
    </nav>
  );
}
