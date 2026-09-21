import type { CopyLocale } from "./locale";

/**
 * Mock data for the requester routes while Supabase is not wired up yet.
 * Timestamps are stored as pre-formatted display strings so the server and the
 * client render the same text. Replace both the records and the labels with real
 * `bookings` rows and a shared formatter once the database exists.
 */

export type RequestStatus = "Open" | "Claimed" | "InProgress" | "Completed" | "Cancelled" | "Expired";
export type Urgency = "Immediate" | "Scheduled";
export type CancelledBy = "User" | "Interpreter" | "Manager" | "System";

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
  { id: "medical", en: "Medical", zh: "医疗", th: "การแพทย์และโรงพยาบาล" },
  { id: "police", en: "Police station", zh: "警察局", th: "สถานีตำรวจและคดีความ" },
  { id: "government", en: "Government office", zh: "政府机构", th: "หน่วยงานราชการ" },
  { id: "accident", en: "Accident scene", zh: "事故现场", th: "อุบัติเหตุและเหตุฉุกเฉิน" },
  { id: "school", en: "School", zh: "学校", th: "โรงเรียนและการศึกษา" },
  { id: "general", en: "General & Daily Life", zh: "日常生活与一般沟通", th: "การสื่อสารทั่วไปและชีวิตประจำวัน" },
  { id: "tourism", en: "Tourism & Transit", zh: "旅游与交通", th: "การท่องเที่ยวและการเดินทาง" },
  { id: "labour", en: "Labour & Workplace Rights", zh: "就业与劳动权益", th: "การจ้างงานและสิทธิแรงงาน" },
  { id: "disaster", en: "Disaster Relief & Aid", zh: "灾害救援与援助", th: "ภัยพิบัติและการช่วยเหลือผู้ประสบภัย" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"] | string;
export type CategoryId = (typeof CATEGORIES)[number]["id"] | string;

export type InterpreterContact = {
  name: string;
  primaryLanguage: string;
  phone: string;
  extraContact: string;
  averageRating: number;
  completedJobCount: number;
};

export type RequesterContact = {
  userId: string;
  name: string;
  phone: string;
};

export type HelpRequest = {
  requestId: string;
  languageId: LanguageId;
  categoryId: CategoryId;
  description: string;
  urgency: Urgency;
  status: RequestStatus;
  /** Broad area shown before requester confirmation (BR-04). */
  areaName: string;
  /** Exact meeting point, unlocked for the interpreter after requester confirmation (BR-04). */
  exactAddress: string;
  latitude: number | null;
  longitude: number | null;
  expiresAt?: string;
  /** ISO timestamp used for stable sorting; `createdAtLabel` remains display-only. */
  createdAt: string;
  createdAtLabel: string;
  scheduledAtLabel: string | null;
  /** Countdown seconds for open urgent pins (BR-07). Null once a pin leaves `Open`. */
  expiresInSeconds: number | null;
  claimedAtLabel: string | null;
  startedAtLabel: string | null;
  userConfirmedDoneAtLabel: string | null;
  interpreterConfirmedDoneAtLabel: string | null;
  /** Preview ownership fields used to connect requester and interpreter workspaces. */
  requester?: RequesterContact | null;
  interpreterId?: string | null;
  requesterConfirmedAtLabel?: string | null;
  endedAtLabel?: string | null;
  cancelledBy: CancelledBy | null;
  cancelReason: string | null;
  interpreter: InterpreterContact | null;
};

export const MOCK_REQUESTS: readonly HelpRequest[] = [
  {
    requestId: "1042",
    languageId: "burmese",
    categoryId: "medical",
    description: "Emergency room admission. The patient cannot describe the pain or list current medication.",
    urgency: "Immediate",
    status: "Open",
    areaName: "Tha Sala district",
    exactAddress: "Walailak University Hospital, emergency building, counter 2",
    latitude: 8.6425,
    longitude: 99.8981,
    createdAtLabel: "7 Sep 2026, 09:12",
    createdAt: "2026-09-07T09:12:00+07:00",
    scheduledAtLabel: null,
    expiresInSeconds: 22 * 60,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: null,
  },
  {
    requestId: "1043",
    languageId: "english",
    categoryId: "government",
    description: "Residence registration appointment. The requester needs help understanding the required documents before submission.",
    urgency: "Scheduled",
    status: "Open",
    areaName: "Mueang Nakhon Si Thammarat",
    exactAddress: "Provincial immigration office, information counter",
    latitude: 8.4458,
    longitude: 99.9654,
    createdAtLabel: "7 Sep 2026, 09:05",
    createdAt: "2026-09-07T09:05:00+07:00",
    scheduledAtLabel: "7 Sep 2026, 15:00",
    expiresInSeconds: null,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: null,
  },
  {
    requestId: "1044",
    languageId: "vietnamese",
    categoryId: "accident",
    description: "Traffic incident report. The driver needs help explaining the accident details to the officers.",
    urgency: "Immediate",
    status: "Open",
    areaName: "Tha Sala district",
    exactAddress: "Tha Sala road checkpoint, response lane",
    latitude: 8.6096,
    longitude: 99.9123,
    createdAtLabel: "7 Sep 2026, 08:58",
    createdAt: "2026-09-07T08:58:00+07:00",
    scheduledAtLabel: null,
    expiresInSeconds: 18 * 60,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: null,
  },
  {
    requestId: "1045",
    languageId: "sign",
    categoryId: "school",
    description: "School enrollment meeting. A family needs support reviewing the enrollment forms with staff.",
    urgency: "Scheduled",
    status: "Open",
    areaName: "Tha Sala school area",
    exactAddress: "Tha Sala school, student services office",
    latitude: 8.6771,
    longitude: 99.9018,
    createdAtLabel: "7 Sep 2026, 08:36",
    createdAt: "2026-09-07T08:36:00+07:00",
    scheduledAtLabel: "7 Sep 2026, 16:15",
    expiresInSeconds: null,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: null,
  },
  {
    requestId: "1041",
    languageId: "chinese",
    categoryId: "police",
    description: "Filing a lost passport report. Officers need the travel dates and hotel address confirmed.",
    urgency: "Scheduled",
    status: "Claimed",
    areaName: "Mueang Nakhon Si Thammarat",
    exactAddress: "Mueang police station, service desk 4",
    latitude: 8.4304,
    longitude: 99.9631,
    createdAtLabel: "7 Sep 2026, 08:40",
    createdAt: "2026-09-07T08:40:00+07:00",
    scheduledAtLabel: "7 Sep 2026, 14:30",
    expiresInSeconds: null,
    claimedAtLabel: "7 Sep 2026, 08:55",
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: {
      name: "Napat S.",
      primaryLanguage: "Chinese",
      phone: "081 234 5678",
      extraContact: "LINE: napat.interpret",
      averageRating: 4.8,
      completedJobCount: 27,
    },
  },
  {
    requestId: "1038",
    languageId: "vietnamese",
    categoryId: "government",
    description: "Work permit renewal. Two forms need to be read out and checked before signing.",
    urgency: "Scheduled",
    status: "InProgress",
    areaName: "Mueang Nakhon Si Thammarat",
    exactAddress: "Provincial employment office, room 105",
    latitude: 8.4361,
    longitude: 99.9598,
    createdAtLabel: "6 Sep 2026, 15:02",
    createdAt: "2026-09-06T15:02:00+07:00",
    scheduledAtLabel: "7 Sep 2026, 10:00",
    expiresInSeconds: null,
    claimedAtLabel: "6 Sep 2026, 15:31",
    startedAtLabel: "7 Sep 2026, 10:04",
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null,
    cancelReason: null,
    interpreter: {
      name: "Linh T.",
      primaryLanguage: "Vietnamese",
      phone: "089 776 1204",
      extraContact: "Telegram: @linh_help",
      averageRating: 4.9,
      completedJobCount: 41,
    },
  },
  {
    requestId: "1030",
    languageId: "sign",
    categoryId: "school",
    description: "Parent teacher meeting about a reading assessment result.",
    urgency: "Scheduled",
    status: "Completed",
    areaName: "Tha Sala district",
    exactAddress: "Tha Sala school, meeting room 1",
    latitude: 8.6712,
    longitude: 99.9042,
    createdAtLabel: "4 Sep 2026, 11:20",
    createdAt: "2026-09-04T11:20:00+07:00",
    scheduledAtLabel: "5 Sep 2026, 09:00",
    expiresInSeconds: null,
    claimedAtLabel: "4 Sep 2026, 12:02",
    startedAtLabel: "5 Sep 2026, 09:03",
    userConfirmedDoneAtLabel: "5 Sep 2026, 10:12",
    interpreterConfirmedDoneAtLabel: "5 Sep 2026, 10:15",
    cancelledBy: null,
    cancelReason: null,
    interpreter: {
      name: "Kanya P.",
      primaryLanguage: "Thai sign language",
      phone: "086 552 3310",
      extraContact: "LINE: kanya.sign",
      averageRating: 5,
      completedJobCount: 63,
    },
  },
  {
    requestId: "1024",
    languageId: "english",
    categoryId: "accident",
    description: "Motorbike accident on the main road. Insurance details had to be explained on site.",
    urgency: "Immediate",
    status: "Cancelled",
    areaName: "Tha Sala district",
    exactAddress: "Highway 401, kilometre marker 12",
    latitude: 8.6588,
    longitude: 99.9207,
    createdAtLabel: "2 Sep 2026, 18:44",
    createdAt: "2026-09-02T18:44:00+07:00",
    scheduledAtLabel: null,
    expiresInSeconds: null,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: "User",
    cancelReason: "A bystander could translate, so the request was no longer needed.",
    interpreter: null,
  },
  {
    requestId: "1019",
    languageId: "burmese",
    categoryId: "medical",
    description: "Pharmacy visit to confirm the dosage of two prescriptions.",
    urgency: "Immediate",
    status: "Expired",
    areaName: "Mueang Nakhon Si Thammarat",
    exactAddress: "Pharmacy on Ratchadamnoen road",
    latitude: 8.4118,
    longitude: 99.9689,
    createdAtLabel: "31 Aug 2026, 20:15",
    createdAt: "2026-08-31T20:15:00+07:00",
    scheduledAtLabel: null,
    expiresInSeconds: null,
    claimedAtLabel: null,
    startedAtLabel: null,
    userConfirmedDoneAtLabel: null,
    interpreterConfirmedDoneAtLabel: null,
    cancelledBy: "System",
    cancelReason: "No interpreter claimed the pin within 30 minutes.",
    interpreter: null,
  },
];

/** Request ids mirror the planned `bookings.booking_id` sequence, so only digits are valid. */
const REQUEST_ID_PATTERN = /^[1-9]\d{0,9}$/;

export function isValidRequestId(value: string): boolean {
  return REQUEST_ID_PATTERN.test(value);
}

export function findRequest(requestId: string): HelpRequest | null {
  if (!isValidRequestId(requestId)) {
    return null;
  }

  return MOCK_REQUESTS.find((request) => request.requestId === requestId) ?? null;
}

/** Assignment/profile visibility begins at claim; sensitive details require requester confirmation. */
export function isContactUnlocked(status: RequestStatus): boolean {
  return status === "Claimed" || status === "InProgress" || status === "Completed";
}

export const STATUS_FILTERS = [
  { id: "all", statuses: null },
  { id: "open", statuses: ["Open"] },
  { id: "claimed", statuses: ["Claimed"] },
  { id: "in-progress", statuses: ["InProgress"] },
  { id: "completed", statuses: ["Completed"] },
  { id: "closed", statuses: ["Cancelled", "Expired"] },
] as const satisfies readonly { id: string; statuses: readonly RequestStatus[] | null }[];

export type StatusFilterId = (typeof STATUS_FILTERS)[number]["id"];

export function resolveStatusFilter(value: string | string[] | undefined): StatusFilterId {
  const candidate = Array.isArray(value) ? value[0] : value;

  return STATUS_FILTERS.find((filter) => filter.id === candidate)?.id ?? "all";
}

export function filterRequests(filterId: StatusFilterId): HelpRequest[] {
  const filter = STATUS_FILTERS.find((entry) => entry.id === filterId);

  if (!filter?.statuses) {
    return [...MOCK_REQUESTS];
  }

  const allowed: readonly RequestStatus[] = filter.statuses;

  return MOCK_REQUESTS.filter((request) => allowed.includes(request.status));
}

export function countRequests(filterId: StatusFilterId): number {
  return filterRequests(filterId).length;
}

export function languageLabel(languageId: LanguageId, copyLocale: CopyLocale | "th"): string {
  const item = LANGUAGES.find((language) => language.id === languageId);
  if (!item) return languageId;
  if (copyLocale === "th" && "th" in item) return item.th;
  return item[copyLocale === "zh" ? "zh" : "en"] ?? languageId;
}

export function categoryLabel(categoryId: CategoryId, copyLocale: CopyLocale | "th"): string {
  const item = CATEGORIES.find((category) => category.id === categoryId);
  if (!item) return categoryId;
  if (copyLocale === "th" && "th" in item) return item.th;
  return item[copyLocale === "zh" ? "zh" : "en"] ?? categoryId;
}

/** Rough coordinates for the pre-claim map view, matching BR-04. */
export function approximateCoordinates(request: HelpRequest): string {
  if (request.latitude === null || request.longitude === null) return "Coordinates not provided";
  return `${request.latitude.toFixed(2)}, ${request.longitude.toFixed(2)}`;
}

export function exactCoordinates(request: HelpRequest): string {
  if (request.latitude === null || request.longitude === null) return "Coordinates not provided";
  return `${request.latitude.toFixed(5)}, ${request.longitude.toFixed(5)}`;
}
