export type InterpreterApplicationReference = {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  icon?: string;
};

export const DEFAULT_INTERPRETER_LANGUAGES: InterpreterApplicationReference[] = [
  { id: "thai", name: "Thai", nameTh: "ภาษาไทย", nameZh: "泰语" },
  { id: "english", name: "English", nameTh: "ภาษาอังกฤษ", nameZh: "英语" },
  { id: "chinese", name: "Chinese", nameTh: "ภาษาจีน", nameZh: "中文" },
  { id: "spanish", name: "Spanish", nameTh: "ภาษาสเปน", nameZh: "西班牙语" },
  { id: "arabic", name: "Arabic", nameTh: "ภาษาอาหรับ", nameZh: "阿拉伯语" },
  { id: "japanese", name: "Japanese", nameTh: "ภาษาญี่ปุ่น", nameZh: "日语" },
  { id: "korean", name: "Korean", nameTh: "ภาษาเกาหลี", nameZh: "韩语" },
  { id: "french", name: "French", nameTh: "ภาษาฝรั่งเศส", nameZh: "法语" },
  { id: "german", name: "German", nameTh: "ภาษาเยอรมัน", nameZh: "德语" },
  { id: "russian", name: "Russian", nameTh: "ภาษารัสเซีย", nameZh: "俄语" },
  { id: "hindi", name: "Hindi", nameTh: "ภาษาฮินดี", nameZh: "印地语" },
  { id: "indonesian", name: "Indonesian", nameTh: "ภาษาอินโดนีเซีย", nameZh: "印度尼西亚语" },
  { id: "malay", name: "Malay", nameTh: "ภาษามาเลย์", nameZh: "马来语" },
  { id: "tagalog", name: "Tagalog / Filipino", nameTh: "ภาษาตากาล็อก / ฟิลิปปินส์", nameZh: "他加禄语 / 菲律宾语" },
  { id: "khmer", name: "Khmer", nameTh: "ภาษาเขมร", nameZh: "高棉语" },
  { id: "lao", name: "Lao", nameTh: "ภาษาลาว", nameZh: "老挝语" },
  { id: "portuguese", name: "Portuguese", nameTh: "ภาษาโปรตุเกส", nameZh: "葡萄牙语" },
  { id: "italian", name: "Italian", nameTh: "ภาษาอิตาลี", nameZh: "意大利语" },
  { id: "turkish", name: "Turkish", nameTh: "ภาษาตุรกี", nameZh: "土耳其语" },
  { id: "persian", name: "Persian / Farsi", nameTh: "ภาษาเปอร์เซีย / ฟาร์ซี", nameZh: "波斯语" },
  { id: "urdu", name: "Urdu", nameTh: "ภาษาอูรดู", nameZh: "乌尔都语" },
  { id: "bengali", name: "Bengali", nameTh: "ภาษาเบงกอล", nameZh: "孟加拉语" },
  { id: "asl", name: "American Sign Language", nameTh: "ภาษามืออเมริกัน", nameZh: "美国手语" },
];

export const CATEGORY_PRIORITY_ORDER: string[] = [
  "general",
  "accident",
  "medical",
  "disaster",
  "police",
  "government",
  "tourism",
  "labour",
  "school",
];

export function sortCategoriesByPriority<T extends { id?: string; category_code?: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    const codeA = a.id ?? a.category_code ?? "";
    const codeB = b.id ?? b.category_code ?? "";
    const idxA = CATEGORY_PRIORITY_ORDER.indexOf(codeA);
    const idxB = CATEGORY_PRIORITY_ORDER.indexOf(codeB);
    const scoreA = idxA === -1 ? 999 : idxA;
    const scoreB = idxB === -1 ? 999 : idxB;
    return scoreA - scoreB;
  });
}

export const DEFAULT_INTERPRETER_CATEGORIES: InterpreterApplicationReference[] = [
  { id: "general", name: "General & Daily Life", nameTh: "การสื่อสารทั่วไปและชีวิตประจำวัน", nameZh: "日常生活与一般沟通", icon: "💬" },
  { id: "accident", name: "Accident scene", nameTh: "อุบัติเหตุและเหตุฉุกเฉิน", nameZh: "事故与紧急情况", icon: "🚨" },
  { id: "medical", name: "Medical", nameTh: "การแพทย์และโรงพยาบาล", nameZh: "医疗与医院", icon: "🏥" },
  { id: "disaster", name: "Disaster Relief & Aid", nameTh: "ภัยพิบัติและการช่วยเหลือผู้ประสบภัย", nameZh: "灾害救援与援助", icon: "🌊" },
  { id: "police", name: "Police station", nameTh: "สถานีตำรวจและคดีความ", nameZh: "警察局与法律事务", icon: "👮" },
  { id: "government", name: "Government office", nameTh: "หน่วยงานราชการ", nameZh: "政府机构", icon: "🏛️" },
  { id: "tourism", name: "Tourism & Transit", nameTh: "การท่องเที่ยวและการเดินทาง", nameZh: "旅游与交通", icon: "✈️" },
  { id: "labour", name: "Labour & Workplace Rights", nameTh: "การจ้างงานและสิทธิแรงงาน", nameZh: "就业与劳动权益", icon: "💼" },
  { id: "school", name: "School", nameTh: "โรงเรียนและการศึกษา", nameZh: "学校与教育", icon: "🏫" },
];


