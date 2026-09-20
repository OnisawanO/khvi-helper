import { Fragment } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function WorkspaceBreadcrumbs({
  ariaLabel = "Breadcrumb",
  currentLabel,
  homeHref,
  homeLabel,
  items,
  className = "",
}: {
  ariaLabel?: string;
  currentLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  items?: BreadcrumbItem[];
  className?: string;
}) {
  const breadcrumbItems: BreadcrumbItem[] =
    items ??
    [
      ...(homeHref && homeLabel ? [{ label: homeLabel, href: homeHref }] : []),
      ...(currentLabel ? [{ label: currentLabel }] : []),
    ];

  return (
    <nav
      aria-label={ariaLabel}
      className={`overflow-x-auto rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-white px-4 py-3 shadow-xs ${className}`.trim()}
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true">
                  <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-(--khvi-ink)/40" />
                </li>
              )}
              <li>
                {isLast || !item.href ? (
                  <span aria-current={isLast ? "page" : undefined} className="font-semibold text-(--khvi-ink)/70">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    className="font-bold text-[#087f80] underline-offset-4 transition-colors hover:text-[#0a6465] hover:underline"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
