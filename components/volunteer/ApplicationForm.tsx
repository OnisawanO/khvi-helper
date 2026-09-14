"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationStatusModal } from "@/components/volunteer/ApplicationStatusModal";
import { getDisplayName, getMockUserSession } from "@/app/lib/mock-auth";
import { submitVolunteerApplication } from "@/app/lib/volunteer-application-store";

// 5 ภาษาหลักที่ระบุในโจทย์
const coreLanguages = [
  { id: "th", name: "ไทย (Thai)" },
  { id: "en", name: "อังกฤษ (English)" },
  { id: "zh", name: "จีน (Chinese)" },
  { id: "es", name: "สเปน (Spanish)" },
  { id: "ar", name: "อาหรับ (Arabic)" },
];

// รายการภาษาอื่น ๆ ทั่วโลกสำหรับ Multi-select ค้นหาและเลือกเพิ่ม
const globalLanguageCatalog = [
  { id: "my", name: "พม่า (Burmese)" },
  { id: "vi", name: "เวียดนาม (Vietnamese)" },
  { id: "ja", name: "ญี่ปุ่น (Japanese)" },
  { id: "ko", name: "เกาหลี (Korean)" },
  { id: "fr", name: "ฝรั่งเศส (French)" },
  { id: "de", name: "เยอรมัน (German)" },
  { id: "ru", name: "รัสเซีย (Russian)" },
  { id: "hi", name: "ฮินดี (Hindi)" },
  { id: "id", name: "อินโดนีเซีย (Indonesian)" },
  { id: "ms", name: "มาเลย์ (Malay)" },
  { id: "tl", name: "ตากาล็อก (Tagalog / Filipino)" },
  { id: "km", name: "เขมร (Khmer)" },
  { id: "lo", name: "ลาว (Lao)" },
  { id: "pt", name: "โปรตุเกส (Portuguese)" },
  { id: "it", name: "อิตาลี (Italian)" },
  { id: "tr", name: "ตุรกี (Turkish)" },
  { id: "fa", name: "เปอร์เซีย (Persian / Farsi)" },
  { id: "ur", name: "อูรดู (Urdu)" },
  { id: "bn", name: "เบงกอล (Bengali)" },
  { id: "sign", name: "ภาษามือไทย (Thai Sign Language - TSL)" },
  { id: "asl", name: "ภาษามืออเมริกัน (American Sign Language - ASL)" },
];

const availableCategories = [
  { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
  { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
  { id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" },
  { id: 3, name: "หน่วยงานราชการและตรวจคนเข้าเมือง (Government & Immigration)", icon: "🏛️" },
  { id: 4, name: "อุบัติเหตุและกู้ชีพฉุกเฉิน (Accidents & Emergency SOS)", icon: "🚨" },
  { id: 5, name: "การศึกษาและประสานงานสถาบัน (Education & Campus)", icon: "🎓" },
  { id: 6, name: "การท่องเที่ยวและการเดินทาง (Tourism & Transit)", icon: "✈️" },
  { id: 7, name: "การจ้างงานและสิทธิแรงงาน (Labour & Workplace Rights)", icon: "💼" },
  { id: 8, name: "ภัยพิบัติและการช่วยเหลือผู้ประสบภัย (Disaster Relief & Aid)", icon: "🌊" },
];

export function ApplicationForm() {
  // ค่าเริ่มต้นว่างไว้ทั้งหมด เพื่อให้เป็นหน้าที่ยังไม่มีใครใส่อะไรตามคำขอ
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [customLanguageInput, setCustomLanguageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [extraContact, setExtraContact] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [certificateFileName, setCertificateFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle ภาษาหลัก (ไทย, อังกฤษ, จีน, สเปน, อาหรับ) หรือภาษาที่เลือกแล้ว
  const toggleLang = (id: string) => {
    setSelectedLangs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // เพิ่มภาษาจาก Multi-select Dropdown
  const handleSelectAdditional = (id: string) => {
    if (!selectedLangs.includes(id)) {
      setSelectedLangs((prev) => [...prev, id]);
    }
    setSearchQuery("");
  };

  // เพิ่มภาษาเองอิสระในกรณีที่ต้องการระบุภาษาเฉพาะ (จากคำค้นหา)
  const handleAddCustomLanguage = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    const candidate = searchQuery.trim() || customLanguageInput.trim();
    if (candidate && !selectedLangs.includes(candidate)) {
      setSelectedLangs((prev) => [...prev, candidate]);
      setSearchQuery("");
      setCustomLanguageInput("");
      setIsDropdownOpen(false);
    }
  };

  const toggleCat = (id: number) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubmitting(true);
    // จำลองการส่งข้อมูลเข้าสู่ระบบ
    setTimeout(() => {
      const currentUser = getMockUserSession();
      if (currentUser?.role === "User") {
        submitVolunteerApplication({
          userId: currentUser.userId,
          applicantName: firstName && lastName ? `${firstName.trim()} ${lastName.trim()}` : getDisplayName(currentUser.name),
          phone: phone.trim() || currentUser.phone,
          extraContact: extraContact.trim(),
          languages: selectedLangs.map((id) => ({
            id,
            name: getLanguageLabel(id),
            type: id === "th" ? "Primary (ภาษาหลัก)" : "Fluent",
          })),
          categories: selectedCats.map((id) => {
            const category = availableCategories.find((item) => item.id === id);
            return { id, name: category?.name ?? `หมวด ${id}`, icon: category?.icon ?? "💬" };
          }),
          certificateFileName: certificateFileName || undefined,
          assignedArea: "กรุงเทพมหานครและปริมณฑล (Bangkok Metropolitan)",
        });
      }
      setIsSubmitting(false);
      setSubmitted(true);
      setIsModalOpen(true);
    }, 400);
  };

  // ดึงชื่อภาษาสำหรับแสดงผลใน Tags/Badges
  const getLanguageLabel = (id: string) => {
    const foundCore = coreLanguages.find((l) => l.id === id);
    if (foundCore) return foundCore.name;
    const foundCatalog = globalLanguageCatalog.find((l) => l.id === id);
    if (foundCatalog) return foundCatalog.name;
    return id; // ภาษาที่พิมพ์เพิ่มเอง
  };

  // กรองภาษาอื่น ๆ ใน Dropdown ตามคำค้นหา
  const filteredCatalog = globalLanguageCatalog.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && !selectedLangs.includes(lang.id);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitted && (
        <div className="border border-[#087f80] bg-[#edf7f5] p-5 text-[#087557] shadow-sm">
          <div className="flex items-center gap-2.5">
            <svg className="h-6 w-6 text-[#087f80] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <span className="font-extrabold text-sm block">บันทึกข้อมูลและส่งใบสมัครสำเร็จ!</span>
              <p className="mt-0.5 text-xs text-[#087557]/80">
                ระบบได้ส่งโปรไฟล์ของคุณเข้าคิวตรวจสอบของ Manager เรียบร้อยแล้ว เมื่อได้รับการอนุมัติจะสามารถเริ่มรับงานได้ทันที (BR-02)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Centered Form Sections */}
      <div className="space-y-6">
        {/* 1. Languages Selection */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="block text-sm font-extrabold text-[#10283a]">
              1. ภาษาที่สามารถให้บริการแปลได้ (interpreter_languages)
            </label>
            <span className="border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
              เลือกแล้ว {selectedLangs.length} ภาษา
            </span>
          </div>
          <p className="text-xs text-[#64777e] mb-4">
            เลือกภาษาหลัก 5 ภาษาด้านล่าง หรือใช้ตัวเลือก Multi-select เพื่อค้นหาและเพิ่มภาษาอื่น ๆ จากทุกภาษาทั่วโลก
          </p>

          {/* 5 ภาษาหลักตามโจทย์: ไทย, อังกฤษ, จีน, สเปน, อาหรับ */}
          <div className="mb-4">
            <span className="block text-xs font-bold text-[#10283a] mb-2 uppercase tracking-wide">
              ภาษาหลัก (Core Languages):
            </span>
            <div className="flex flex-wrap gap-2">
              {coreLanguages.map((lang) => {
                const isSelected = selectedLangs.includes(lang.id);
                return (
                  <button
                    type="button"
                    key={lang.id}
                    onClick={() => toggleLang(lang.id)}
                    className={`border px-3.5 py-2 text-xs font-bold transition-colors ${
                      isSelected
                        ? "border-[#087f80] bg-[#087f80] text-white"
                        : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                    }`}
                  >
                    <span>{isSelected ? "✓ " : "+ "}</span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-select ค้นหาและเลือกภาษาอื่นจากทั่วโลก */}
          <div className="border-t border-[#edf2f4] pt-4">
            <span className="block text-xs font-bold text-[#10283a] mb-2 uppercase tracking-wide">
              เพิ่มภาษาอื่น ๆ ทั่วโลก (Global Multi-Select):
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
                    placeholder="พิมพ์เพื่อค้นหาภาษาทั่วโลก (เช่น พม่า, ฝรั่งเศส, ญี่ปุ่น, ภาษามือ...)"
                    className="w-full border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
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
                  className="border border-[#c3d1d6] bg-[#f8fafb] px-3.5 py-2 text-xs font-bold text-[#39525d] hover:bg-[#edf3f1]"
                >
                  {isDropdownOpen ? "ปิดรายการ ▲" : "เลือกภาษา ▼"}
                </button>

                <button
                  type="button"
                  onClick={handleAddCustomLanguage}
                  className="border border-[#092f45] bg-[#092f45] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c4960] transition-colors shrink-0"
                  title="เพิ่มภาษาที่พิมพ์ในช่องค้นหา"
                >
                  + เพิ่ม
                </button>
              </div>

              {/* Dropdown Options List */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto border border-[#087f80] bg-white shadow-lg">
                  <div className="border-b border-[#edf2f4] bg-[#f8fafb] px-3 py-1.5 text-[11px] font-bold text-[#64777e] flex justify-between items-center">
                    <span>คลิกเพื่อเพิ่มภาษาที่ต้องการ ({filteredCatalog.length} ภาษา)</span>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[#087f80] font-bold hover:underline"
                    >
                      เสร็จสิ้น
                    </button>
                  </div>

                  {filteredCatalog.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#73848a]">
                      ไม่พบในแคตตาล็อก ท่านสามารถกดปุ่ม &quot;+ เพิ่ม&quot; ด้านบนเพื่อเพิ่มภาษานี้ได้ทันที
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f0f4f6]">
                      {filteredCatalog.map((lang) => (
                        <button
                          type="button"
                          key={lang.id}
                          onClick={() => handleSelectAdditional(lang.id)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-[#10283a] hover:bg-[#edf7f5] hover:text-[#087557] flex items-center justify-between transition-colors"
                        >
                          <span>{lang.name}</span>
                          <span className="text-[11px] font-mono text-[#087f80]">+ เพิ่ม</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Languages Chips Display */}
            {selectedLangs.length > 0 && (
              <div className="mt-4 border border-[#e2ebee] bg-[#f8fafb] p-3">
                <span className="block text-[11px] font-bold text-[#53656c] mb-2 uppercase tracking-wide">
                  ภาษาที่คุณเลือกให้บริการทั้งหมด ({selectedLangs.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLangs.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 border border-[#087f80] bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087557]"
                    >
                      <span>✓ {getLanguageLabel(id)}</span>
                      <button
                        type="button"
                        onClick={() => toggleLang(id)}
                        className="ml-1 text-[#087f80] hover:text-[#f04f3e] text-xs font-extrabold"
                        title="ลบภาษานี้"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-[#edf2f4] pt-3 text-xs text-[#64777e] flex items-center justify-between">
              <span>ภาษาหลักของระบบ (primary_language_id): <strong className="text-[#10283a]">ไทย (Thai)</strong></span>
              <span className="font-mono text-[11px] text-[#73848a]">Required</span>
            </div>
          </div>
        </div>

        {/* 2. Categories Selection */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="block text-sm font-extrabold text-[#10283a]">
              2. หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ (interpreter_categories)
            </label>
            <span className="border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-0.5 text-[11px] font-extrabold text-[#087f80]">
              เลือกแล้ว {selectedCats.length} หมวด
            </span>
          </div>
          <p className="text-xs text-[#64777e] mb-4">
            เลือกประเภทงานที่คุ้นเคยเพื่อช่วยเพิ่มความมั่นใจในการสื่อสารในสถานการณ์จริง
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableCategories.map((cat) => {
              const isSelected = selectedCats.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex cursor-pointer items-center gap-3 border p-3.5 text-xs font-semibold transition-colors select-none ${
                    isSelected
                      ? "border-[#087f80] bg-[#edf7f5] text-[#087557]"
                      : "border-[#d8e4e7] bg-white text-[#10283a] hover:border-[#087f80]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCat(cat.id)}
                    className="h-4 w-4 rounded-none accent-[#087f80]"
                  />
                  <span className="text-base">{cat.icon}</span>
                  <span className="leading-snug">{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Contact Information (Data Dictionary Compliant) */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm">
          <label className="block text-sm font-extrabold text-[#10283a] mb-1">
            3. ข้อมูลการติดต่อสำหรับการประสานงาน (Contact Details)
          </label>
          <p className="text-xs text-[#64777e] mb-4">
            ข้อมูลส่วนนี้จะถูกเปิดเผยเฉพาะผู้ขอความช่วยเหลือเมื่อคุณกดรับงาน (Claim) แล้วเท่านั้น ตามกฎความปลอดภัย BR-04
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5">
                  ชื่อจริง (First Name) <span className="text-[#f04f3e]">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  placeholder="เช่น ปกรณ์ (Pakorn)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5">
                  นามสกุล (Last Name) <span className="text-[#f04f3e]">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  placeholder="เช่น กิจเจริญชัย (Kitcharoenchai)"
                />
              </div>
            </div>
            <span className="-mt-2 block text-[11px] text-[#73848a]">
              ชื่อและนามสกุลจะรวมเป็น USER.name เพื่อแสดงบนหน้าโปรไฟล์และบัตรประจำตัวล่ามจิตอาสาเมื่อผ่านการอนุมัติ (BR-02)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5">
                  หมายเลขโทรศัพท์หลัก (USER.phone) <span className="text-[#f04f3e]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  placeholder="เช่น 081-234-5678"
                />
                <span className="mt-1 block text-[11px] text-[#73848a]">ใช้โทรติดต่อด่วนเมื่อเกิดเหตุฉุกเฉิน</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10283a] mb-1.5">
                  ช่องทางติดต่อสำรอง (extra_contact)
                </label>
                <input
                  type="text"
                  value={extraContact}
                  onChange={(e) => setExtraContact(e.target.value)}
                  className="w-full border border-[#c3d1d6] bg-white px-3.5 py-2.5 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
                  placeholder="เช่น LINE ID: @volunteer_id, WhatsApp"
                />
                <span className="mt-1 block text-[11px] text-[#73848a]">LINE ID, WhatsApp หรือ Telegram</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Certificate & Verification (INTERPRETER_APPLICATIONS: certificate_url) */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="block text-sm font-extrabold text-[#10283a]">
              4. เอกสารรับรองคุณวุฒิหรือทักษะทางภาษา (INTERPRETER_APPLICATIONS.certificate_url)
            </label>
            <span className="border border-[#b9d9d6] bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
              Manager Review Required
            </span>
          </div>
          <p className="text-xs text-[#64777e] mb-4">
            แนบไฟล์ใบประกาศนียบัตร, ผลสอบวัดระดับภาษา (เช่น HSK, JLPT, IELTS, ใบรับรองล่าม) เพื่อให้ Manager ตรวจสอบความถูกต้องก่อนอนุมัติ
          </p>

          <div className="space-y-4">
            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-[#c3d1d6] bg-[#f8fafb] p-5 text-center hover:border-[#087f80] transition-colors">
              <input
                type="file"
                id="cert-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCertificateFileName(file.name);
                    setCertificateUrl(`https://storage.khvi.org/certificates/${file.name}`);
                  }
                }}
              />
              <label htmlFor="cert-upload" className="cursor-pointer block">
                <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#8ed5c4] bg-white text-[#087f80] mb-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#087f80] hover:underline">
                  คลิกเพื่ออัปโหลดไฟล์เอกสาร (PDF, JPG, PNG)
                </span>
                <span className="mt-1 block text-[11px] text-[#73848a]">
                  ขนาดไฟล์ไม่เกิน 10 MB ต่อเอกสาร
                </span>
              </label>

              {certificateFileName && (
                <div className="mt-3 inline-flex items-center gap-2 border border-[#8ed5c4] bg-[#edf7f5] px-3 py-1.5 text-xs font-bold text-[#087557]">
                  <span>📄 {certificateFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCertificateFileName("");
                      setCertificateUrl("");
                    }}
                    className="text-[#f04f3e] hover:underline font-extrabold ml-1"
                  >
                    ✕ นำออก
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Verification & Privacy Shield Callout */}
        <div className="border border-[#b9d9d6] bg-[#edf7f5] p-5 text-xs text-[#10283a] shadow-sm flex items-start gap-3">
          <span className="text-base font-bold text-[#087557] shrink-0">✓</span>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[#087557]">
              มาตรฐานความปลอดภัยและสิทธิ์การรับงาน (BR-02, BR-03, BR-04)
            </h4>
            <p className="leading-relaxed text-[#53656c]">
              แบบฟอร์มนี้ตรงตาม Data Dictionary 100% โดยไม่มีฟิลด์ส่วนเกิน ข้อมูลติดต่อและพิกัดละเอียดจะถูกปกปิดไว้จนกว่าคุณจะกด Claim งานสำเร็จ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-bold text-[#64777e] hover:text-[#10283a] transition-colors"
            >
              ← ยกเลิกและกลับสู่หน้าหลัก
            </Link>
            <span className="text-[#d8e4e7]">|</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 border border-[#c3d1d6] bg-white px-3 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#edf7f5] transition-colors"
            >
              <span>🔍 ดูหน้าต่างสถานะใบสมัคร</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-[#092f45] bg-[#092f45] px-8 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#0c4960] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "กำลังส่งข้อมูล..." : "บันทึกข้อมูลและส่งใบสมัคร"}
          </button>
        </div>
      </div>

      {/* Application Status Modal Popup Window */}
      <ApplicationStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          applicationId: "APP-2026-0913-048",
          applicantName: firstName && lastName ? `${firstName} ${lastName}` : "ปกรณ์ กิจเจริญชัย (Pakorn Kitcharoenchai)",
          phone: phone || "081-234-5678",
          extraContact: extraContact || "@volunteer_contact (LINE ID)",
          languages: selectedLangs.map((id) => ({
            id,
            name: getLanguageLabel(id),
            type: id === "th" ? "Primary (ภาษาหลัก)" : "Fluent",
          })),
          categories: selectedCats.map((id) => {
            const found = availableCategories.find((c) => c.id === id);
            return {
              id,
              name: found ? found.name : `หมวด ${id}`,
              icon: found ? found.icon : "💬",
            };
          }),
          certificateFileName: certificateFileName
            ? `${certificateFileName}${certificateUrl ? ` (${certificateUrl})` : ""}`
            : "hsk5_and_ielts_certificate.pdf",
          submittedAt: "เพิ่งยื่นส่ง (Just now)",
          estimatedReviewTime: "ภายใน 24 ชั่วโมง",
          assignedArea: "กรุงเทพมหานครและปริมณฑล (Bangkok Metropolitan)",
        }}
      />
    </form>
  );
}
