"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useUiLocale } from "@/app/components/app-shell";
import {
  submitInterpreterApplicationAction,
  uploadInterpreterCertificateAction,
} from "@/app/actions/interpreter-application-actions";
import {
  type InterpreterApplicationReference,
  sortCategoriesByPriority,
} from "@/app/lib/interpreter-reference-catalog";
import {
  type ContactChannelType,
  CHANNEL_DEFS,
  formatContactChannelValue,
} from "@/components/volunteer/ApplicationForm";
import { calculateAge } from "@/app/lib/auth-types";
import { authApi } from "@/app/lib/auth-client";

export function CombinedInterpreterRegisterForm({
  availableLanguages: initialLanguages = [],
  availableCategories: initialCategories = [],
}: {
  availableLanguages?: InterpreterApplicationReference[];
  availableCategories?: InterpreterApplicationReference[];
}) {
  const availableLanguages = initialLanguages;
  const availableCategories = sortCategoriesByPriority(initialCategories);
  const locale = useUiLocale();
  const router = useRouter();

  // 1. Account Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactChannelType, setContactChannelType] = useState<ContactChannelType>("line");
  const [contactValue, setContactValue] = useState("");
  const [customChannelName, setCustomChannelName] = useState("");

  // 2. Interpreter Qualifications
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateFileName, setCertificateFileName] = useState("");

  // Submission & Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

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

  // Triggered when clicking "บันทึกและส่งใบสมัคร" -> Validate and Open Confirmation Modal
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validate Account fields
    if (!email.trim() || !password || !confirmPassword || !firstName.trim() || !lastName.trim() || !phone.trim() || !dateOfBirth) {
      setSubmitError(
        locale === "th"
          ? "กรุณากรอกข้อมูลบัญชีผู้ใช้ให้ครบถ้วน (อีเมล, รหัสผ่าน, ชื่อ-นามสกุล, เบอร์โทร และวันเกิด)"
          : locale === "zh"
            ? "请完整填写账户信息（邮箱、密码、姓名、电话和出生日期）"
            : "Please fill in all required account fields (email, password, name, phone, and date of birth)."
      );
      return;
    }

    if (password.length < 8) {
      setSubmitError(
        locale === "th"
          ? "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
          : locale === "zh"
            ? "密码长度至少为 8 位"
            : "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError(
        locale === "th"
          ? "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน"
          : locale === "zh"
            ? "两次输入的密码不一致"
            : "Passwords do not match."
      );
      return;
    }

    const englishNameRegex = /^[A-Za-z\s\-']+$/;
    if (!englishNameRegex.test(firstName.trim()) || !englishNameRegex.test(lastName.trim())) {
      setSubmitError(
        locale === "th"
          ? "กรุณากรอกชื่อจริงและนามสกุลเป็นภาษาอังกฤษเท่านั้น (English letters only)"
          : locale === "zh"
            ? "请仅使用英文字母填写姓名 (English letters only)"
            : "Please enter first and last name in English letters only."
      );
      return;
    }

    // Validate Volunteer fields
    if (!selectedLangs.length || !selectedCats.length || !certificateFileName || !certificateFile) {
      setSubmitError(
        locale === "th"
          ? "กรุณาเลือกภาษาที่ให้บริการ เลือกหมวดหมู่งาน และแนบเอกสารรับรองคุณวุฒิให้ครบถ้วน"
          : locale === "zh"
            ? "请选择服务语言、服务类别并附上资质证明文件"
            : "Please select languages, mission categories, and attach a credential document."
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
      // Step 1: Sign up user account via Route Handler to ensure server cookies are properly established
      const registerResult = await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        phone: phone.trim(),
        dateOfBirth,
        preferredUiLanguage: locale,
      });

      if (!registerResult.ok) {
        // If the account might already exist with this password, try signing in
        const loginResult = await authApi.login({
          email: email.trim().toLowerCase(),
          password,
          locale,
        });
        if (!loginResult.ok) {
          setSubmitError(registerResult.error.message);
          setShowConfirmModal(false);
          return;
        }
      }

      // Step 2: Upload interpreter certificate
      if (!certificateFile) {
        setSubmitError(
          locale === "th"
            ? "กรุณาแนบไฟล์เอกสารรับรองก่อนส่งใบสมัคร"
            : locale === "zh"
              ? "请在提交前附上资质证明文件"
              : "Please attach credential file before submitting."
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

      // Step 3: Submit interpreter application
      const result = await submitInterpreterApplicationAction({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
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
            ? "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง"
            : "An error occurred during registration. Please try again."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOpenConfirmModal} className="space-y-8">
        {submitError && (
          <div className="rounded-(--khvi-radius-sm) border border-[#f04f3e] bg-[#fff1f2] p-4 text-sm font-bold text-[#b8291b]" role="alert">
            {submitError}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION A: USER ACCOUNT REGISTRATION (ด้านบน)                             */}
        {/* ========================================================================= */}
        <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#edf2f4] pb-4 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087f80] text-sm font-extrabold text-white">
              1
            </span>
            <div>
              <h2 className="text-lg font-black text-[#10283a]">
                {locale === "th"
                  ? "ข้อมูลบัญชีผู้ใช้ (Account Registration)"
                  : locale === "zh"
                    ? "账户注册信息 (Account Registration)"
                    : "User Account Registration"}
              </h2>
              <p className="text-xs text-[#64777e]">
                {locale === "th"
                  ? "ข้อมูลสำหรับการเข้าสู่ระบบและสร้างโปรไฟล์ล่ามจิตอาสาของคุณ"
                  : locale === "zh"
                    ? "用于登录系统及生成志愿口译员资料的基本信息"
                    : "Information for signing in and creating your volunteer profile."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-email">
                {locale === "th" ? "อีเมล (Email) " : locale === "zh" ? "电子邮箱 (Email) " : "Email "}
                <span className="text-[#f04f3e]">*</span>
              </label>
              <div className="relative">
                <input
                  id="combined-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="volunteer@example.com"
                  className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                />
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-password">
                  {locale === "th" ? "รหัสผ่าน (Password) " : locale === "zh" ? "密码 (Password) " : "Password "}
                  <span className="text-[#f04f3e]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="combined-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-10 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73848a] hover:text-[#10283a]"
                  >
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <span className="mt-1 block text-[11px] text-[#73848a]">
                  {locale === "th" ? "ความยาวอย่างน้อย 8 ตัวอักษร" : locale === "zh" ? "至少 8 位字符" : "At least 8 characters"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-confirm-password">
                  {locale === "th" ? "ยืนยันรหัสผ่าน " : locale === "zh" ? "确认密码 " : "Confirm Password "}
                  <span className="text-[#f04f3e]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="combined-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-10 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73848a] hover:text-[#10283a]"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* First Name & Last Name (English only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-first-name">
                  {locale === "th" ? "ชื่อจริง (First Name) " : locale === "zh" ? "名 (First Name) " : "First Name "}
                  <span className="text-[#f04f3e]">*</span>
                  <span className="ml-1 text-[11px] font-normal text-[#64777e]">
                    {locale === "th" ? "(ภาษาอังกฤษเท่านั้น)" : locale === "zh" ? "(仅限英文)" : "(English only)"}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="combined-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      const englishOnly = e.target.value.replace(/[^a-zA-Z\s\-']/g, "");
                      setFirstName(englishOnly);
                    }}
                    required
                    pattern="[A-Za-z\s\-']+"
                    placeholder="e.g. Somsak"
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-last-name">
                  {locale === "th" ? "นามสกุล (Last Name) " : locale === "zh" ? "姓 (Last Name) " : "Last Name "}
                  <span className="text-[#f04f3e]">*</span>
                  <span className="ml-1 text-[11px] font-normal text-[#64777e]">
                    {locale === "th" ? "(ภาษาอังกฤษเท่านั้น)" : locale === "zh" ? "(仅限英文)" : "(English only)"}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="combined-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      const englishOnly = e.target.value.replace(/[^a-zA-Z\s\-']/g, "");
                      setLastName(englishOnly);
                    }}
                    required
                    pattern="[A-Za-z\s\-']+"
                    placeholder="e.g. Jaidee"
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                </div>
              </div>
            </div>

            <span className="-mt-2 block text-[11px] text-[#73848a]">
              {locale === "th"
                ? "ชื่อและนามสกุลภาษาอังกฤษจะใช้แสดงบนหน้าโปรไฟล์และบัตรประจำตัวล่ามจิตอาสาเมื่อผ่านการอนุมัติ (BR-02)"
                : locale === "zh"
                  ? "英文姓名将在审核通过后显示于个人资料及志愿口译员证上 (BR-02)"
                  : "English full name will be displayed on your profile and volunteer ID badge once approved (BR-02)."}
            </span>

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-phone">
                  {locale === "th" ? "หมายเลขโทรศัพท์หลัก " : locale === "zh" ? "主要联系电话 " : "Primary Phone "}
                  <span className="text-[#f04f3e]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="combined-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="080-XXX-XXXX"
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                </div>
                <span className="mt-1 block text-[11px] text-[#73848a]">
                  {locale === "th" ? "ใช้สำหรับติดต่อฉุกเฉินเมื่อรับภารกิจ" : locale === "zh" ? "用于接单时的紧急联络" : "Used for emergency coordination"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5" htmlFor="combined-dob">
                  {locale === "th" ? "วันเกิด (Date of birth) " : locale === "zh" ? "出生日期 " : "Date of birth "}
                  <span className="text-[#f04f3e]">*</span>
                  {calculatedAge !== null && (
                    <span className="ml-2 font-extrabold text-[#087f80]">
                      ({locale === "th" ? `อายุ ${calculatedAge} ปี` : locale === "zh" ? `年龄 ${calculatedAge} 岁` : `Age ${calculatedAge}`})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="combined-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white pl-9 pr-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  />
                  <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" />
                </div>
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
                      className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3 py-2.5 text-xs font-bold text-[#10283a] focus:border-[#087f80] focus:outline-none cursor-pointer"
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
                        className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
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
                      className="w-full rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
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
        </div>

        {/* ========================================================================= */}
        {/* SECTION B: VOLUNTEER INTERPRETER APPLICATION (ด้านล่าง)                   */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* 1. Languages Selection */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-[#edf2f4] pb-4 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087f80] text-sm font-extrabold text-white">
                2
              </span>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#10283a]">
                    {locale === "th"
                      ? "ภาษาที่สามารถให้บริการแปลได้"
                      : locale === "zh"
                        ? "可提供翻译的语言"
                        : "Languages for Interpretation"}
                  </h2>
                  <p className="text-xs text-[#64777e]">
                    {locale === "th"
                      ? "เลือกภาษาหลัก 5 ภาษา หรือค้นหาเพิ่มจากภาษาทั่วโลก"
                      : locale === "zh"
                        ? "选择 5 种核心语言，或搜索添加全球其他语言"
                        : "Select from the 5 core languages or search other languages globally."}
                  </p>
                </div>
                <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  {locale === "th"
                    ? `เลือกแล้ว ${selectedLangs.length} ภาษา`
                    : locale === "zh"
                      ? `已选 ${selectedLangs.length} 种语言`
                      : `${selectedLangs.length} selected`}
                </span>
              </div>
            </div>

            {/* Core Languages */}
            <div className="mb-4">
              <span className="block text-xs font-bold text-[#10283a] mb-2 uppercase tracking-wide">
                {locale === "th" ? "ภาษาหลัก:" : locale === "zh" ? "核心语言:" : "Core Languages:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {coreLanguages.map((lang) => {
                  const isSelected = selectedLangs.includes(lang.id);
                  return (
                    <button
                      type="button"
                      key={lang.id}
                      onClick={() => toggleLang(lang.id)}
                      className={`rounded-(--khvi-radius-sm) border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
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

            {/* Global Multi-Select Search */}
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#73848a] hover:text-[#10283a] cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="rounded-(--khvi-radius-sm) border border-[#c3d1d6] bg-[#f8fafb] px-3.5 py-2 text-xs font-bold text-[#39525d] hover:bg-[#edf3f1] cursor-pointer"
                  >
                    {isDropdownOpen
                      ? locale === "th" ? "ปิดรายการ ▲" : locale === "zh" ? "收起 ▲" : "Close ▲"
                      : locale === "th" ? "เลือกภาษา ▼" : locale === "zh" ? "选择语言 ▼" : "Select language ▼"}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    className="rounded-(--khvi-radius-sm) border border-[#092f45] bg-[#092f45] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c4960] transition-colors shrink-0 cursor-pointer"
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
                    ? "ภาษาหลักของระบบ: "
                    : locale === "zh"
                      ? "系统主要语言: "
                      : "System primary language: "}
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
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-[#edf2f4] pb-4 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087f80] text-sm font-extrabold text-white">
                3
              </span>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#10283a]">
                    {locale === "th"
                      ? "หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ"
                      : locale === "zh"
                        ? "志愿服务任务类别"
                        : "Mission Categories"}
                  </h2>
                  <p className="text-xs text-[#64777e]">
                    {locale === "th"
                      ? "เลือกประเภทงานที่คุ้นเคยเพื่อช่วยเพิ่มความมั่นใจในการสื่อสารในสถานการณ์จริง"
                      : locale === "zh"
                        ? "选择您熟悉的任务类别，以便在实际情境中更自信地提供沟通协助"
                        : "Select categories you are comfortable with to ensure effective communication."}
                  </p>
                </div>
                <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  {locale === "th"
                    ? `เลือกแล้ว ${selectedCats.length} หมวด`
                    : locale === "zh"
                      ? `已选 ${selectedCats.length} 类`
                      : `${selectedCats.length} selected`}
                </span>
              </div>
            </div>

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

          {/* 3. Certificate & Verification */}
          <div className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-[#edf2f4] pb-4 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087f80] text-sm font-extrabold text-white">
                4
              </span>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#10283a]">
                    {locale === "th"
                      ? "เอกสารรับรองคุณวุฒิหรือทักษะทางภาษา (Certificate / Qualification)"
                      : locale === "zh"
                        ? "资质或语言能力证明 (Certificate / Qualification)"
                        : "Language Credential or Certificate"}
                  </h2>
                  <p className="text-xs text-[#64777e]">
                    {locale === "th"
                      ? "แนบไฟล์ใบประกาศนียบัตร หรือผลสอบวัดระดับภาษา (เช่น HSK, JLPT, IELTS, ใบรับรองล่าม)"
                      : locale === "zh"
                        ? "上传证书、语言等级考试成绩单（例如 HSK、JLPT、IELTS、口译证书等）"
                        : "Attach diplomas or proficiency test certificates for Manager review."}
                  </p>
                </div>
                <span className="rounded-(--khvi-radius-sm) border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  {locale === "th" ? "ต้องผ่านการตรวจสอบโดย Manager" : locale === "zh" ? "需管理员审核" : "Manager Review Required"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                id="combined-cert-upload"
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
                htmlFor="combined-cert-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-(--khvi-radius-sm) border border-[#087f80] bg-[#087f80] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0c6b6c]"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-[#cbd7dc] bg-white px-5 py-2.5 text-sm font-bold text-[#53656c] hover:bg-[#f4f7f8] hover:text-[#10283a] transition-colors"
            >
              {locale === "th"
                ? "← ยกเลิกสมัครเพื่อออกและกลับสู่หน้าหลัก"
                : locale === "zh"
                  ? "← 取消申请并返回首页"
                  : "← Cancel and return home"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-(--khvi-radius-sm) border border-[#092f45] bg-[#092f45] px-8 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#0c4960] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {locale === "th"
                ? "บันทึกข้อมูลและส่งใบสมัครล่าม"
                : locale === "zh"
                  ? "保存信息并提交口译申请"
                  : "Save and submit interpreter application"}
            </button>
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL                                                        */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[0_24px_56px_rgba(15,38,54,0.25)] space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#eef3f5] pb-3">
              <div>
                <span className="inline-block rounded-full bg-[#edf7f5] px-2.5 py-0.5 text-[10px] font-extrabold text-[#087f80] uppercase tracking-wider mb-1">
                  {locale === "th" ? "ตรวจสอบความถูกต้องก่อนส่ง" : locale === "zh" ? "提交前核对信息" : "Review details before submitting"}
                </span>
                <h3 className="text-lg font-extrabold text-[#10283a]">
                  {locale === "th"
                    ? "ยืนยันการลงทะเบียนและสมัครล่ามจิตอาสา"
                    : locale === "zh"
                      ? "确认注册并提交志愿口译员申请"
                      : "Confirm Registration & Volunteer Interpreter Application"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-1 text-[#6c8591] hover:bg-[#edf3f6] hover:text-[#112d3e] transition-colors cursor-pointer"
                title={locale === "th" ? "ปิด" : locale === "zh" ? "关闭" : "Close"}
              >
                ✕
              </button>
            </div>

            {/* Summary Information Grid */}
            <div className="space-y-3.5 text-xs text-[#2b4857] max-h-[60vh] overflow-y-auto pr-1">
              {/* Account Summary */}
              <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-3.5 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th" ? "ข้อมูลบัญชีผู้ใช้และการติดต่อ" : locale === "zh" ? "账户与个人联络信息" : "Account & Contact info"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#7d939f] block">Email:</span>
                    <strong className="text-[#10283a]">{email}</strong>
                  </div>
                  <div>
                    <span className="text-[#7d939f] block">
                      {locale === "th" ? "ชื่อ-นามสกุล (อังกฤษ):" : locale === "zh" ? "姓名（英文）:" : "Name (English):"}
                    </span>
                    <strong className="text-[#10283a]">{firstName} {lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[#7d939f] block">
                      {locale === "th" ? "หมายเลขโทรศัพท์:" : locale === "zh" ? "电话号码:" : "Phone number:"}
                    </span>
                    <strong className="text-[#10283a]">{phone}</strong>
                  </div>
                  <div>
                    <span className="text-[#7d939f] block">
                      {locale === "th" ? "วันเกิด / อายุ:" : locale === "zh" ? "出生日期 / 年龄:" : "Date of birth / Age:"}
                    </span>
                    <strong className="text-[#10283a]">{dateOfBirth} ({calculatedAge} {locale === "th" ? "ปี" : locale === "zh" ? "岁" : "years"})</strong>
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
                  {locale === "th" ? "เอกสารรับรองที่แนบ" : locale === "zh" ? "所附资质证明" : "Attached credential document"}
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
                href="/"
                className="rounded-(--khvi-radius-sm) px-2.5 py-1.5 text-xs font-bold text-[#b8291b] hover:bg-[#fff1f2] hover:underline transition-colors"
              >
                {locale === "th" ? "ยกเลิกสมัครและกลับหน้าหลัก" : locale === "zh" ? "取消并返回首页" : "Cancel and return home"}
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
                      <span>{locale === "th" ? "กำลังสร้างบัญชีและส่งข้อมูล..." : locale === "zh" ? "正在创建账户并提交..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <span>{locale === "th" ? "✓ ยืนยันและส่งใบสมัครล่าม" : locale === "zh" ? "✓ 确认并提交口译申请" : "✓ Confirm and submit"}</span>
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

