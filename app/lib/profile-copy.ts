import type { Locale } from "@/app/components/site-header";
import type { WorkspaceRole } from "@/app/components/app-shell";

export type ProfileCopy = {
  loading: string;
  breadcrumbAria: string;
  breadcrumbCurrent: string;
  roleConfig: Record<
    WorkspaceRole,
    {
      eyebrow: string;
      title: string;
      description: string;
      badge: string;
      homeLabel: string;
      note: string;
    }
  >;
  rail: {
    personalDetails: string;
    roleSettings: string;
    deleteAccount: string;
    accountPrivacy: string;
    roleLabels: Record<WorkspaceRole, string>;
  };
  personalDetails: {
    eyebrow: string;
    title: string;
    description: string;
    privateBadge: string;
    firstName: string;
    lastName: string;
    email: string;
    emailHint: string;
    phone: string;
    dateOfBirth: string;
    preferredUiLanguage: string;
    languageHint: string;
    footerNote: string;
    saved: string;
    saveChanges: string;
    errors: {
      firstName: string;
      lastName: string;
      phone: string;
      dateOfBirth: string;
    };
  };
  accountDeletion: {
    eyebrow: string;
    title: string;
    description: string;
    notice: string;
    cannotUndo: string;
    migrationPending: string;
    deleteButton: string;
    modalEyebrow: string;
    modalTitle: string;
    modalCloseAria: string;
    modalDescription: string;
    migrationWarning: string;
    checkboxLabel: string;
    cancelButton: string;
    confirmButton: string;
    deleting: string;
  };
  photo: {
    title: string;
    description: string;
    processing: string;
    changePhoto: string;
    removePhoto: string;
    photoUpdated: string;
    photoRemoved: string;
    invalidType: string;
    sizeTooLarge: string;
    readError: string;
    cropTitle: string;
    cropEyebrow: string;
    cropDescription: string;
    cropCloseAria: string;
    cropZoom: string;
    cropCancel: string;
    cropSaving: string;
    cropConfirm: string;
    cropError: string;
  };
  roleSettings: {
    eyebrow: string;
    title: string;
    description: string;
    statusActive: string;
    statusApproved: string;
    statusNormal: string;
    user: {
      requestHistoryTitle: string;
      requestHistoryDesc: string;
      requestHistoryLink: string;
      privacyTitle: string;
      privacyDesc: string;
      metricOpen: string;
      metricCompleted: string;
      metricStatus: string;
    };
    interpreter: {
      metricApproval: string;
      metricRadius: string;
      metricMissions: string;
      metricScore: string;
      serviceLanguagesTitle: string;
      serviceLanguagesDesc: string;
      matchingCategoriesTitle: string;
      matchingCategoriesDesc: string;
      searchPrefsTitle: string;
      searchPrefsDesc: string;
      searchPrefsLink: string;
      assignmentHistoryTitle: string;
      assignmentHistoryDesc: string;
      assignmentHistoryLink: string;
      minOneLanguage: string;
      minTwoCategories: string;
      skillCardHint: (minimumLabel: string) => string;
      placeholder: string;
      add: string;
      removeAria: (label: string) => string;
      langAdded: string;
      langRemoved: string;
      catAdded: string;
      catRemoved: string;
      keepOneLang: string;
      keepTwoCats: string;
    };
    manager: {
      metricPending: string;
      metricOpenRequests: string;
      metricStatus: string;
      applicationsTitle: string;
      applicationsDesc: string;
      applicationsLink: string;
      auditTitle: string;
      auditDesc: string;
      chips: [string, string, string];
      notice: string;
    };
    admin: {
      metricStatus: string;
      metricStaff: string;
      metricAudit: string;
      usersTitle: string;
      usersDesc: string;
      usersLink: string;
      securityTitle: string;
      securityDesc: string;
      chips: [string, string, string];
      notice: string;
    };
  };
};

const copyTh: ProfileCopy = {
  loading: "กำลังโหลดโปรไฟล์ของคุณ…",
  breadcrumbAria: "แถบนำทางโปรไฟล์",
  breadcrumbCurrent: "โปรไฟล์และการตั้งค่า",
  roleConfig: {
    User: {
      eyebrow: "โปรไฟล์ผู้ขอรับความช่วยเหลือ",
      title: "โปรไฟล์และการตั้งค่า",
      description: "เตรียมข้อมูลความช่วยเหลือทางภาษาของคุณให้พร้อมก่อนเริ่มขอรับบริการ",
      badge: "ผู้ขอรับบริการ",
      homeLabel: "พื้นที่ทำงาน",
      note: "ข้อมูลติดต่อของคุณจะยังคงเป็นส่วนตัว จนกว่าระบบจะเข้าสู่ขั้นตอนที่จำเป็นต้องแชร์",
    },
    Interpreter: {
      eyebrow: "โปรไฟล์ล่ามจิตอาสา",
      title: "โปรไฟล์และการตั้งค่า",
      description: "อัปเดตทักษะภาษาที่ผ่านการรับรองและหมวดหมู่งานที่พร้อมรับให้เป็นปัจจุบัน",
      badge: "ล่ามที่ผ่านการอนุมัติ",
      homeLabel: "พื้นที่ทำงาน",
      note: "เฉพาะภาษาและหมวดหมู่ที่ได้รับการอนุมัติเท่านั้นที่จะนำมาจับคู่กับคำขอความช่วยเหลือ",
    },
    Manager: {
      eyebrow: "โปรไฟล์ผู้จัดการระบบ",
      title: "โปรไฟล์และการตั้งค่า",
      description: "ตรวจสอบข้อมูลส่วนบุคคลและสิทธิ์การดำเนินงานของคุณในที่เดียว",
      badge: "ผู้จัดการการดำเนินงาน",
      homeLabel: "คอนโซลผู้จัดการ",
      note: "สิทธิ์ของผู้จัดการได้รับมอบหมายจากระบบ ไม่สามารถแก้ไขได้จากหน้าโปรไฟล์",
    },
    Admin: {
      eyebrow: "โปรไฟล์ผู้ดูแลระบบ",
      title: "โปรไฟล์และการตั้งค่า",
      description: "จัดการข้อมูลส่วนตัว พร้อมดูแลการตั้งค่าความปลอดภัยของระบบ",
      badge: "ผู้ดูแลระบบ",
      homeLabel: "แดชบอร์ดผู้ดูแลระบบ",
      note: "บทบาท สถานะบัญชี และสิทธิ์ในระบบได้รับการปกป้องและจัดการผ่านเครื่องมือ Admin",
    },
  },
  rail: {
    personalDetails: "ข้อมูลส่วนตัว",
    roleSettings: "การตั้งค่าบทบาท",
    deleteAccount: "ลบบัญชีผู้ใช้",
    accountPrivacy: "ความเป็นส่วนตัวของบัญชี",
    roleLabels: {
      User: "ผู้ขอรับบริการ",
      Interpreter: "ล่ามจิตอาสา",
      Manager: "ผู้จัดการระบบ",
      Admin: "ผู้ดูแลระบบ",
    },
  },
  personalDetails: {
    eyebrow: "บัญชีผู้ใช้",
    title: "ข้อมูลส่วนตัว",
    description: "รายละเอียดเหล่านี้เป็นของบัญชีคุณและสามารถแก้ไขได้โดยตรง",
    privateBadge: "ข้อมูลส่วนตัวเฉพาะบัญชีของคุณ",
    firstName: "ชื่อจริง",
    lastName: "นามสกุล",
    email: "ที่อยู่อีเมล",
    emailHint: "จัดการโดยระบบบัญชี",
    phone: "เบอร์โทรศัพท์",
    dateOfBirth: "วันเดือนปีเกิด",
    preferredUiLanguage: "ภาษาที่ต้องการใช้งาน",
    languageHint: "ใช้สำหรับแสดงผลหน้าจอ",
    footerNote: "อีเมล บทบาท และสถานะบัญชีเป็นข้อมูลระบบที่ได้รับการปกป้อง",
    saved: "บันทึกเรียบร้อย",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    errors: {
      firstName: "กรุณากรอกชื่อจริง",
      lastName: "กรุณากรอกนามสกุล",
      phone: "กรุณากรอกเบอร์โทรศัพท์ไทยที่ถูกต้อง (เช่น 0812345678)",
      dateOfBirth: "กรุณาเลือกวันเดือนปีเกิด",
    },
  },
  accountDeletion: {
    eyebrow: "ความปลอดภัยของบัญชี",
    title: "ลบบัญชีผู้ใช้",
    description:
      "ปิดบัญชีและออกจากระบบ ประวัติงานที่เสร็จสิ้นแล้วจะยังคงอยู่เพื่อเป็นหลักฐานการให้บริการ แต่ข้อมูลติดต่อส่วนบุคคลจะถูกลบออก",
    notice: "คำขอหรือภารกิจที่ดำเนินการอยู่ต้องเสร็จสิ้นหรือถูกยกเลิกก่อนจึงจะสามารถลบบัญชีได้",
    cannotUndo: " การดำเนินการนี้ไม่สามารถยกเลิกได้",
    migrationPending: " ฟังก์ชันนี้จะพร้อมใช้งานหลังจากอัปเดตระบบฐานข้อมูล",
    deleteButton: "ลบบัญชีผู้ใช้",
    modalEyebrow: "โปรดยืนยัน",
    modalTitle: "คุณต้องการลบบัญชีผู้ใช้หรือไม่?",
    modalCloseAria: "ปิดหน้าต่างยืนยันการลบบัญชี",
    modalDescription:
      "เซสชันของคุณจะสิ้นสุดทันที ประวัติภารกิจที่เสร็จสิ้นจะยังคงอยู่ในระบบโดยไม่มีข้อมูลติดต่อส่วนตัว คุณจะไม่สามารถกู้คืนบัญชีนี้ได้อีก",
    migrationWarning: "ยังไม่สามารถลบบัญชีได้จนกว่าจะอัปเดตระบบฐานข้อมูลล่าสุด",
    checkboxLabel: "ฉันเข้าใจว่าบัญชีนี้จะถูกปิดและจะออกจากระบบทันที",
    cancelButton: "เก็บบัญชีไว้",
    confirmButton: "ยืนยันการลบบัญชี",
    deleting: "กำลังลบ…",
  },
  photo: {
    title: "รูปโปรไฟล์",
    description: "เลือกรูปภาพที่ชัดเจน และครอบตัดให้อยู่ในกรอบสี่เหลี่ยมก่อนบันทึก",
    processing: "กำลังประมวลผล…",
    changePhoto: "เปลี่ยนรูปโปรไฟล์",
    removePhoto: "ลบรูปโปรไฟล์",
    photoUpdated: "อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว",
    photoRemoved: "ลบรูปโปรไฟล์แล้ว",
    invalidType: "กรุณาเลือกไฟล์ภาพ JPG, PNG หรือ WEBP",
    sizeTooLarge: "ขนาดไฟล์ภาพต้องไม่เกิน 5 MB",
    readError: "ไม่สามารถอ่านไฟล์ภาพได้ กรุณาใช้ไฟล์อื่น",
    cropTitle: "ครอบตัดรูปโปรไฟล์",
    cropEyebrow: "รูปโปรไฟล์",
    cropDescription: "ลากรูปภาพเพื่อจัดตำแหน่งให้อยู่ภายในกรอบสี่เหลี่ยม",
    cropCloseAria: "ปิดหน้าต่างครอบตัดรูป",
    cropZoom: "ซูม",
    cropCancel: "ยกเลิก",
    cropSaving: "กำลังบันทึก…",
    cropConfirm: "ใช้รูปภาพนี้",
    cropError: "ไม่สามารถบันทึกรูปภาพที่ครอบตัดได้ กรุณาลองใหม่",
  },
  roleSettings: {
    eyebrow: "พื้นที่ทำงาน",
    title: "การตั้งค่าบทบาท",
    description: "ภาพรวมเครื่องมือและการตั้งค่าที่เกี่ยวข้องกับบทบาทของคุณ",
    statusActive: "ใช้งานอยู่",
    statusApproved: "อนุมัติแล้ว",
    statusNormal: "ปกติ",
    user: {
      requestHistoryTitle: "ประวัติคำขอ",
      requestHistoryDesc: "ติดตามคำขอความช่วยเหลือที่คุณสร้างและขั้นตอนถัดไปของแต่ละงาน",
      requestHistoryLink: "ดูคำขอของฉัน",
      privacyTitle: "ความเป็นส่วนตัวและความปลอดภัย",
      privacyDesc: "ข้อมูลติดต่อที่ละเอียดอ่อนจะยังคงซ่อนไว้จนกว่าขั้นตอนการจับคู่จะยืนยันอย่างถูกต้อง",
      metricOpen: "คำขอที่เปิดอยู่",
      metricCompleted: "คำขอที่เสร็จสิ้น",
      metricStatus: "สถานะบัญชี",
    },
    interpreter: {
      metricApproval: "สถานะการอนุมัติ",
      metricRadius: "รัศมีให้บริการ",
      metricMissions: "ภารกิจที่เสร็จสิ้น",
      metricScore: "คะแนนเฉลี่ย",
      serviceLanguagesTitle: "ภาษาที่ให้บริการ",
      serviceLanguagesDesc: "ภาษาที่คุณพร้อมช่วยเหลือในระหว่างภารกิจ",
      matchingCategoriesTitle: "หมวดหมู่งานที่รับ",
      matchingCategoriesDesc: "หมวดหมู่ที่ใช้จับคู่กับคำขอความช่วยเหลือ",
      searchPrefsTitle: "การตั้งค่าการค้นหา",
      searchPrefsDesc: "แผนที่คำขอใช้รัศมีจับคู่ 25 กม. และพิกัด GPS จากเบราว์เซอร์เมื่อได้รับอนุญาต",
      searchPrefsLink: "เปิดหน้าค้นหาคำขอ",
      assignmentHistoryTitle: "ประวัติภารกิจ",
      assignmentHistoryDesc: "ตรวจสอบภารกิจที่รับแล้ว กำลังดำเนินงาน และเสร็จสิ้นแล้ว",
      assignmentHistoryLink: "ดูภารกิจของฉัน",
      minOneLanguage: "ต้องมีอย่างน้อย 1 ภาษา",
      minTwoCategories: "ต้องมีอย่างน้อย 2 หมวดหมู่",
      skillCardHint: (minimumLabel) => `${minimumLabel} พิมพ์หรือเลือกจากรายการแนะนำ ระบบจะบันทึกอัตโนมัติ`,
      placeholder: "พิมพ์หรือเลือกรายการแนะนำ…",
      add: "เพิ่ม",
      removeAria: (label) => `ลบ ${label}`,
      langAdded: "เพิ่มภาษาที่ให้บริการแล้ว",
      langRemoved: "ลบภาษาที่ให้บริการแล้ว",
      catAdded: "เพิ่มหมวดหมู่งานแล้ว",
      catRemoved: "ลบหมวดหมู่งานแล้ว",
      keepOneLang: "ต้องมีภาษาที่ให้บริการอย่างน้อย 1 ภาษา",
      keepTwoCats: "ต้องมีหมวดหมู่งานอย่างน้อย 2 หมวดหมู่",
    },
    manager: {
      metricPending: "ใบสมัครรอตรวจสอบ",
      metricOpenRequests: "คำขอที่เปิดอยู่",
      metricStatus: "สถานะบัญชี",
      applicationsTitle: "ใบสมัครล่ามอาสา",
      applicationsDesc: "ตรวจสอบภาษา หมวดหมู่ และประสบการณ์ของผู้สมัครก่อนการอนุมัติ",
      applicationsLink: "เปิดคอนโซลผู้จัดการ",
      auditTitle: "การดูแลและตรวจสอบ",
      auditDesc: "จัดการคำร้องและส่งต่อรายงานตามขอบเขตสิทธิ์ที่ได้รับ",
      chips: ["ตรวจสอบใบสมัคร", "คำขอความช่วยเหลือ", "ส่งต่อรายงาน"],
      notice: "การเปลี่ยนบทบาทและการระงับบัญชีเป็นสิทธิ์ของ Admin เท่านั้น",
    },
    admin: {
      metricStatus: "สถานะระบบ",
      metricStaff: "เจ้าหน้าที่ผู้ดูแล",
      metricAudit: "เหตุการณ์ตรวจสอบวันนี้",
      usersTitle: "ผู้ใช้และบทบาท",
      usersDesc: "ค้นหาโปรไฟล์และจัดการการเปลี่ยนบทบาทผ่านแดชบอร์ด Admin",
      usersLink: "เปิดแดชบอร์ดผู้ดูแลระบบ",
      securityTitle: "การควบคุมความปลอดภัย",
      securityDesc: "การกำหนดบทบาท สถานะระงับบัญชี และบันทึกการตรวจสอบ เป็นระบบควบคุมส่วนกลาง",
      chips: ["จัดการบทบาท", "ระงับบัญชี", "บันทึกการตรวจสอบ"],
      notice: "บทบาท สถานะบัญชี และสิทธิ์ในระบบเป็นแบบอ่านอย่างเดียวในหน้านี้ เพื่อป้องกันการแก้ไขสิทธิ์โดยไม่ตั้งใจ",
    },
  },
};

const copyEn: ProfileCopy = {
  loading: "Loading your profile…",
  breadcrumbAria: "Profile breadcrumbs",
  breadcrumbCurrent: "Profile & Settings",
  roleConfig: {
    User: {
      eyebrow: "Requester profile",
      title: "Profile & Settings",
      description: "Keep your language help profile ready before you need support.",
      badge: "Service requester",
      homeLabel: "Workspace",
      note: "Your contact details stay private until the request flow allows them to be shared.",
    },
    Interpreter: {
      eyebrow: "Interpreter profile",
      title: "Profile & Settings",
      description: "Keep your verified skills and matching preferences current.",
      badge: "Approved interpreter",
      homeLabel: "Workspace",
      note: "Only approved languages and categories are used to match you with open requests.",
    },
    Manager: {
      eyebrow: "Manager profile",
      title: "Profile & Settings",
      description: "Review your personal details and operational access in one place.",
      badge: "Operations manager",
      homeLabel: "Manager console",
      note: "Manager permissions are assigned by the system and cannot be changed from Profile.",
    },
    Admin: {
      eyebrow: "Admin profile",
      title: "Profile & Settings",
      description: "Manage your personal details while keeping system controls protected.",
      badge: "System administrator",
      homeLabel: "Admin dashboard",
      note: "Role, lock status, and system permissions are protected and managed from Admin tools.",
    },
  },
  rail: {
    personalDetails: "Personal details",
    roleSettings: "Role settings",
    deleteAccount: "Delete account",
    accountPrivacy: "Account privacy",
    roleLabels: {
      User: "User",
      Interpreter: "Interpreter",
      Manager: "Manager",
      Admin: "Admin",
    },
  },
  personalDetails: {
    eyebrow: "Account",
    title: "Personal details",
    description: "These details belong to your account and can be updated by you.",
    privateBadge: "Private to your account",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    emailHint: "Managed by sign-in provider",
    phone: "Phone number",
    dateOfBirth: "Date of birth",
    preferredUiLanguage: "Preferred UI language",
    languageHint: "Used for interface copy",
    footerNote: "Email, role, and account status are protected system fields.",
    saved: "Saved",
    saveChanges: "Save changes",
    errors: {
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      phone: "Use a valid Thai phone number",
      dateOfBirth: "Select your date of birth",
    },
  },
  accountDeletion: {
    eyebrow: "Account safety",
    title: "Delete my account",
    description:
      "Close your account and sign out. Completed history stays available for service records, while personal contact details are removed.",
    notice: "Active requests or assignments must be finished or cancelled before you can delete the account.",
    cannotUndo: " This action cannot be undone.",
    migrationPending: " This control becomes available after the latest Supabase migration is applied.",
    deleteButton: "Delete my account",
    modalEyebrow: "Please confirm",
    modalTitle: "Delete your account?",
    modalCloseAria: "Close delete account dialog",
    modalDescription:
      "Your session will end immediately. Your completed mission history will remain without your personal contact details. You cannot restore this account from Profile Settings.",
    migrationWarning: "Account deletion is unavailable until the latest Supabase migration is applied.",
    checkboxLabel: "I understand that this account will be closed and I will be signed out.",
    cancelButton: "Keep my account",
    confirmButton: "Delete account",
    deleting: "Deleting…",
  },
  photo: {
    title: "Profile photo",
    description: "Use a clear image, then crop it to a square before saving it to this browser preview.",
    processing: "Processing…",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    photoUpdated: "Profile photo updated",
    photoRemoved: "Profile photo removed",
    invalidType: "Choose a JPG, PNG, or WEBP image",
    sizeTooLarge: "Image must be smaller than 5 MB",
    readError: "The image could not be read. Try another file",
    cropTitle: "Crop your photo",
    cropEyebrow: "Profile photo",
    cropDescription: "Drag the image to position it inside the square.",
    cropCloseAria: "Close crop editor",
    cropZoom: "Zoom",
    cropCancel: "Cancel",
    cropSaving: "Saving…",
    cropConfirm: "Use this photo",
    cropError: "The crop could not be saved. Try again",
  },
  roleSettings: {
    eyebrow: "Workspace",
    title: "Role settings",
    description: "A quick view of the tools and preferences available to your role.",
    statusActive: "Active",
    statusApproved: "Approved",
    statusNormal: "Normal",
    user: {
      requestHistoryTitle: "Request history",
      requestHistoryDesc: "Track requests you have created and the next step for each one.",
      requestHistoryLink: "View my requests",
      privacyTitle: "Privacy & safety",
      privacyDesc: "Sensitive contact details stay hidden until the matching flow reaches the right confirmation step.",
      metricOpen: "Open requests",
      metricCompleted: "Completed requests",
      metricStatus: "Account status",
    },
    interpreter: {
      metricApproval: "Approval status",
      metricRadius: "Service radius",
      metricMissions: "Completed missions",
      metricScore: "Review score",
      serviceLanguagesTitle: "Service languages",
      serviceLanguagesDesc: "Languages you can provide during a mission",
      matchingCategoriesTitle: "Matching categories",
      matchingCategoriesDesc: "Categories used for request matching",
      searchPrefsTitle: "Search preferences",
      searchPrefsDesc: "Your request map uses a 25 km matching radius and browser GPS when available.",
      searchPrefsLink: "Open find requests",
      assignmentHistoryTitle: "Assignment history",
      assignmentHistoryDesc: "Review claimed, in-progress, and completed missions.",
      assignmentHistoryLink: "View assignments",
      minOneLanguage: "At least one language",
      minTwoCategories: "At least two categories",
      skillCardHint: (minimumLabel) => `${minimumLabel}. Type a custom value or choose a suggestion. Changes save automatically in this browser preview.`,
      placeholder: "Type or choose a suggestion…",
      add: "Add",
      removeAria: (label) => `Remove ${label}`,
      langAdded: "Service language added",
      langRemoved: "Service language removed",
      catAdded: "Matching category added",
      catRemoved: "Matching category removed",
      keepOneLang: "Keep at least one service language",
      keepTwoCats: "Keep at least two matching categories",
    },
    manager: {
      metricPending: "Pending applications",
      metricOpenRequests: "Open help requests",
      metricStatus: "Account status",
      applicationsTitle: "Interpreter applications",
      applicationsDesc: "Review language, category, and experience information before approval.",
      applicationsLink: "Open manager console",
      auditTitle: "Support & audit",
      auditDesc: "Manage help tickets and escalate reports within your assigned permissions.",
      chips: ["Review applications", "Help requests", "Escalate reports"],
      notice: "Role changes and account lock actions are reserved for Admin and are not available here.",
    },
    admin: {
      metricStatus: "System status",
      metricStaff: "Privileged staff",
      metricAudit: "Audit events today",
      usersTitle: "Users & roles",
      usersDesc: "Search profiles and manage role transitions from the protected Admin dashboard.",
      usersLink: "Open Admin dashboard",
      securityTitle: "Security controls",
      securityDesc: "Role assignment, account lock status, and audit history are system-managed controls.",
      chips: ["Role management", "Account lock", "Audit trail"],
      notice: "Role, account status, and system permissions are read-only on this page to prevent accidental privilege changes.",
    },
  },
};

const copyZh: ProfileCopy = {
  loading: "正在加载您的个人资料…",
  breadcrumbAria: "个人资料导航",
  breadcrumbCurrent: "个人资料与设置",
  roleConfig: {
    User: {
      eyebrow: "求助者个人资料",
      title: "个人资料与设置",
      description: "在需要支持前准备好您的语言求助资料。",
      badge: "求助者",
      homeLabel: "工作区",
      note: "在求助流程允许共享之前，您的联系方式将保持保密。",
    },
    Interpreter: {
      eyebrow: "口译员个人资料",
      title: "个人资料与设置",
      description: "保持您已验证的技能和匹配偏好为最新状态。",
      badge: "已认证口译员",
      homeLabel: "工作区",
      note: "仅使用已批准的语言和类别与开放的求助请求进行匹配。",
    },
    Manager: {
      eyebrow: "运营经理个人资料",
      title: "个人资料与设置",
      description: "在一处查看您的个人信息和操作权限。",
      badge: "运营经理",
      homeLabel: "管理控制台",
      note: "经理权限由系统分配，无法从个人资料页面更改。",
    },
    Admin: {
      eyebrow: "管理员个人资料",
      title: "个人资料与设置",
      description: "管理您的个人信息，同时保持系统控制受保护。",
      badge: "系统管理员",
      homeLabel: "管理仪表板",
      note: "角色、锁定状态和系统权限受到保护，并通过管理员工具进行管理。",
    },
  },
  rail: {
    personalDetails: "个人资料",
    roleSettings: "角色设置",
    deleteAccount: "注销账户",
    accountPrivacy: "账户隐私",
    roleLabels: {
      User: "求助者",
      Interpreter: "口译员",
      Manager: "运营经理",
      Admin: "管理员",
    },
  },
  personalDetails: {
    eyebrow: "账户",
    title: "个人资料",
    description: "这些详细信息属于您的账户，可由您进行修改。",
    privateBadge: "仅对您的账户保密",
    firstName: "名字",
    lastName: "姓氏",
    email: "电子邮件地址",
    emailHint: "由登录服务提供商管理",
    phone: "电话号码",
    dateOfBirth: "出生日期",
    preferredUiLanguage: "首选界面语言",
    languageHint: "用于界面显示语言",
    footerNote: "电子邮件、角色和账户状态是受保护的系统字段。",
    saved: "已保存",
    saveChanges: "保存更改",
    errors: {
      firstName: "请输入您的名字",
      lastName: "请输入您的姓氏",
      phone: "请输入有效的泰国电话号码",
      dateOfBirth: "请选择您的出生日期",
    },
  },
  accountDeletion: {
    eyebrow: "账户安全",
    title: "注销我的账户",
    description: "注销您的账户并退出登录。已完成的任务历史记录将保留作为服务凭证，而个人联系信息将被删除。",
    notice: "在注销账户之前，必须先完成或取消当前进行中的请求或任务。",
    cannotUndo: " 此操作无法撤销。",
    migrationPending: " 在应用最新的数据库迁移后即可使用此功能。",
    deleteButton: "注销我的账户",
    modalEyebrow: "请确认",
    modalTitle: "确认注销您的账户？",
    modalCloseAria: "关闭注销账户对话框",
    modalDescription: "您的会话将立即结束。已完成的任务历史记录将被保留，但不会包含您的个人联系方式。您将无法恢复此账户。",
    migrationWarning: "在应用最新的数据库迁移之前，账户注销功能不可用。",
    checkboxLabel: "我明白该账户将被注销，我将被登出。",
    cancelButton: "保留我的账户",
    confirmButton: "确认注销",
    deleting: "正在注销…",
  },
  photo: {
    title: "个人头像",
    description: "请使用清晰的图片，然后在保存前将其裁剪为正方形。",
    processing: "处理中…",
    changePhoto: "更换头像",
    removePhoto: "删除头像",
    photoUpdated: "个人头像已更新",
    photoRemoved: "个人头像已删除",
    invalidType: "请选择 JPG、PNG 或 WEBP 格式的图片",
    sizeTooLarge: "图片大小必须小于 5 MB",
    readError: "无法读取该图片，请尝试其他文件",
    cropTitle: "裁剪您的照片",
    cropEyebrow: "个人头像",
    cropDescription: "拖动图片以将其置于方框中。",
    cropCloseAria: "关闭裁剪器",
    cropZoom: "缩放",
    cropCancel: "取消",
    cropSaving: "保存中…",
    cropConfirm: "使用此照片",
    cropError: "无法保存裁剪，请重试",
  },
  roleSettings: {
    eyebrow: "工作区",
    title: "角色设置",
    description: "快速查看适用于您角色的工具与偏好设置。",
    statusActive: "正常使用",
    statusApproved: "已认证",
    statusNormal: "正常",
    user: {
      requestHistoryTitle: "求助历史记录",
      requestHistoryDesc: "跟踪您创建的求助请求以及每个请求的下一步。",
      requestHistoryLink: "查看我的请求",
      privacyTitle: "隐私与安全",
      privacyDesc: "敏感联系信息将保持隐藏，直到匹配流程进入正确的确认步骤。",
      metricOpen: "进行中的请求",
      metricCompleted: "已完成的请求",
      metricStatus: "账户状态",
    },
    interpreter: {
      metricApproval: "认证状态",
      metricRadius: "服务半径",
      metricMissions: "已完成任务",
      metricScore: "评价得分",
      serviceLanguagesTitle: "服务语言",
      serviceLanguagesDesc: "您在任务期间可提供的口译语言",
      matchingCategoriesTitle: "匹配类别",
      matchingCategoriesDesc: "用于请求匹配的服务类别",
      searchPrefsTitle: "搜索偏好",
      searchPrefsDesc: "您的请求地图使用 25 公里的匹配半径，并在可用时使用浏览器 GPS。",
      searchPrefsLink: "打开查找请求",
      assignmentHistoryTitle: "指派历史记录",
      assignmentHistoryDesc: "查看已认领、进行中和已完成的任务。",
      assignmentHistoryLink: "查看我的任务",
      minOneLanguage: "至少一种语言",
      minTwoCategories: "至少两个类别",
      skillCardHint: (minimumLabel) => `${minimumLabel}。输入自定义内容或选择建议项。更改将自动保存。`,
      placeholder: "输入或选择建议项…",
      add: "添加",
      removeAria: (label) => `删除 ${label}`,
      langAdded: "已添加服务语言",
      langRemoved: "已删除服务语言",
      catAdded: "已添加匹配类别",
      catRemoved: "已删除匹配类别",
      keepOneLang: "请至少保留一种服务语言",
      keepTwoCats: "请至少保留两个匹配类别",
    },
    manager: {
      metricPending: "待审核申请",
      metricOpenRequests: "进行中求助",
      metricStatus: "账户状态",
      applicationsTitle: "口译员申请",
      applicationsDesc: "在批准前审核语言、类别和经验信息。",
      applicationsLink: "打开经理控制台",
      auditTitle: "支持与审计",
      auditDesc: "在分配的权限内管理求助工单并上报问题。",
      chips: ["审核申请", "求助请求", "上报问题"],
      notice: "更改角色和锁定账户的操作仅保留给系统管理员，在此处不可用。",
    },
    admin: {
      metricStatus: "系统状态",
      metricStaff: "管理员成员",
      metricAudit: "今日审计事件",
      usersTitle: "用户与角色",
      usersDesc: "在受保护的管理员仪表板中搜索用户并管理角色转换。",
      usersLink: "打开管理员仪表板",
      securityTitle: "安全控制",
      securityDesc: "角色分配、账户锁定状态和审计历史记录是由系统管理的控制项。",
      chips: ["角色管理", "账户锁定", "审计日志"],
      notice: "角色、账户状态和系统权限在此页面为只读，以防止意外更改权限。",
    },
  },
};

export function getProfileCopy(locale: Locale): ProfileCopy {
  if (locale === "th") return copyTh;
  if (locale === "zh") return copyZh;
  return copyEn;
}

