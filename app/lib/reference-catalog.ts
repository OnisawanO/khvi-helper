export type ReferenceOption = {
  id: string;
  name: string;
  nameTh: string;
  nameZh: string;
  icon?: string;
};

export type ReferenceCatalog = {
  languages: ReferenceOption[];
  categories: ReferenceOption[];
};

export const EMPTY_REFERENCE_CATALOG: ReferenceCatalog = {
  languages: [],
  categories: [],
};

export function referenceLabel(
  options: ReferenceOption[],
  id: string,
  locale: string,
): string {
  const option = options.find((item) => item.id === id);
  if (!option) return id;
  if (locale === "th") return option.nameTh;
  if (locale === "zh") return option.nameZh;
  return option.name;
}
