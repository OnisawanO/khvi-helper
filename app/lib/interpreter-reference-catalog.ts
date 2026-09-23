export type InterpreterApplicationReference = {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  icon?: string;
};

export function sortCategoriesByPriority<T extends { id?: string; category_code?: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    const codeA = a.id ?? a.category_code ?? "";
    const codeB = b.id ?? b.category_code ?? "";
    return codeA.localeCompare(codeB);
  });
}
