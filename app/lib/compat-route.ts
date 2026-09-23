export type CompatibilitySearchParams = Record<string, string | string[] | undefined>;

export function withCompatibilitySearchParams(
  pathname: string,
  searchParams: CompatibilitySearchParams,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }

  const serialized = query.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}
