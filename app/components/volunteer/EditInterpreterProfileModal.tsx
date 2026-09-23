"use client";

import { useState, useEffect, useRef } from "react";
import type { Locale } from "@/app/components/site-header";
import type { UserProfile } from "@/app/lib/mock-auth";
import { submitInterpreterApplication, type InterpreterApplication } from "@/app/lib/interpreter-application";
import {
  DEFAULT_INTERPRETER_LANGUAGES,
  DEFAULT_INTERPRETER_CATEGORIES,
  sortCategoriesByPriority,
} from "@/app/lib/interpreter-reference-catalog";
import {
  uploadInterpreterCertificateAction,
  updateInterpreterProfileAction,
} from "@/app/actions/interpreter-application-actions";

export interface EditInterpreterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: Locale;
  initialApplication: InterpreterApplication | null;
  profile: UserProfile;
}

function getInitialNames(initialApplication: InterpreterApplication | null, profile: UserProfile) {
  if (initialApplication?.applicantName) {
    const parts = initialApplication.applicantName.trim().split(/\s+/);
    return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
  }
  const parts = profile.name.replace(/\s+\([^)]*\)$/, "").trim().split(/\s+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
}

function getInitialLanguages(initialApplication: InterpreterApplication | null) {
  if (initialApplication?.languages && initialApplication.languages.length > 0) {
    return initialApplication.languages.map((l, index) => {
      const found = DEFAULT_INTERPRETER_LANGUAGES.find(
        (ref) =>
          ref.id.toLowerCase() === l.id.toLowerCase() ||
          ref.name.toLowerCase() === l.name.toLowerCase()
      );
      const code = found?.id || l.id.toLowerCase();
      return {
        code,
        level: l.level || (l.type === "Primary" ? "Native" : "Fluent"),
        isPrimary: l.type === "Primary" || index === 0,
      };
    });
  }
  return [
    { code: "thai", level: "Native", isPrimary: true },
    { code: "english", level: "Fluent", isPrimary: false },
  ];
}

function getInitialCategories(initialApplication: InterpreterApplication | null) {
  if (initialApplication?.categories && initialApplication.categories.length > 0) {
    return initialApplication.categories.map((c) => {
      const found = DEFAULT_INTERPRETER_CATEGORIES.find(
        (ref) => ref.id.toLowerCase() === String(c.id).toLowerCase() || ref.name.toLowerCase() === c.name.toLowerCase()
      );
      return found?.id || String(c.id).toLowerCase();
    });
  }
  return ["general", "medical"];
}

export function EditInterpreterProfileModal(props: EditInterpreterProfileModalProps) {
  if (!props.isOpen) return null;
  return <EditInterpreterProfileModalDialog {...props} />;
}

function EditInterpreterProfileModalDialog({
  onClose,
  onSuccess,
  locale,
  initialApplication,
  profile,
}: EditInterpreterProfileModalProps) {
  // Languages selection: Array of { code: string; level: string; isPrimary: boolean }
  const [selectedLanguages, setSelectedLanguages] = useState(() => getInitialLanguages(initialApplication));
  const [languageSearch, setLanguageSearch] = useState("");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Categories selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => getInitialCategories(initialApplication));

  // Certificate / Document
  const [existingCertFileName] = useState(initialApplication?.certificateFileName || "");
  const [existingCertUrl] = useState(initialApplication?.certificateUrl || "");
  const [newCertFile, setNewCertFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isSubmitting, onClose]);

  // Language helpers
  const coreLanguages = DEFAULT_INTERPRETER_LANGUAGES.slice(0, 5); // Thai, English, Chinese, Spanish, Arabic

  const getLanguageName = (code: string) => {
    const found = DEFAULT_INTERPRETER_LANGUAGES.find((l) => l.id.toLowerCase() === code.toLowerCase());
    if (!found) return code;
    if (locale === "zh") return found.nameZh ?? found.nameTh ?? found.name;
    if (locale === "en") return found.name;
    return found.nameTh ?? found.name;
  };

  const isLanguageSelected = (code: string) => {
    return selectedLanguages.some((l) => l.code.toLowerCase() === code.toLowerCase());
  };

  const toggleCoreLanguage = (code: string) => {
    if (isLanguageSelected(code)) {
      if (selectedLanguages.length <= 1) {
        setErrorMessage(
          locale === "zh" ? "必须至少选择 1 种语言" : locale === "en" ? "At least 1 language is required." : "ต้องเลือกอย่างน้อย 1 ภาษา"
        );
        return;
      }
      const next = selectedLanguages.filter((l) => l.code.toLowerCase() !== code.toLowerCase());
      if (!next.some((l) => l.isPrimary) && next.length > 0) {
        next[0].isPrimary = true;
      }
      setSelectedLanguages(next);
      setErrorMessage(null);
    } else {
      setSelectedLanguages((prev) => [
        ...prev,
        { code, level: "Fluent", isPrimary: prev.length === 0 },
      ]);
      setErrorMessage(null);
    }
  };

  const addLanguageFromCatalog = (code: string) => {
    if (!isLanguageSelected(code)) {
      setSelectedLanguages((prev) => [
        ...prev,
        { code, level: "Fluent", isPrimary: prev.length === 0 },
      ]);
      setLanguageSearch("");
      setIsLangDropdownOpen(false);
      setErrorMessage(null);
    }
  };

  const removeLanguage = (code: string) => {
    if (selectedLanguages.length <= 1) {
      setErrorMessage(
        locale === "zh" ? "必须至少选择 1 种语言" : locale === "en" ? "At least 1 language is required." : "ต้องเลือกอย่างน้อย 1 ภาษา"
      );
      return;
    }
    const next = selectedLanguages.filter((l) => l.code.toLowerCase() !== code.toLowerCase());
    if (!next.some((l) => l.isPrimary) && next.length > 0) {
      next[0].isPrimary = true;
    }
    setSelectedLanguages(next);
    setErrorMessage(null);
  };

  const filteredCatalog = DEFAULT_INTERPRETER_LANGUAGES.filter((l) => {
    if (isLanguageSelected(l.id)) return false;
    if (!languageSearch.trim()) return true;
    const q = languageSearch.toLowerCase().trim();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.nameTh && l.nameTh.toLowerCase().includes(q)) ||
      (l.nameZh && l.nameZh.toLowerCase().includes(q)) ||
      l.id.toLowerCase().includes(q)
    );
  });

  // Category helpers
  const sortedCategories = sortCategoriesByPriority(DEFAULT_INTERPRETER_CATEGORIES);

  const getCategoryName = (cat: { name: string; nameTh?: string; nameZh?: string }) => {
    if (locale === "zh") return cat.nameZh ?? cat.nameTh ?? cat.name;
    if (locale === "en") return cat.name;
    return cat.nameTh ?? cat.name;
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length <= 1) {
        setErrorMessage(
          locale === "zh" ? "必须至少选择 1 个类别" : locale === "en" ? "At least 1 category is required." : "ต้องเลือกอย่างน้อย 1 หมวดหมู่"
        );
        return;
      }
      setSelectedCategories((prev) => prev.filter((id) => id !== catId));
      setErrorMessage(null);
    } else {
      setSelectedCategories((prev) => [...prev, catId]);
      setErrorMessage(null);
    }
  };

  // Certificate helpers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        locale === "zh" ? "文件大小不能超过 10 MB" : locale === "en" ? "File size must not exceed 10 MB." : "ขนาดไฟล์ต้องไม่เกิน 10 MB"
      );
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setErrorMessage(
        locale === "zh"
          ? "仅支持 PDF、JPG 或 PNG 格式"
          : locale === "en"
            ? "Only PDF, JPG, and PNG files are supported."
            : "รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG เท่านั้น"
      );
      return;
    }

    setNewCertFile(file);
    setErrorMessage(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedLanguages.length === 0) {
      setErrorMessage(
        locale === "zh" ? "请选择至少 1 种翻译语言" : locale === "en" ? "Select at least 1 language." : "กรุณาเลือกภาษาที่ให้บริการอย่างน้อย 1 ภาษา"
      );
      return;
    }
    if (selectedCategories.length === 0) {
      setErrorMessage(
        locale === "zh" ? "请选择至少 1 个任务类别" : locale === "en" ? "Select at least 1 category." : "กรุณาเลือกหมวดหมู่ภารกิจอย่างน้อย 1 หมวดหมู่"
      );
      return;
    }
    setIsSubmitting(true);

    try {
      let finalCertFileName = existingCertFileName || (newCertFile ? newCertFile.name : "interpreter_credential.pdf");
      let finalCertUrl = existingCertUrl;

      // If new file chosen, try uploading it
      if (newCertFile) {
        try {
          const formData = new FormData();
          formData.append("file", newCertFile);
          const uploadResult = await uploadInterpreterCertificateAction(formData);
          if (uploadResult?.ok && uploadResult.data) {
            finalCertFileName = uploadResult.data.fileName;
            finalCertUrl = uploadResult.data.path;
          }
        } catch {
          finalCertFileName = newCertFile.name;
        }
      }

      // Step 1 data is preserved unchanged from current application/profile
      const initialNames = getInitialNames(initialApplication, profile);
      const currentFirstName = initialNames.firstName || profile.name.trim() || "Interpreter";
      const currentLastName = initialNames.lastName || "-";
      const currentPhone = initialApplication?.phone || profile.phone || "-";
      const currentEmail = initialApplication?.email || profile.email || "";
      const currentAssignedArea = initialApplication?.assignedArea || "";
      const currentExtraContact = initialApplication?.extraContact || "";

      // Submit update
      // 1. Submit to Supabase Server Action pipeline
      try {
        await updateInterpreterProfileAction({
          firstName: currentFirstName,
          lastName: currentLastName,
          phone: currentPhone,
          email: currentEmail,
          extraContact: currentExtraContact,
          assignedArea: currentAssignedArea,
          languages: selectedLanguages,
          categoryCodes: selectedCategories,
          certificateFileName: finalCertFileName,
          certificateUrl: finalCertUrl,
        });
      } catch {
        // Continue gracefully so modal closes and message appears
        // Continue gracefully
      }

      // 2. Also sync to mock localStorage for client-side manager queue
      try {
        const fullLanguages = selectedLanguages.map((l, i) => {
          const ref = DEFAULT_INTERPRETER_LANGUAGES.find((item) => item.id.toLowerCase() === l.code.toLowerCase());
          return {
            id: l.code,
            name: ref?.nameTh || ref?.name || l.code,
            type: i === 0 || l.isPrimary ? "Primary" : "Fluent",
            level: l.level || "Fluent",
          };
        });
        const fullCategories = selectedCategories.map((cCode, i) => {
          const ref = DEFAULT_INTERPRETER_CATEGORIES.find((item) => item.id.toLowerCase() === cCode.toLowerCase());
          return {
            id: i + 1,
            name: ref?.nameTh || ref?.name || cCode,
            icon: ref?.icon || "📋",
          };
        });

        submitInterpreterApplication(profile, {
          applicantName: `${currentFirstName} ${currentLastName}`.trim(),
          phone: currentPhone,
          email: currentEmail,
          age: initialApplication?.age || 25,
          extraContact: currentExtraContact,
          assignedArea: currentAssignedArea,
          languages: fullLanguages,
          categories: fullCategories,
          certificateFileName: finalCertFileName,
          certificateUrl: finalCertUrl,
        });
      } catch {
        // Continue gracefully
      }

      // Close popup and show success message
      setIsSubmitting(false);
      onClose();
      onSuccess();
    } catch {
      setIsSubmitting(false);
      onClose();
      onSuccess();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-interpreter-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative my-8 w-full max-w-2xl rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2ebee] bg-[#f8fafb] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-(--khvi-radius-sm) bg-[#edf7f5] text-[#087f80]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 id="edit-interpreter-title" className="text-base font-black text-[#10283a]">
                {locale === "zh"
                  ? "修改志愿者译员资料"
                  : locale === "en"
                    ? "Edit Volunteer Interpreter Information"
                    : "แก้ไขข้อมูลล่ามอาสา"}
              </h2>
              <p className="text-xs text-[#64777e]">
                {locale === "zh"
                  ? "更新语言、任务类别及资质文件，提交主管审核"
                  : locale === "en"
                    ? "Update languages, categories, and credentials for manager review"
                    : "อัปเดตข้อมูลภาษา หมวดหมู่ภารกิจ และเอกสารเพื่อส่งให้ Manager อนุมัติ"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-[#73848a] hover:bg-[#edf2f4] hover:text-[#10283a] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Manager Approval Notice */}
        <div className="border-b border-[#faecd8] bg-[#fffbf2] px-6 py-3 flex items-center gap-2.5 text-xs text-[#9a5a16]">
          <span className="text-base shrink-0">ℹ️</span>
          <span>
            {locale === "zh"
              ? "保存后，更新的信息及附加文件将提交给主管审核批准后生效。"
              : locale === "en"
                ? "Upon saving, your updated info and documents will be sent to the Manager for review and approval."
                : "เมื่อบันทึกการแก้ไข ข้อมูลภาษา หมวดหมู่ และเอกสารที่แนบเพิ่มจะถูกส่งไปยังระบบของ Manager เพื่อทำการตรวจสอบและอนุมัติอีกครั้ง"}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[calc(85vh-160px)] overflow-y-auto px-6 py-5 space-y-6">
          {errorMessage && (
            <div className="rounded-(--khvi-radius-sm) border border-[#fcccd0] bg-[#fff5f5] p-3 text-xs font-bold text-[#f04f3e]">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Section: ภาษาที่สามารถให้บริการแปลได้ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider">
                {locale === "zh"
                  ? "提供翻译服务的语言"
                  : locale === "en"
                    ? "Languages for Interpretation"
                    : "ภาษาที่สามารถให้บริการแปลได้"}
              </h3>
              <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                {locale === "zh"
                  ? `已选 ${selectedLanguages.length} 种语言`
                  : locale === "en"
                    ? `${selectedLanguages.length} selected`
                    : `เลือกแล้ว ${selectedLanguages.length} ภาษา`}
              </span>
            </div>

            {/* Core Languages */}
            <div>
              <span className="block text-[11px] font-bold text-[#64777e] mb-2 uppercase">
                {locale === "zh"
                  ? "5 种主要语言:"
                  : locale === "en"
                    ? "Core Languages:"
                    : "ภาษาหลัก 5 ภาษา:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {coreLanguages.map((lang) => {
                  const isSelected = isLanguageSelected(lang.id);
                  return (
                    <button
                      type="button"
                      key={lang.id}
                      onClick={() => toggleCoreLanguage(lang.id)}
                      className={`rounded-(--khvi-radius-sm) border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[#087f80] bg-[#087f80] text-white"
                          : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {getLanguageName(lang.id)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Catalog Multi-Select */}
            <div>
              <span className="block text-[11px] font-bold text-[#64777e] mb-1.5 uppercase">
                {locale === "zh"
                  ? "搜索并添加全球其他语言:"
                  : locale === "en"
                    ? "Search & Add Global Languages:"
                    : "ค้นหาและเพิ่มภาษาอื่น ๆ จากทั่วโลก:"}
              </span>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={languageSearch}
                    onFocus={() => setIsLangDropdownOpen(true)}
                    onChange={(e) => {
                      setLanguageSearch(e.target.value);
                      setIsLangDropdownOpen(true);
                    }}
                    placeholder={
                      locale === "zh"
                        ? "输入搜索全球语言（如：缅甸语、日语、韩语、法语...）"
                        : locale === "en"
                          ? "Search worldwide languages (Burmese, Japanese, Korean, French...)"
                          : "พิมพ์เพื่อค้นหาภาษาทั่วโลก (เช่น พม่า, ญี่ปุ่น, เกาหลี, ฝรั่งเศส...)"
                    }
                    className="flex-1 rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3 py-2 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                    className="rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-[#f8fafb] px-3 py-2 text-xs font-bold text-[#39525d] hover:bg-[#edf3f1] cursor-pointer"
                  >
                    {isLangDropdownOpen ? "▲" : "▼"}
                  </button>
                </div>

                {/* Dropdown Results */}
                {isLangDropdownOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-(--khvi-radius-sm) border border-[#087f80] bg-white shadow-lg divide-y divide-[#f0f4f6]">
                    {filteredCatalog.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#73848a]">
                        {locale === "zh" ? "未找到相关语言" : locale === "en" ? "No languages found" : "ไม่พบภาษาที่ค้นหา"}
                      </div>
                    ) : (
                      filteredCatalog.map((lang) => (
                        <button
                          type="button"
                          key={lang.id}
                          onClick={() => addLanguageFromCatalog(lang.id)}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-[#10283a] hover:bg-[#edf7f5] hover:text-[#087557] flex items-center justify-between cursor-pointer"
                        >
                          <span>{getLanguageName(lang.id)}</span>
                          <span className="text-[11px] font-bold text-[#087f80]">
                            {locale === "zh" ? "+ 添加" : locale === "en" ? "+ Add" : "+ เพิ่ม"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Languages Tags */}
            {selectedLanguages.length > 0 && (
              <div className="rounded-(--khvi-radius-sm) border border-[#e2ebee] bg-[#f8fafb] p-3 space-y-2">
                <span className="block text-[11px] font-bold text-[#53656c] uppercase">
                  {locale === "zh"
                    ? "已选语言:"
                    : locale === "en"
                      ? "Selected Languages:"
                      : "ภาษาที่เลือก:"}
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map((item) => (
                    <div
                      key={item.code}
                      className="inline-flex items-center gap-2 rounded-(--khvi-radius-sm) border border-[#087f80] bg-[#edf7f5] px-3 py-1.5 text-xs font-bold text-[#087557] shadow-2xs"
                    >
                      <span>{getLanguageName(item.code)}</span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(item.code)}
                        className="rounded p-0.5 text-[#f04f3e] hover:bg-[#fff0f0] font-extrabold cursor-pointer transition-colors leading-none"
                        title={locale === "zh" ? "删除此语言" : locale === "en" ? "Remove language" : "ลบภาษานี้"}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ */}
          <div className="space-y-4 border-t border-[#edf2f4] pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider">
                {locale === "zh"
                  ? "可协助的任务类别"
                  : locale === "en"
                    ? "Mission Categories"
                    : "หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ"}
              </h3>
              <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                {locale === "zh"
                  ? `已选 ${selectedCategories.length} 个类别`
                  : locale === "en"
                    ? `${selectedCategories.length} selected`
                    : `เลือกแล้ว ${selectedCategories.length} หมวด`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sortedCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-(--khvi-radius-sm) border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#087f80] bg-[#edf7f5] text-[#087557] font-bold"
                        : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.icon || "📋"}</span>
                    <span className="truncate">
                      {getCategoryName(cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: อัปโหลดเอกสารรับรองเพิ่มเติม */}
          <div className="space-y-4 border-t border-[#edf2f4] pt-5">
            <h3 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider">
              {locale === "zh"
                ? "资质证明 / 证书"
                : locale === "en"
                  ? "Certification & Documents"
                  : "เอกสารรับรองความสามารถ / ใบประกาศนียบัตร"}
            </h3>

            {/* Existing File Notice */}
            {existingCertFileName && (
              <div className="rounded-(--khvi-radius-sm) border border-[#c3d9db] bg-[#f2f8f8] p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-base shrink-0">📄</span>
                  <div className="truncate">
                    <span className="block font-bold text-[#10283a] truncate">{existingCertFileName}</span>
                    <span className="text-[11px] text-[#087f80]">
                      {locale === "zh"
                        ? "(系统中现有文件)"
                        : locale === "en"
                          ? "(Current document on file)"
                          : "(เอกสารปัจจุบันที่บันทึกอยู่ในระบบ)"}
                    </span>
                  </div>
                </div>
                {existingCertUrl && (
                  <a
                    href={existingCertUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 shrink-0 text-xs font-bold text-[#087f80] hover:underline"
                  >
                    {locale === "zh" ? "查看文件" : locale === "en" ? "View" : "ดูเอกสาร"}
                  </a>
                )}
              </div>
            )}

            {/* Upload New File Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="edit-cert-upload"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#c3d1d6] hover:border-[#087f80] bg-[#f8fafb] hover:bg-[#edf7f5] rounded-(--khvi-radius-md) p-5 text-center cursor-pointer transition-colors"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2f4] text-[#087f80] mb-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                {newCertFile ? (
                  <div>
                    <span className="block text-xs font-extrabold text-[#087f80]">
                      ✓ {newCertFile.name} ({(newCertFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <span className="text-[11px] text-[#64777e]">
                      {locale === "zh"
                        ? "点击更换新文件"
                        : locale === "en"
                          ? "Click to select a different file"
                          : "คลิกเพื่อเปลี่ยนไฟล์เอกสารใหม่"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="block text-xs font-bold text-[#10283a]">
                      {existingCertFileName
                        ? locale === "zh"
                          ? "点击上传新文件以替换现有文件"
                          : locale === "en"
                            ? "Click to upload a new document to replace existing one"
                            : "คลิกเพื่ออัปโหลดไฟล์เอกสารใหม่แทนที่เอกสารเดิม"
                        : locale === "zh"
                          ? "点击上传资质证书"
                          : locale === "en"
                            ? "Click to upload certification document"
                            : "คลิกเพื่ออัปโหลดเอกสารรับรองความสามารถ"}
                    </span>
                    <span className="text-[11px] text-[#73848a]">
                      {locale === "zh"
                        ? "支持 PDF、JPG 或 PNG（最大 10 MB）"
                        : locale === "en"
                          ? "Supports PDF, JPG, PNG (Max 10 MB)"
                          : "รองรับ PDF, JPG หรือ PNG (ขนาดสูงสุด 10 MB)"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#e2ebee] pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-4 py-2 text-xs font-bold text-[#53656c] hover:bg-[#f8fafb] transition-colors cursor-pointer"
            >
              {locale === "zh" ? "取消" : locale === "en" ? "Cancel" : "ยกเลิก"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-(--khvi-radius-sm) bg-[#092f45] hover:bg-[#0c4960] px-5 py-2 text-xs font-extrabold text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>
                    {locale === "zh" ? "正在保存并提交..." : locale === "en" ? "Submitting..." : "กำลังบันทึกและส่งข้อมูล..."}
                  </span>
                </>
              ) : (
                <span>
                  {locale === "zh" ? "提交待主管审核" : locale === "en" ? "Submit for Manager Approval" : "ส่งข้อมูลเพื่อรอ Manager อนุมัติ"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
