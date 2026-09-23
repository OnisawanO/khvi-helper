import type { CopyLocale } from "./locale";
import type { Locale } from "@/app/components/site-header";
import type { CategoryId, LanguageId } from "./request-types";

/**
 * Stable reference labels used by legacy request widgets.
 * Request records themselves are always loaded from Supabase.
 */
export const LANGUAGES = [
  { id: "burmese", en: "Burmese", zh: "缅甸语", th: "ภาษาพม่า" },
  { id: "chinese", en: "Chinese", zh: "中文", th: "ภาษาจีน" },
  { id: "english", en: "English", zh: "英语", th: "ภาษาอังกฤษ" },
  { id: "vietnamese", en: "Vietnamese", zh: "越南语", th: "ภาษาเวียดนาม" },
  { id: "sign", en: "Thai sign language", zh: "泰国手语", th: "ภาษามือไทย" },
  { id: "thai", en: "Thai", zh: "泰语", th: "ภาษาไทย" },
  { id: "spanish", en: "Spanish", zh: "西班牙语", th: "ภาษาสเปน" },
  { id: "arabic", en: "Arabic", zh: "阿拉伯语", th: "ภาษาอาหรับ" },
  { id: "japanese", en: "Japanese", zh: "日语", th: "ภาษาญี่ปุ่น" },
  { id: "korean", en: "Korean", zh: "韩语", th: "ภาษาเกาหลี" },
  { id: "french", en: "French", zh: "法语", th: "ภาษาฝรั่งเศส" },
  { id: "german", en: "German", zh: "德语", th: "ภาษาเยอรมัน" },
  { id: "russian", en: "Russian", zh: "俄语", th: "ภาษารัสเซีย" },
  { id: "hindi", en: "Hindi", zh: "印地语", th: "ภาษาฮินดี" },
  { id: "indonesian", en: "Indonesian", zh: "印度尼西亚语", th: "ภาษาอินโดนีเซีย" },
  { id: "malay", en: "Malay", zh: "马来语", th: "ภาษามาเลย์" },
  { id: "tagalog", en: "Tagalog / Filipino", zh: "他加禄语 / 菲律宾语", th: "ภาษาตากาล็อก / ฟิลิปปินส์" },
  { id: "khmer", en: "Khmer", zh: "高棉语", th: "ภาษาเขมร" },
  { id: "lao", en: "Lao", zh: "老挝语", th: "ภาษาลาว" },
  { id: "portuguese", en: "Portuguese", zh: "葡萄牙语", th: "ภาษาโปรตุเกส" },
  { id: "italian", en: "Italian", zh: "意大利语", th: "ภาษาอิตาลี" },
  { id: "turkish", en: "Turkish", zh: "土耳其语", th: "ภาษาตุรกี" },
  { id: "persian", en: "Persian / Farsi", zh: "波斯语", th: "ภาษาเปอร์เซีย / ฟาร์ซี" },
  { id: "urdu", en: "Urdu", zh: "乌尔都语", th: "ภาษาอูรดู" },
  { id: "bengali", en: "Bengali", zh: "孟加拉语", th: "ภาษาเบงกอล" },
  { id: "asl", en: "American Sign Language", zh: "美国手语", th: "ภาษามืออเมริกัน" },
] as const;

export const CATEGORIES = [
  { id: "general", en: "General & Daily Life", zh: "日常生活与一般沟通", th: "การสื่อสารทั่วไปและชีวิตประจำวัน" },
  { id: "accident", en: "Accident scene", zh: "事故现场", th: "อุบัติเหตุและเหตุฉุกเฉิน" },
  { id: "medical", en: "Medical", zh: "医疗", th: "การแพทย์และโรงพยาบาล" },
  { id: "disaster", en: "Disaster Relief & Aid", zh: "灾害救援与援助", th: "ภัยพิบัติและการช่วยเหลือผู้ประสบภัย" },
  { id: "police", en: "Police station", zh: "警察局", th: "สถานีตำรวจและคดีความ" },
  { id: "government", en: "Government office", zh: "政府机构", th: "หน่วยงานราชการ" },
  { id: "tourism", en: "Tourism & Transit", zh: "旅游与交通", th: "การท่องเที่ยวและการเดินทาง" },
  { id: "labour", en: "Labour & Workplace Rights", zh: "就业与劳动权益", th: "การจ้างงานและสิทธิแรงงาน" },
  { id: "school", en: "School", zh: "学校", th: "โรงเรียนและการศึกษา" },
] as const;

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

export function languageLabel(languageId: LanguageId, copyLocale: CopyLocale): string {
  const item = LANGUAGES.find((language) => language.id === languageId);
  if (!item) return languageId;
  const extraLabels: Partial<Record<Locale, Record<string, string>>> = { es: spanishLanguageLabels, ar: arabicLanguageLabels };
  return extraLabels[copyLocale]?.[languageId] ?? item[copyLocale === "zh" ? "zh" : copyLocale === "th" ? "th" : "en"] ?? languageId;
}

export function categoryLabel(categoryId: CategoryId, copyLocale: CopyLocale): string {
  const item = CATEGORIES.find((category) => category.id === categoryId);
  if (!item) return categoryId;
  const extraLabels: Partial<Record<Locale, Record<string, string>>> = { es: spanishCategoryLabels, ar: arabicCategoryLabels };
  return extraLabels[copyLocale]?.[categoryId] ?? item[copyLocale === "zh" ? "zh" : copyLocale === "th" ? "th" : "en"] ?? categoryId;
}
