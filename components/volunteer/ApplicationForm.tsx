"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUiLocale } from "@/app/components/app-shell";
import {
  submitInterpreterApplicationAction,
  uploadInterpreterCertificateAction,
} from "@/app/actions/interpreter-application-actions";
import {
  type InterpreterApplicationReference,
  DEFAULT_INTERPRETER_CATEGORIES,
  DEFAULT_INTERPRETER_LANGUAGES,
  sortCategoriesByPriority,
} from "@/app/lib/interpreter-reference-catalog";
import { getMockUserSession, splitDisplayName } from "@/app/lib/mock-auth";
import { createClient } from "@/utils/supabase/client";

export type InitialProfile = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export type ContactChannelType = "line" | "facebook" | "whatsapp" | "wechat" | "telegram" | "other";

export type ContactChannelItem = {
  id: string;
  type: ContactChannelType;
  value: string;
  customType?: string;
};

export const CHANNEL_DEFS: {
  type: ContactChannelType;
  labelTh: string;
  labelEn: string;
  labelZh: string;
  placeholderTh: string;
  placeholderEn: string;
  placeholderZh: string;
  icon: string;
}[] = [
  {
    type: "line",
    labelTh: "ID LINE",
    labelEn: "LINE ID",
    labelZh: "LINE ID",
    placeholderTh: "เช่น @mylineid หรือไอดี LINE",
    placeholderEn: "e.g. @mylineid or LINE ID",
    placeholderZh: "例如 @mylineid หรือ LINE ID",
    icon: "💬",
  },
  {
    type: "facebook",
    labelTh: "Facebook",
    labelEn: "Facebook",
    labelZh: "Facebook",
    placeholderTh: "เช่น fb.com/yourname หรือ ชื่อโปรไฟล์ Facebook",
    placeholderEn: "e.g. fb.com/yourname or Facebook profile name",
    placeholderZh: "例如 fb.com/yourname 或 Facebook 账号名",
    icon: "📘",
  },
  {
    type: "whatsapp",
    labelTh: "WhatsApp",
    labelEn: "WhatsApp",
    labelZh: "WhatsApp",
    placeholderTh: "เช่น +66 8X XXX XXXX",
    placeholderEn: "e.g. +66 8X XXX XXXX",
    placeholderZh: "例如 +66 8X XXX XXXX",
    icon: "📱",
  },
  {
    type: "wechat",
    labelTh: "WeChat",
    labelEn: "WeChat",
    labelZh: "微信 (WeChat)",
    placeholderTh: "เช่น WeChat ID",
    placeholderEn: "e.g. WeChat ID",
    placeholderZh: "例如 WeChat ID",
    icon: "🟢",
  },
  {
    type: "telegram",
    labelTh: "Telegram",
    labelEn: "Telegram",
    labelZh: "Telegram",
    placeholderTh: "เช่น @username",
    placeholderEn: "e.g. @username",
    placeholderZh: "例如 @username",
    icon: "✈️",
  },
  {
    type: "other",
    labelTh: "ช่องทางอื่นๆ",
    labelEn: "Other Channel",
    labelZh: "其他渠道",
    placeholderTh: "ระบุไอดี ลิงก์ หรือวิธีติดต่อ",
    placeholderEn: "Enter contact ID, link, or handle",
    placeholderZh: "输入联系方式或链接",
    icon: "🌐",
  },
];

export function formatContactChannelValue(
  type: ContactChannelType,
  value: string,
  customChannelName?: string
): string {
  const val = value.trim();
  if (!val) return "";
  let prefix = "ID_LINE";
  if (type === "facebook") prefix = "FACEBOOK";
  else if (type === "whatsapp") prefix = "WHATSAPP";
  else if (type === "wechat") prefix = "WECHAT";
  else if (type === "telegram") prefix = "TELEGRAM";
  else if (type === "other") {
    const custom = customChannelName?.trim().replace(/\s+/g, "_").toUpperCase();
    prefix = custom ? `OTHER_${custom}` : "OTHER";
  }
  return `${prefix}:${val}`;
}

export function ApplicationForm({
  availableLanguages: initialLanguages = [],
  availableCategories: initialCategories = [],
  initialProfile,
}: {
  availableLanguages?: InterpreterApplicationReference[];
  availableCategories?: InterpreterApplicationReference[];
  initialProfile?: InitialProfile | null;
}) {
  const availableLanguages = initialLanguages.length > 0 ? initialLanguages : DEFAULT_INTERPRETER_LANGUAGES;
  const availableCategories = sortCategoriesByPriority(
    initialCategories.length > 0 ? initialCategories : DEFAULT_INTERPRETER_CATEGORIES
  );
  const locale = useUiLocale();
  const router = useRouter();

  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [firstName, setFirstName] = useState(initialProfile?.firstName || "");
  const [lastName, setLastName] = useState(initialProfile?.lastName || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [userEmail, setUserEmail] = useState(initialProfile?.email || "");
  const [contactChannelType, setContactChannelType] = useState<ContactChannelType>("line");
  const [contactValue, setContactValue] = useState("");
  const [customChannelName, setCustomChannelName] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateFileName, setCertificateFileName] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(Boolean(initialProfile?.firstName || initialProfile?.phone));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getChannelDef = (type: ContactChannelType) => {
    return CHANNEL_DEFS.find((d) => d.type === type) ?? CHANNEL_DEFS[0];
  };

  const getChannelLabel = (type: ContactChannelType) => {
    const def = getChannelDef(type);
    if (locale === "th") return def.labelTh;
    if (locale === "zh") return def.labelZh;
    return def.labelEn;
  };

  const getChannelPlaceholder = (type: ContactChannelType) => {
    const def = getChannelDef(type);
    if (locale === "th") return def.placeholderTh;
    if (locale === "zh") return def.placeholderZh;
    return def.placeholderEn;
  };

  const compileExtraContact = (): string => {
    return formatContactChannelValue(contactChannelType, contactValue, customChannelName);
  };

  useEffect(() => {
    let disposed = false;

    const loadProfile = async () => {
      if (initialProfile?.firstName || initialProfile?.phone) {
        setHasPrefilled(true);
        return;
      }

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, phone")
            .eq("user_id", userData.user.id)
            .maybeSingle();

          if (profile && !disposed) {
            if (profile.first_name || profile.last_name || profile.phone) {
              setFirstName((prev) => prev || profile.first_name || "");
              setLastName((prev) => prev || profile.last_name || "");
              setPhone((prev) => prev || profile.phone || "");
              setUserEmail((prev) => prev || userData.user.email || "");
              setHasPrefilled(true);
              return;
            }
          }
        }
      } catch {
        // Supabase client error or unconfigured
      }

      if (!disposed) {
        const session = getMockUserSession();
        if (session) {
          const { firstName: fName, lastName: lName } = splitDisplayName(session.name);
          setFirstName((prev) => prev || fName || "");
          setLastName((prev) => prev || lName || "");
          setPhone((prev) => prev || session.phone || "");
          setUserEmail((prev) => prev || session.email || "");
          if (fName || session.phone) {
            setHasPrefilled(true);
          }
        }
      }
    };

    void loadProfile();

    return () => {
      disposed = true;
    };
  }, [initialProfile]);


  const toggleLang = (id: string) => {
    setSelectedLangs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAdditional = (id: string) => {
    if (!selectedLangs.includes(id)) {
      setSelectedLangs((prev) => [...prev, id]);
    }
    setSearchQuery("");
  };

  const handleAddCustomLanguage = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    const candidate = searchQuery.trim().toLowerCase();
    const language = availableLanguages.find(
      (item) => item.id.toLowerCase() === candidate || item.name.toLowerCase() === candidate
    );
    if (language && !selectedLangs.includes(language.id)) {
      setSelectedLangs((prev) => [...prev, language.id]);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Triggered when clicking "บันทึกข้อมูลและส่งใบสมัคร" in main form -> Open Confirmation Modal
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedLangs.length || !selectedCats.length || !certificateFileName) {
      setSubmitError(
        locale === "th"
          ? "กรุณาเลือกภาษา เลือกหมวดหมู่งาน และแนบเอกสารรับรองให้ครบถ้วน"
          : locale === "zh"
            ? "请选择语言、任务类别，并附上资质证明文件"
            : "Please select languages, mission categories, and attach a credential document."
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setSubmitError(
        locale === "th"
          ? "ไม่พบข้อมูลชื่อ-นามสกุลหรือเบอร์โทรศัพท์จากโปรไฟล์ กรุณาตรวจสอบข้อมูลในหน้าโปรไฟล์ก่อนสมัคร"
          : locale === "zh"
            ? "未在个人资料中找到姓名或电话号码，请先在个人资料页面完善信息"
            : "Name or phone number not found in profile. Please check your profile before applying."
      );
      return;
    }

    setShowConfirmModal(true);
  };

  // Triggered inside Modal when clicking "ยืนยันและส่งใบสมัคร"
  const handleConfirmSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (!certificateFile) {
        setSubmitError(
          locale === "th"
            ? "กรุณาแนบไฟล์เอกสารรับรองก่อนส่งใบสมัคร"
            : locale === "zh"
              ? "请在提交申请前附上资质证明文件"
              : "Please attach your credential file before submitting."
        );
        setShowConfirmModal(false);
        return;
      }

      const uploadData = new FormData();
      uploadData.set("file", certificateFile);
      const uploadResult = await uploadInterpreterCertificateAction(uploadData);
      if (!uploadResult.ok) {
        setSubmitError(uploadResult.error);
        setShowConfirmModal(false);
        return;
      }

      const result = await submitInterpreterApplicationAction({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: userEmail.trim(),
        extraContact: compileExtraContact(),
        assignedArea: "",
        languageCodes: selectedLangs,
        categoryCodes: selectedCats,
        certificateFileName: uploadResult.data.fileName,
        certificateUrl: uploadResult.data.path,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setShowConfirmModal(false);
        return;
      }

      setShowConfirmModal(false);
      // Redirect to volunteer application status page
      router.push("/user/volunteer/status");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : locale === "th"
            ? "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่"
            : locale === "zh"
              ? "无法提交申请，请重试"
              : "Unable to submit application. Please try again."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageLabel = (id: string) => {
    const item = availableLanguages.find((language) => language.id === id);
    if (!item) return id;
    if (locale === "th") return item.nameTh || item.name;
    if (locale === "zh") return item.nameZh || item.name;
    return item.name;
  };

  const getCategoryLabel = (id: string) => {
    const item = availableCategories.find((cat) => cat.id === id);
    if (!item) return id;
    if (locale === "th") return item.nameTh || item.name;
    if (locale === "zh") return item.nameZh || item.name;
    return item.name;
  };

  const filteredCatalog = availableLanguages.filter((lang) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      lang.name.toLowerCase().includes(query) ||
      (lang.nameTh && lang.nameTh.toLowerCase().includes(query)) ||
      (lang.nameZh && lang.nameZh.toLowerCase().includes(query)) ||
      lang.id.toLowerCase().includes(query);
    return matchesSearch && !selectedLangs.includes(lang.id);
  });

  const coreLanguages = ["thai", "english", "chinese", "spanish", "arabic"]
    .map((code) => availableLanguages.find((language) => language.id === code))
    .filter((language): language is InterpreterApplicationReference => Boolean(language));

  return (
    <>
      <form onSubmit={handleOpenConfirmModal} className="space-y-6">
        {submitError && (
          <div className="rounded-(--khvi-radius-sm) border border-[#f04f3e] bg-[#fff1f2] p-4 text-sm font-bold text-[#b8291b]" role="alert">
            {submitError}
          </div>
        )}

        {/* Centered Form Sections */}
        <div className="space-y-6">
          {/* 1. Languages Selection */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-extrabold text-[#10283a]">
                {locale === "th"
                  ? "1. ภาษาที่สามารถให้บริการแปลได้"
                  : locale === "zh"
                    ? "1. 可提供翻译的语言"
                    : "1. Languages for Interpretation"}
              </label>
              <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                {locale === "th"
                  ? `เลือกแล้ว ${selectedLangs.length} ภาษา`
                  : locale === "zh"
                    ? `已选 ${selectedLangs.length} 种语言`
                    : `${selectedLangs.length} selected`}
              </span>
            </div>
            <p className="text-xs text-[#64777e] mb-4">
              {locale === "th"
                ? "เลือกภาษาหลัก 5 ภาษาด้านล่าง หรือใช้ตัวเลือก Multi-select เพื่อค้นหาและเพิ่มภาษาอื่น ๆ จากทุกภาษาทั่วโลก"
                : locale === "zh"
                  ? "从下方选择 5 种核心语言，或使用多选搜索添加全球其他语言"
                  : "Select from the 5 core languages below or use the multi-select search to add other languages worldwide."}
            </p>

            {/* 5 ภาษาหลักตามโจทย์: ไทย, อังกฤษ, จีน, สเปน, อาหรับ */}
            <div className="mb-4">
              <span className="block text-xs font-bold text-[#10283a] mb-2 uppercase tracking-wide">
                {locale === "th" ? "ภาษาหลัก (Core Languages):" : locale === "zh" ? "核心语言 (Core Languages):" : "Core Languages:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {coreLanguages.map((lang) => {
                  const isSelected = selectedLangs.includes(lang.id);
                  return (
                    <button
                      type="button"
                      key={lang.id}
                      onClick={() => toggleLang(lang.id)}
                      className={`rounded-(--khvi-radius-sm) border px-3.5 py-2 text-xs font-bold transition-colors ${
                        isSelected
                          ? "border-[#087f80] bg-[#087f80] text-white"
                          : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                      }`}
                    >
                      <span>{isSelected ? "✓ " : "+ "}</span>
                      <span>{getLanguageLabel(lang.id)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-select ค้นหาและเลือกภาษาอื่นจากทั่วโลก */}
            <div className="border-t border-[#edf2f4] pt-4">
              <span className="block text-xs font-bold text-[#10283a] mb-2 uppercase tracking-wide">
                {locale === "th"
                  ? "เพิ่มภาษาอื่น ๆ ทั่วโลก (Global Multi-Select):"
                  : locale === "zh"
                    ? "全球语言多选 (Global Multi-Select):"
                    : "Global Multi-Select:"}
              </span>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomLanguage();
                        }
                      }}
                      placeholder={
                        locale === "th"
                          ? "พิมพ์เพื่อค้นหาภาษาทั่วโลก (เช่น พม่า, ฝรั่งเศส, ญี่ปุ่น, ภาษามือ...)"
                          : locale === "zh"
                            ? "输入以搜索全球语言（例如：缅甸语、法语、日语、手语...）"
                            : "Type to search languages (e.g. Burmese, French, Japanese, Sign language...)"
                      }
                      className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#73848a] hover:text-[#10283a]"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-[#f8fafb] px-3.5 py-2 text-xs font-bold text-[#39525d] hover:bg-[#edf3f1]"
                  >
                    {isDropdownOpen
                      ? locale === "th" ? "ปิดรายการ ▲" : locale === "zh" ? "收起 ▲" : "Close ▲"
                      : locale === "th" ? "เลือกภาษา ▼" : locale === "zh" ? "选择语言 ▼" : "Select language ▼"}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    className="rounded-(--khvi-radius-sm) border border-[#092f45] bg-[#092f45] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c4960] transition-colors shrink-0"
                    title={locale === "th" ? "เพิ่มภาษาที่พิมพ์ในช่องค้นหา" : locale === "zh" ? "添加输入的语言" : "Add typed language"}
                  >
                    {locale === "th" ? "+ เพิ่ม" : locale === "zh" ? "+ 添加" : "+ Add"}
                  </button>
                </div>

                {/* Dropdown Options List */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-(--khvi-radius-sm) border border-[#087f80] bg-white shadow-lg">
                    <div className="border-b border-[#edf2f4] bg-[#f8fafb] px-3 py-1.5 text-[11px] font-bold text-[#64777e] flex justify-between items-center">
                      <span>
                        {locale === "th"
                          ? `คลิกเพื่อเพิ่มภาษาที่ต้องการ (${filteredCatalog.length} ภาษา)`
                          : locale === "zh"
                            ? `点击添加所需语言（共 ${filteredCatalog.length} 种）`
                            : `Click to add a language (${filteredCatalog.length} available)`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-[#087f80] font-bold hover:underline cursor-pointer"
                      >
                        {locale === "th" ? "เสร็จสิ้น" : locale === "zh" ? "完成" : "Done"}
                      </button>
                    </div>

                    {filteredCatalog.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#73848a]">
                        {locale === "th"
                          ? "ไม่พบภาษาในแคตตาล็อกที่พร้อมใช้งาน"
                          : locale === "zh"
                            ? "未在目录中找到可用语言"
                            : "No available languages found in catalog"}
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f0f4f6]">
                        {filteredCatalog.map((lang) => (
                          <button
                            type="button"
                            key={lang.id}
                            onClick={() => handleSelectAdditional(lang.id)}
                            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-[#10283a] hover:bg-[#edf7f5] hover:text-[#087557] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>{getLanguageLabel(lang.id)}</span>
                            <span className="text-[11px] font-mono text-[#087f80]">
                              {locale === "th" ? "+ เพิ่ม" : locale === "zh" ? "+ 添加" : "+ Add"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Languages Chips Display */}
              {selectedLangs.length > 0 && (
                <div className="mt-4 rounded-(--khvi-radius-sm) border border-[#e2ebee] bg-[#f8fafb] p-3">
                  <span className="block text-[11px] font-bold text-[#53656c] mb-2 uppercase tracking-wide">
                    {locale === "th"
                      ? `ภาษาที่คุณเลือกให้บริการทั้งหมด (${selectedLangs.length}):`
                      : locale === "zh"
                        ? `已选服务语言总计 (${selectedLangs.length}):`
                        : `All selected languages (${selectedLangs.length}):`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLangs.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-(--khvi-radius-sm) border border-[#087f80] bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087557]"
                      >
                        <span>✓ {getLanguageLabel(id)}</span>
                        <button
                          type="button"
                          onClick={() => toggleLang(id)}
                          className="ml-1 text-[#087f80] hover:text-[#f04f3e] text-xs font-extrabold cursor-pointer"
                          title={locale === "th" ? "ลบภาษานี้" : locale === "zh" ? "删除此语言" : "Remove language"}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-[#edf2f4] pt-3 text-xs text-[#64777e] flex items-center justify-between">
                <span>
                  {locale === "th"
                    ? "ภาษาหลักของระบบ (primary_language_id): "
                    : locale === "zh"
                      ? "系统主要语言 (primary_language_id): "
                      : "System primary language (primary_language_id): "}
                  <strong className="text-[#10283a]">
                    {locale === "th" ? "ไทย (Thai)" : locale === "zh" ? "泰语 (Thai)" : "Thai"}
                  </strong>
                </span>
                <span className="font-mono text-[11px] text-[#73848a]">
                  {locale === "th" ? "จำเป็น" : locale === "zh" ? "必填" : "Required"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Categories Selection */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-extrabold text-[#10283a]">
                {locale === "th"
                  ? "2. หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ"
                  : locale === "zh"
                    ? "2. 志愿服务任务类别"
                    : "2. Mission Categories"}
              </label>
              <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                {locale === "th"
                  ? `เลือกแล้ว ${selectedCats.length} หมวด`
                  : locale === "zh"
                    ? `已选 ${selectedCats.length} 类`
                    : `${selectedCats.length} selected`}
              </span>
            </div>
            <p className="text-xs text-[#64777e] mb-4">
              {locale === "th"
                ? "เลือกประเภทงานที่คุ้นเคยเพื่อช่วยเพิ่มความมั่นใจในการสื่อสารในสถานการณ์จริง"
                : locale === "zh"
                  ? "选择您熟悉的任务类别，以便在实际情境中更自信地提供沟通协助"
                  : "Select categories you are comfortable with to ensure effective communication in crisis scenarios."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {availableCategories.map((cat) => {
                const isSelected = selectedCats.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-(--khvi-radius-sm) border p-3.5 text-xs font-semibold transition-colors select-none ${
                      isSelected
                        ? "border-[#087f80] bg-[#edf7f5] text-[#087557]"
                        : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCat(cat.id)}
                      className="h-4 w-4 rounded accent-[#087f80]"
                    />
                    <span className="text-base">{cat.icon}</span>
                    <span className="leading-snug">{getCategoryLabel(cat.id)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Contact Information (Data Dictionary Compliant) */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-extrabold text-[#10283a]">
                {locale === "th"
                  ? "3. ข้อมูลการติดต่อสำหรับการประสานงาน (Contact Details)"
                  : locale === "zh"
                    ? "3. 协调联络信息 (Contact Details)"
                    : "3. Contact Details for Coordination"}
              </label>
              {hasPrefilled && (
                <span className="inline-flex items-center gap-1 rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  ✓ {locale === "th" ? "ดึงข้อมูลจากโปรไฟล์อัตโนมัติ" : locale === "zh" ? "已自动关联个人资料" : "Auto-linked from profile"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64777e] mb-4">
              {locale === "th"
                ? "ข้อมูลส่วนนี้จะถูกเปิดเผยเฉพาะผู้ขอความช่วยเหลือเมื่อคุณกดรับงาน (Claim) แล้วเท่านั้น ตามกฎความปลอดภัย BR-04"
                : locale === "zh"
                  ? "根据 BR-04 安全规则，此信息仅在您接单 (Claim) 后才会向求助者公开"
                  : "This information will only be revealed to the requester after you claim an assignment, compliant with BR-04 safety rules."}
            </p>

            {/* Background profile info summary */}
            <div className="mb-4 rounded-lg border border-[#e2ebee] bg-[#f8fafb] p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[#2d424b]">
                  <span>
                    <span className="text-[#6c8088]">{locale === "th" ? "ชื่อ-นามสกุล:" : locale === "zh" ? "姓名:" : "Name:"}</span>{" "}
                    <strong className="text-[#10283a]">{firstName} {lastName}</strong>
                  </span>
                  <span>
                    <span className="text-[#6c8088]">{locale === "th" ? "เบอร์โทรศัพท์หลัก:" : locale === "zh" ? "主要电话:" : "Phone:"}</span>{" "}
                    <strong className="text-[#10283a]">{phone || "-"}</strong>
                  </span>
                </div>
                <Link
                  href="/profile#personal-details"
                  target="_blank"
                  className="text-[11px] font-bold text-[#087f80] hover:underline"
                >
                  {locale === "th" ? "แก้ไขข้อมูลในหน้าโปรไฟล์ ↗" : locale === "zh" ? "在个人资料页面修改 ↗" : "Edit in profile ↗"}
                </Link>
              </div>
            </div>

            {/* Single Contact Channel Selection (Select) */}
            <div>
              <label className="block text-xs font-bold text-[#10283a] mb-1.5">
                {locale === "th"
                  ? "ช่องทางติดต่อเพิ่มเติม"
                  : locale === "zh"
                    ? "其他联系渠道"
                    : "Additional Contact Channel"}
              </label>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Select Channel Type */}
                  <div className="sm:w-48 shrink-0">
                    <select
                      value={contactChannelType}
                      onChange={(e) => setContactChannelType(e.target.value as ContactChannelType)}
                      className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3 py-2 text-xs font-bold text-[#10283a] focus:border-[#087f80] focus:outline-none cursor-pointer"
                    >
                      {CHANNEL_DEFS.map((def) => (
                        <option key={def.type} value={def.type}>
                          {def.icon} {getChannelLabel(def.type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* If Other: Custom Channel Name Input */}
                  {contactChannelType === "other" && (
                    <div className="sm:w-44 shrink-0">
                      <input
                        type="text"
                        value={customChannelName}
                        onChange={(e) => setCustomChannelName(e.target.value)}
                        placeholder={
                          locale === "th"
                            ? "ชื่อช่องทาง เช่น Instagram"
                            : locale === "zh"
                              ? "渠道名称 如 Instagram"
                              : "Channel name e.g. Instagram"
                        }
                        className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3 py-2 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Contact Handle / ID Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={getChannelPlaceholder(contactChannelType)}
                      className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3 py-2 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                    />
                  </div>
                </div>

                <span className="block text-[11px] text-[#73848a]">
                  {locale === "th"
                    ? "ใช้สำหรับประสานงานเพิ่มเติมกับผู้ขอความช่วยเหลือเมื่อเริ่มภารกิจ (ระบบจะเปิดเผยเฉพาะเมื่อคุณ Claim งานแล้วเท่านั้น)"
                    : locale === "zh"
                      ? "用于任务开始时与求助者的沟通协作（仅在接单后向求助者公开）"
                      : "Used for additional coordination with the requester once mission begins (revealed only after you claim)."}
                </span>
              </div>
            </div>
          </div>


          {/* 4. Certificate & Verification (INTERPRETER_APPLICATIONS: certificate_url) */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-extrabold text-[#10283a]">
                {locale === "th"
                  ? "4. เอกสารรับรองคุณวุฒิหรือทักษะทางภาษา (INTERPRETER_APPLICATIONS.certificate_url)"
                  : locale === "zh"
                    ? "4. 资质或语言能力证明 (INTERPRETER_APPLICATIONS.certificate_url)"
                    : "4. Credential or Language Certificate (INTERPRETER_APPLICATIONS.certificate_url)"}
              </label>
              <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                {locale === "th" ? "ต้องผ่านการตรวจสอบโดย Manager" : locale === "zh" ? "需管理员审核" : "Manager Review Required"}
              </span>
            </div>
            <p className="text-xs text-[#64777e] mb-4">
              {locale === "th"
                ? "แนบไฟล์ใบประกาศนียบัตร, ผลสอบวัดระดับภาษา (เช่น HSK, JLPT, IELTS, ใบรับรองล่าม) เพื่อให้ Manager ตรวจสอบความถูกต้องก่อนอนุมัติ"
                : locale === "zh"
                  ? "上传证书、语言等级考试成绩单（例如 HSK、JLPT、IELTS、口译证书等），供管理员审核批准"
                  : "Attach diplomas, proficiency test certificates (e.g. HSK, JLPT, IELTS, interpreter certificates) for Manager review prior to approval."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                id="cert-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCertificateFile(file);
                    setCertificateFileName(file.name);
                  }
                }}
              />
              <label
                htmlFor="cert-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-(--khvi-radius-sm) border border-[#087f80] bg-[#087f80] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0c6b6c]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>
                  {certificateFileName
                    ? locale === "th" ? "เปลี่ยนไฟล์เอกสาร" : locale === "zh" ? "更换文件" : "Change document"
                    : locale === "th" ? "เลือกไฟล์เอกสาร..." : locale === "zh" ? "选择文件..." : "Select document..."}
                </span>
              </label>

              {certificateFileName ? (
                <div className="inline-flex items-center gap-2 rounded-(--khvi-radius-sm) border border-[#8ed5c4] bg-[#edf7f5] px-3 py-1.5 text-xs font-bold text-[#087557]">
                  <span>📄 {certificateFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCertificateFileName("");
                      setCertificateFile(null);
                    }}
                    className="ml-1 font-extrabold text-[#f04f3e] hover:underline cursor-pointer"
                    title={locale === "th" ? "นำไฟล์ออก" : locale === "zh" ? "移除文件" : "Remove file"}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs text-[#73848a]">
                  {locale === "th"
                    ? "รองรับไฟล์ PDF, JPG, PNG (ขนาดไม่เกิน 10 MB)"
                    : locale === "zh"
                      ? "支持 PDF、JPG、PNG 格式（最大 10 MB）"
                      : "Supports PDF, JPG, PNG (max 10 MB)"}
                </span>
              )}
            </div>
          </div>

          {/* Profile Verification & Privacy Shield Callout */}
          <div className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] p-5 text-xs text-[#10283a] shadow-sm flex items-start gap-3">
            <span className="text-base font-bold text-[#087557] shrink-0">✓</span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-[#087557]">
                {locale === "th"
                  ? "มาตรฐานความปลอดภัยและสิทธิ์การรับงาน (BR-02, BR-03, BR-04)"
                  : locale === "zh"
                    ? "安全标准与接单资格 (BR-02, BR-03, BR-04)"
                    : "Safety Standards & Assignment Eligibility (BR-02, BR-03, BR-04)"}
              </h4>
              <p className="leading-relaxed text-[#53656c]">
                {locale === "th"
                  ? "แบบฟอร์มนี้ตรงตาม Data Dictionary 100% โดยไม่มีฟิลด์ส่วนเกิน ข้อมูลติดต่อและพิกัดละเอียดจะถูกปกปิดไว้จนกว่าคุณจะกด Claim งานสำเร็จ"
                  : locale === "zh"
                    ? "此表单 100% 符合数据字典规范，无冗余字段。联络信息与精确位置将保持隐藏，直到成功接单 (Claim)"
                    : "This form complies 100% with the Data Dictionary. Contact details and exact coordinates remain shielded until an assignment is successfully claimed."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <Link
              href="/user"
              className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-[#cbd7dc] bg-white px-5 py-2.5 text-sm font-bold text-[#53656c] hover:bg-[#f4f7f8] hover:text-[#10283a] transition-colors"
            >
              {locale === "th"
                ? "← ยกเลิกสมัครเพื่อออกและกลับสู่หน้าหลัก"
                : locale === "zh"
                  ? "← 取消申请并返回首页"
                  : "← Cancel application and return home"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-(--khvi-radius-sm) border border-[#092f45] bg-[#092f45] px-8 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#0c4960] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {locale === "th"
                ? "บันทึกข้อมูลและส่งใบสมัคร"
                : locale === "zh"
                  ? "保存信息并提交申请"
                  : "Save and submit application"}
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[0_24px_56px_rgba(15,38,54,0.25)] space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#eef3f5] pb-3">
              <div>
                <span className="inline-block rounded-full bg-[#edf7f5] px-2.5 py-0.5 text-[10px] font-extrabold text-[#087f80] uppercase tracking-wider mb-1">
                  {locale === "th"
                    ? "ตรวจสอบความถูกต้องก่อนส่ง"
                    : locale === "zh"
                      ? "提交前核对信息"
                      : "Review details before submitting"}
                </span>
                <h3 className="text-lg font-extrabold text-[#10283a]">
                  {locale === "th"
                    ? "ยืนยันข้อมูลการสมัครล่ามจิตอาสา"
                    : locale === "zh"
                      ? "确认志愿口译员申请信息"
                      : "Confirm volunteer interpreter application"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-1 text-[#6c8591] hover:bg-[#edf3f6] hover:text-[#112d3e] transition-colors"
                title={locale === "th" ? "ปิด" : locale === "zh" ? "关闭" : "Close"}
              >
                ✕
              </button>
            </div>

            {/* Summary Information Grid */}
            <div className="space-y-3.5 text-xs text-[#2b4857] max-h-[60vh] overflow-y-auto pr-1">
              <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-3.5 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? "ข้อมูลส่วนตัวและการติดต่อ"
                    : locale === "zh"
                      ? "个人信息与联系方式"
                      : "Personal & contact info"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#7d939f] block">
                      {locale === "th" ? "ชื่อ-นามสกุล:" : locale === "zh" ? "姓名:" : "Full name:"}
                    </span>
                    <strong className="text-[#10283a]">{firstName} {lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[#7d939f] block">
                      {locale === "th" ? "หมายเลขโทรศัพท์:" : locale === "zh" ? "电话号码:" : "Phone number:"}
                    </span>
                    <strong className="text-[#10283a]">{phone}</strong>
                  </div>
                  {contactValue.trim() && (
                    <div className="col-span-2 space-y-1.5 pt-1">
                      <span className="text-[#7d939f] block text-[11px] font-bold">
                        {locale === "th"
                          ? "ช่องทางติดต่อเพิ่มเติม:"
                          : locale === "zh"
                            ? "其他联系方式:"
                            : "Additional contact channel:"}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#cde0e2] bg-white px-2.5 py-1 text-xs font-semibold text-[#0c6b6c]">
                          <span>{getChannelDef(contactChannelType).icon}</span>
                          <span className="font-mono font-bold text-[#10283a]">{compileExtraContact()}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-3.5 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? `ภาษาที่เลือกให้บริการ (${selectedLangs.length} ภาษา)`
                    : locale === "zh"
                      ? `所选服务语言 (${selectedLangs.length} 种)`
                      : `Selected languages (${selectedLangs.length})`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLangs.map((id) => (
                    <span
                      key={id}
                      className="rounded-md border border-[#cbe3dd] bg-white px-2.5 py-1 font-bold text-[#087557]"
                    >
                      ✓ {getLanguageLabel(id)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-3.5 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? `หมวดหมู่ภารกิจ (${selectedCats.length} หมวด)`
                    : locale === "zh"
                      ? `任务类别 (${selectedCats.length} 类)`
                      : `Mission categories (${selectedCats.length})`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCats.map((id) => (
                    <span
                      key={id}
                      className="rounded-md border border-[#e1ebef] bg-white px-2.5 py-1 font-bold text-[#204354]"
                    >
                      {getCategoryLabel(id)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Credential File */}
              <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-3.5 space-y-1.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? "เอกสารรับรองที่แนบ"
                    : locale === "zh"
                      ? "所附资质证明"
                      : "Attached credential document"}
                </div>
                <div className="flex items-center gap-2 font-bold text-[#10283a]">
                  <span>📄</span>
                  <span className="truncate">{certificateFileName}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef3f5] pt-3">
              <Link
                href="/user"
                className="rounded-(--khvi-radius-sm) px-2.5 py-1.5 text-xs font-bold text-[#b8291b] hover:bg-[#fff1f2] hover:underline transition-colors"
              >
                {locale === "th"
                  ? "ยกเลิกสมัครเพื่อออกและกลับสู่หน้าหลัก"
                  : locale === "zh"
                    ? "取消申请并返回首页"
                    : "Cancel application and return home"}
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-4 py-2 text-xs font-extrabold text-[#3b5463] hover:bg-[#f4f8f9] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {locale === "th" ? "← กลับไปแก้ไข" : locale === "zh" ? "← 返回修改" : "← Back to edit"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="inline-flex items-center gap-2 rounded-(--khvi-radius-sm) border border-[#087f80] bg-[#087f80] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0c6b6c] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{locale === "th" ? "กำลังส่งข้อมูล..." : locale === "zh" ? "正在提交..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <span>{locale === "th" ? "✓ ยืนยันและส่งใบสมัคร" : locale === "zh" ? "✓ 确认并提交申请" : "✓ Confirm and submit"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
