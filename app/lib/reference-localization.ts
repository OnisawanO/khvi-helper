import type { Locale } from "@/app/components/site-header";

type ReferenceLabels = Record<Locale, string>;

const languageLabels: Record<string, ReferenceLabels> = {
  "American Sign Language": { en: "American Sign Language", th: "ภาษามืออเมริกัน", zh: "美国手语", es: "Lengua de signos americana", ar: "لغة الإشارة الأمريكية" },
  Arabic: { en: "Arabic", th: "อาหรับ", zh: "阿拉伯语", es: "Árabe", ar: "العربية" },
  Bengali: { en: "Bengali", th: "เบงกาลี", zh: "孟加拉语", es: "Bengalí", ar: "البنغالية" },
  Burmese: { en: "Burmese", th: "พม่า", zh: "缅甸语", es: "Birmano", ar: "البورمية" },
  Chinese: { en: "Chinese", th: "จีน", zh: "中文", es: "Chino", ar: "الصينية" },
  Mandarin: { en: "Mandarin", th: "จีนกลาง", zh: "普通话", es: "Mandarín", ar: "الصينية المندرينية" },
  English: { en: "English", th: "อังกฤษ", zh: "英语", es: "Inglés", ar: "الإنجليزية" },
  French: { en: "French", th: "ฝรั่งเศส", zh: "法语", es: "Francés", ar: "الفرنسية" },
  German: { en: "German", th: "เยอรมัน", zh: "德语", es: "Alemán", ar: "الألمانية" },
  Hindi: { en: "Hindi", th: "ฮินดี", zh: "印地语", es: "Hindi", ar: "الهندية" },
  Indonesian: { en: "Indonesian", th: "อินโดนีเซีย", zh: "印度尼西亚语", es: "Indonesio", ar: "الإندونيسية" },
  Italian: { en: "Italian", th: "อิตาลี", zh: "意大利语", es: "Italiano", ar: "الإيطالية" },
  Japanese: { en: "Japanese", th: "ญี่ปุ่น", zh: "日语", es: "Japonés", ar: "اليابانية" },
  Khmer: { en: "Khmer", th: "เขมร", zh: "高棉语", es: "Jemer", ar: "الخميرية" },
  Korean: { en: "Korean", th: "เกาหลี", zh: "韩语", es: "Coreano", ar: "الكورية" },
  Lao: { en: "Lao", th: "ลาว", zh: "老挝语", es: "Lao", ar: "اللاوية" },
  Malay: { en: "Malay", th: "มาเลย์", zh: "马来语", es: "Malayo", ar: "الملايوية" },
  "Persian / Farsi": { en: "Persian / Farsi", th: "เปอร์เซีย / ฟาร์ซี", zh: "波斯语 / 法尔西语", es: "Persa / farsi", ar: "الفارسية" },
  Portuguese: { en: "Portuguese", th: "โปรตุเกส", zh: "葡萄牙语", es: "Portugués", ar: "البرتغالية" },
  Russian: { en: "Russian", th: "รัสเซีย", zh: "俄语", es: "Ruso", ar: "الروسية" },
  Spanish: { en: "Spanish", th: "สเปน", zh: "西班牙语", es: "Español", ar: "الإسبانية" },
  "Tagalog / Filipino": { en: "Tagalog / Filipino", th: "ตากาล็อก / ฟิลิปปินส์", zh: "他加禄语 / 菲律宾语", es: "Tagalo / filipino", ar: "التاغالوغية / الفلبينية" },
  Thai: { en: "Thai", th: "ไทย", zh: "泰语", es: "Tailandés", ar: "التايلاندية" },
  "Thai sign language": { en: "Thai sign language", th: "ภาษามือไทย", zh: "泰国手语", es: "Lengua de signos tailandesa", ar: "لغة الإشارة التايلاندية" },
  Turkish: { en: "Turkish", th: "ตุรกี", zh: "土耳其语", es: "Turco", ar: "التركية" },
  Urdu: { en: "Urdu", th: "อูรดู", zh: "乌尔都语", es: "Urdu", ar: "الأردية" },
  Vietnamese: { en: "Vietnamese", th: "เวียดนาม", zh: "越南语", es: "Vietnamita", ar: "الفيتنامية" },
};

const categoryLabels: Record<string, ReferenceLabels> = {
  "Accident scene": { en: "Accident scene", th: "จุดเกิดเหตุ", zh: "事故现场", es: "Lugar del accidente", ar: "موقع الحادث" },
  "Disaster Relief & Aid": { en: "Disaster Relief & Aid", th: "บรรเทาและช่วยเหลือภัยพิบัติ", zh: "救灾与援助", es: "Ayuda y socorro en desastres", ar: "الإغاثة والمساعدة في الكوارث" },
  "General & Daily Life": { en: "General & Daily Life", th: "ทั่วไปและชีวิตประจำวัน", zh: "日常生活与一般事务", es: "Vida diaria y asuntos generales", ar: "الحياة اليومية والتواصل العام" },
  "Government office": { en: "Government office", th: "หน่วยงานราชการ", zh: "政府机构", es: "Oficina gubernamental", ar: "الجهات الحكومية" },
  "Labour & Workplace Rights": { en: "Labour & Workplace Rights", th: "แรงงานและสิทธิในที่ทำงาน", zh: "劳动与职场权益", es: "Trabajo y derechos laborales", ar: "العمل وحقوق الموظفين" },
  Medical: { en: "Medical", th: "การแพทย์และสุขภาพ", zh: "医疗与健康", es: "Atención médica", ar: "الطب والرعاية الصحية" },
  "Police station": { en: "Police station", th: "สถานีตำรวจและกฎหมาย", zh: "警察局与法律事务", es: "Comisaría y asuntos legales", ar: "مركز الشرطة والمسائل القانونية" },
  School: { en: "School", th: "โรงเรียนและการศึกษา", zh: "学校与教育", es: "Escuela y educación", ar: "المدرسة والتعليم" },
  "Tourism & Transit": { en: "Tourism & Transit", th: "ท่องเที่ยวและการเดินทาง", zh: "旅游与交通", es: "Turismo y transporte", ar: "السياحة والنقل" },
  Tourism: { en: "Tourism", th: "การท่องเที่ยว", zh: "旅游", es: "Turismo", ar: "السياحة" },
  "Legal Documentation": { en: "Legal Documentation", th: "เอกสารทางกฎหมาย", zh: "法律文件", es: "Documentación legal", ar: "المستندات القانونية" },
  "Labour Assistance": { en: "Labour Assistance", th: "ความช่วยเหลือด้านแรงงาน", zh: "劳动协助", es: "Asistencia laboral", ar: "مساعدة العمال" },
};

export function localizeLanguageReference(value: string, locale: Locale): string {
  return languageLabels[value]?.[locale] ?? value;
}

export function localizeCategoryReference(value: string, locale: Locale): string {
  return categoryLabels[value]?.[locale] ?? value;
}

export function localizeUnspecified(value: string | null | undefined, locale: Locale): string {
  if (value && value !== "Not specified" && value !== "Not recorded") return value;
  return { en: "Not specified", th: "ไม่ระบุ", zh: "未指定", es: "No especificado", ar: "غير محدد" }[locale];
}
