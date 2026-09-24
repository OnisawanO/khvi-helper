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

const spanishLanguageLabels: Record<string, string> = {
  burmese: "Birmano", chinese: "Chino", english: "Inglés", vietnamese: "Vietnamita", sign: "Lengua de signos tailandesa",
  thai: "Tailandés", spanish: "Español", arabic: "Árabe", japanese: "Japonés", korean: "Coreano", french: "Francés",
  german: "Alemán", russian: "Ruso", hindi: "Hindi", indonesian: "Indonesio", malay: "Malayo", tagalog: "Tagalo / Filipino",
  khmer: "Jemer", lao: "Laosiano", portuguese: "Portugués", italian: "Italiano", turkish: "Turco", persian: "Persa / Farsi",
  urdu: "Urdu", bengali: "Bengalí", asl: "Lengua de signos americana",
};

const arabicLanguageLabels: Record<string, string> = {
  burmese: "البورمية", chinese: "الصينية", english: "الإنجليزية", vietnamese: "الفيتنامية", sign: "لغة الإشارة التايلاندية",
  thai: "التايلاندية", spanish: "الإسبانية", arabic: "العربية", japanese: "اليابانية", korean: "الكورية", french: "الفرنسية",
  german: "الألمانية", russian: "الروسية", hindi: "الهندية", indonesian: "الإندونيسية", malay: "الملايوية", tagalog: "التاغالوغية / الفلبينية",
  khmer: "الخميرية", lao: "اللاوية", portuguese: "البرتغالية", italian: "الإيطالية", turkish: "التركية", persian: "الفارسية",
  urdu: "الأردية", bengali: "البنغالية", asl: "لغة الإشارة الأمريكية",
};

const spanishCategoryLabels: Record<string, string> = {
  general: "Vida diaria y comunicación general", accident: "Escena de accidente", medical: "Atención médica",
  disaster: "Ayuda y respuesta ante desastres", police: "Comisaría y asuntos legales", government: "Oficina gubernamental",
  tourism: "Turismo y transporte", labour: "Trabajo y derechos laborales", school: "Escuela y educación",
};

const arabicCategoryLabels: Record<string, string> = {
  general: "الحياة اليومية والتواصل العام", accident: "موقع الحادث", medical: "الطب والرعاية الصحية",
  disaster: "الإغاثة والمساعدة في الكوارث", police: "مركز الشرطة والمسائل القانونية", government: "الجهات الحكومية",
  tourism: "السياحة والنقل", labour: "العمل وحقوق الموظفين", school: "المدرسة والتعليم",
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
  if (locale === "es") return spanishLanguageLabels[id] ?? spanishCategoryLabels[id] ?? option.name;
  if (locale === "ar") return arabicLanguageLabels[id] ?? arabicCategoryLabels[id] ?? option.name;
  return option.name;
}
