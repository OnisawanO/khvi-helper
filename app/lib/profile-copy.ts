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
    genericError: string;
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
    description: "ลบข้อมูลเข้าสู่ระบบ โปรไฟล์ คำขอ รีวิว และเอกสารสมัครล่ามที่อัปโหลดแบบถาวร",
    notice: "คำขอหรือภารกิจที่ดำเนินการอยู่ต้องเสร็จสิ้นหรือถูกยกเลิกก่อนจึงจะสามารถลบบัญชีถาวรได้",
    cannotUndo: " การดำเนินการนี้ไม่สามารถยกเลิกได้",
    migrationPending: " ปุ่มนี้จะพร้อมใช้งานหลังตั้งค่า secret ฝั่ง server และใช้ migration ล่าสุดของ Supabase",
    deleteButton: "ลบบัญชีผู้ใช้",
    modalEyebrow: "โปรดยืนยัน",
    modalTitle: "คุณต้องการลบบัญชีผู้ใช้หรือไม่?",
    modalCloseAria: "ปิดหน้าต่างยืนยันการลบบัญชี",
    modalDescription: "ข้อมูลเข้าสู่ระบบ โปรไฟล์ คำขอ รีวิว และเอกสารสมัครล่ามที่อัปโหลดจะถูกลบ คุณจะไม่สามารถกู้คืนบัญชีหรือข้อมูลเหล่านี้ได้",
    migrationWarning: "ยังไม่สามารถลบบัญชีถาวรได้จนกว่าจะตั้งค่า secret ฝั่ง server และใช้ migration ล่าสุดของ Supabase",
    checkboxLabel: "ฉันเข้าใจว่าบัญชีและข้อมูลของบัญชีนี้จะถูกลบอย่างถาวร",
    cancelButton: "เก็บบัญชีไว้",
    confirmButton: "ลบบัญชีถาวร",
    deleting: "กำลังลบถาวร…",
    genericError: "ไม่สามารถลบบัญชีถาวรได้ กรุณาลองอีกครั้ง",
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
    description: "Permanently remove your login, profile, requests, reviews, and uploaded interpreter documents.",
    notice: "Finish or cancel active requests and assignments before permanently deleting your account.",
    cannotUndo: " This action cannot be undone.",
    migrationPending: " This control becomes available after the server secret and latest Supabase migration are configured.",
    deleteButton: "Delete my account",
    modalEyebrow: "Please confirm",
    modalTitle: "Delete your account?",
    modalCloseAria: "Close delete account dialog",
    modalDescription: "Your login, profile, requests, reviews, and uploaded interpreter documents will be deleted. You cannot restore this account or its data.",
    migrationWarning: "Permanent account deletion is unavailable until the server secret and latest Supabase migration are configured.",
    checkboxLabel: "I understand that this account and its data will be permanently deleted.",
    cancelButton: "Keep my account",
    confirmButton: "Permanently delete account",
    deleting: "Deleting permanently…",
    genericError: "The account could not be deleted permanently. Please try again.",
  },
  photo: {
    title: "Profile photo",
    description: "Use a clear image, then crop it to a square before saving it to your profile.",
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
    description: "永久删除您的登录信息、个人资料、求助请求、评价和已上传的口译员申请文件。",
    notice: "永久删除账户前，请先完成或取消仍在进行中的请求和任务。",
    cannotUndo: " 此操作无法撤销。",
    migrationPending: " 配置服务器密钥并应用最新的 Supabase 数据库迁移后即可使用此功能。",
    deleteButton: "注销我的账户",
    modalEyebrow: "请确认",
    modalTitle: "确认注销您的账户？",
    modalCloseAria: "关闭注销账户对话框",
    modalDescription: "您的登录信息、个人资料、求助请求、评价和已上传的口译员申请文件将被删除。账户及其数据无法恢复。",
    migrationWarning: "在配置服务器密钥并应用最新的 Supabase 数据库迁移之前，无法永久删除账户。",
    checkboxLabel: "我明白该账户及其数据将被永久删除。",
    cancelButton: "保留我的账户",
    confirmButton: "永久删除账户",
    deleting: "正在永久删除…",
    genericError: "无法永久删除账户，请重试。",
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

const copyEs: ProfileCopy = {
  ...copyEn,
  loading: "Cargando tu perfil…",
  breadcrumbAria: "Navegación del perfil",
  breadcrumbCurrent: "Perfil y configuración",
  rail: { ...copyEn.rail, personalDetails: "Datos personales", roleSettings: "Configuración del rol", deleteAccount: "Eliminar cuenta", accountPrivacy: "Privacidad de la cuenta", roleLabels: { User: "Solicitante", Interpreter: "Intérprete", Manager: "Gestor", Admin: "Administrador" } },
  personalDetails: {
    ...copyEn.personalDetails,
    eyebrow: "PERFIL", title: "Datos personales", description: "Actualiza tus datos y el idioma de la interfaz.", privateBadge: "Solo para tu cuenta",
    firstName: "Nombre", lastName: "Apellidos", email: "Correo electrónico", emailHint: "Gestionado por el proveedor de inicio de sesión", phone: "Teléfono", dateOfBirth: "Fecha de nacimiento",
    preferredUiLanguage: "Idioma de la interfaz", languageHint: "Se usa para el texto de la interfaz", footerNote: "El correo electrónico, el rol y el estado de la cuenta son campos del sistema protegidos.",
    saveChanges: "Guardar cambios", saved: "Guardado", errors: { firstName: "Introduce tu nombre", lastName: "Introduce tus apellidos", phone: "Introduce un número de teléfono tailandés válido", dateOfBirth: "Selecciona tu fecha de nacimiento" },
  },
  accountDeletion: {
    ...copyEn.accountDeletion,
    eyebrow: "ZONA DE PELIGRO", title: "Eliminar cuenta", description: "Elimina permanentemente tu acceso, perfil, solicitudes, reseñas y documentos de intérprete subidos.",
    notice: "Termina o cancela las solicitudes y asignaciones activas antes de eliminar tu cuenta de forma permanente.", cannotUndo: " Esta acción no se puede deshacer.", migrationPending: " Este control estará disponible cuando se configure el secreto del servidor y la migración más reciente de Supabase.",
    deleteButton: "Eliminar mi cuenta", modalEyebrow: "Confirma la acción", modalTitle: "¿Eliminar tu cuenta?", modalCloseAria: "Cerrar el diálogo de eliminación de cuenta", modalDescription: "Se eliminarán tu acceso, perfil, solicitudes, reseñas y documentos de intérprete subidos. No podrás restaurar esta cuenta ni sus datos.", migrationWarning: "La eliminación permanente no está disponible hasta que se configuren el secreto del servidor y la migración más reciente de Supabase.", checkboxLabel: "Entiendo que esta cuenta y sus datos se eliminarán permanentemente.", cancelButton: "Conservar mi cuenta", confirmButton: "Eliminar cuenta permanentemente", deleting: "Eliminando permanentemente…", genericError: "No se pudo eliminar la cuenta permanentemente. Inténtalo de nuevo.",
  },
  photo: {
    ...copyEn.photo,
    title: "Foto de perfil", description: "Elige una imagen clara y recórtala a un cuadrado antes de guardarla en tu perfil.", processing: "Procesando…", changePhoto: "Cambiar foto", removePhoto: "Eliminar foto", photoUpdated: "Foto de perfil actualizada", photoRemoved: "Foto de perfil eliminada", invalidType: "Elige una imagen JPG, PNG o WEBP", sizeTooLarge: "La imagen debe tener menos de 5 MB", readError: "No se pudo leer la imagen. Prueba con otra.", cropTitle: "Recorta tu foto", cropEyebrow: "Foto de perfil", cropDescription: "Arrastra la imagen para colocarla dentro del cuadrado.", cropCloseAria: "Cerrar el editor de recorte", cropZoom: "Zoom", cropCancel: "Cancelar", cropSaving: "Guardando…", cropConfirm: "Usar esta foto", cropError: "No se pudo guardar el recorte. Inténtalo de nuevo.",
  },
  roleConfig: {
    ...copyEn.roleConfig,
    User: { ...copyEn.roleConfig.User, eyebrow: "SOLICITANTE", title: "Perfil del solicitante", description: "Mantén listo tu perfil de ayuda lingüística antes de necesitar apoyo.", badge: "Solicitante", homeLabel: "Ir al inicio", note: "Tus datos de contacto permanecen privados hasta que el flujo permita compartirlos." },
    Interpreter: { ...copyEn.roleConfig.Interpreter, eyebrow: "INTÉRPRETE", title: "Perfil del intérprete", description: "Mantén actualizadas tus competencias verificadas y preferencias de asignación.", badge: "Intérprete aprobado", homeLabel: "Ir al espacio de trabajo", note: "Solo los idiomas y categorías aprobados se usan para asignarte solicitudes abiertas." },
    Manager: { ...copyEn.roleConfig.Manager, eyebrow: "GESTOR", title: "Perfil del gestor", description: "Revisa en un lugar tus datos personales y tu acceso operativo.", badge: "Gestor de operaciones", homeLabel: "Abrir consola", note: "Los permisos de gestor los asigna el sistema y no se pueden cambiar desde el perfil." },
    Admin: { ...copyEn.roleConfig.Admin, eyebrow: "ADMINISTRADOR", title: "Perfil del administrador", description: "Gestiona tus datos personales sin comprometer los controles del sistema.", badge: "Administrador del sistema", homeLabel: "Abrir panel", note: "El rol, el bloqueo y los permisos del sistema están protegidos y se gestionan desde las herramientas de administración." },
  },
  roleSettings: {
    ...copyEn.roleSettings,
    eyebrow: "ESPACIO DE TRABAJO", title: "Configuración del rol", description: "Consulta rápidamente las herramientas y preferencias disponibles para tu rol.", statusActive: "Activo", statusApproved: "Aprobado", statusNormal: "Normal",
    user: { requestHistoryTitle: "Historial de solicitudes", requestHistoryDesc: "Sigue las solicitudes que has creado y el siguiente paso de cada una.", requestHistoryLink: "Ver mis solicitudes", privacyTitle: "Privacidad y seguridad", privacyDesc: "Los datos de contacto sensibles se mantienen ocultos hasta que el flujo de asignación alcance el paso de confirmación adecuado.", metricOpen: "Solicitudes abiertas", metricCompleted: "Solicitudes completadas", metricStatus: "Estado de la cuenta" },
    interpreter: { metricApproval: "Estado de aprobación", metricRadius: "Radio de servicio", metricMissions: "Misiones completadas", metricScore: "Puntuación de reseñas", serviceLanguagesTitle: "Idiomas de servicio", serviceLanguagesDesc: "Idiomas en los que puedes ayudar durante una misión", matchingCategoriesTitle: "Categorías de asignación", matchingCategoriesDesc: "Categorías que se usan para asignar solicitudes", searchPrefsTitle: "Preferencias de búsqueda", searchPrefsDesc: "El mapa usa un radio de asignación de 25 km y el GPS del navegador cuando está disponible.", searchPrefsLink: "Abrir búsqueda de solicitudes", assignmentHistoryTitle: "Historial de asignaciones", assignmentHistoryDesc: "Revisa misiones aceptadas, en curso y completadas.", assignmentHistoryLink: "Ver asignaciones", minOneLanguage: "Al menos un idioma", minTwoCategories: "Al menos dos categorías", skillCardHint: (minimumLabel) => `${minimumLabel}. Escribe un valor o elige una sugerencia. Los cambios se guardan automáticamente en esta vista previa.`, placeholder: "Escribe o elige una sugerencia…", add: "Añadir", removeAria: (label) => `Eliminar ${label}`, langAdded: "Idioma de servicio añadido", langRemoved: "Idioma de servicio eliminado", catAdded: "Categoría de asignación añadida", catRemoved: "Categoría de asignación eliminada", keepOneLang: "Mantén al menos un idioma de servicio", keepTwoCats: "Mantén al menos dos categorías de asignación" },
    manager: { metricPending: "Solicitudes pendientes", metricOpenRequests: "Solicitudes de ayuda abiertas", metricStatus: "Estado de la cuenta", applicationsTitle: "Solicitudes de intérpretes", applicationsDesc: "Revisa idiomas, categorías y experiencia antes de aprobar.", applicationsLink: "Abrir la consola del gestor", auditTitle: "Soporte y auditoría", auditDesc: "Gestiona solicitudes de ayuda y escala informes dentro de los permisos asignados.", chips: ["Revisar solicitudes", "Solicitudes de ayuda", "Escalar informes"], notice: "Los cambios de rol y el bloqueo de cuentas están reservados para Administración y no están disponibles aquí." },
    admin: { metricStatus: "Estado del sistema", metricStaff: "Personal con privilegios", metricAudit: "Eventos de auditoría de hoy", usersTitle: "Usuarios y roles", usersDesc: "Busca perfiles y gestiona los cambios de rol desde el panel de administración protegido.", usersLink: "Abrir el panel de administración", securityTitle: "Controles de seguridad", securityDesc: "La asignación de roles, el estado de bloqueo y el historial de auditoría son controles gestionados por el sistema.", chips: ["Gestión de roles", "Bloqueo de cuentas", "Registro de auditoría"], notice: "El rol, el estado de la cuenta y los permisos del sistema son de solo lectura en esta página para evitar cambios accidentales de privilegios." },
  },
};

const copyAr: ProfileCopy = {
  ...copyEn,
  loading: "جارٍ تحميل ملفك الشخصي…",
  breadcrumbAria: "تنقل الملف الشخصي",
  breadcrumbCurrent: "الملف الشخصي والإعدادات",
  rail: { ...copyEn.rail, personalDetails: "البيانات الشخصية", roleSettings: "إعدادات الدور", deleteAccount: "حذف الحساب", accountPrivacy: "خصوصية الحساب", roleLabels: { User: "صاحب الطلب", Interpreter: "المترجم", Manager: "المدير", Admin: "المسؤول" } },
  personalDetails: {
    ...copyEn.personalDetails,
    eyebrow: "الملف الشخصي", title: "البيانات الشخصية", description: "حدّث بياناتك ولغة الواجهة.", privateBadge: "خاص بحسابك", firstName: "الاسم الأول", lastName: "اسم العائلة", email: "البريد الإلكتروني", emailHint: "تتم إدارته بواسطة مزود تسجيل الدخول", phone: "الهاتف", dateOfBirth: "تاريخ الميلاد", preferredUiLanguage: "لغة الواجهة", languageHint: "تُستخدم لنصوص الواجهة", footerNote: "البريد الإلكتروني والدور وحالة الحساب حقول نظام محمية.", saveChanges: "حفظ التغييرات", saved: "تم الحفظ", errors: { firstName: "أدخل الاسم الأول", lastName: "أدخل اسم العائلة", phone: "أدخل رقم هاتف تايلندي صالحًا", dateOfBirth: "اختر تاريخ الميلاد" },
  },
  accountDeletion: {
    ...copyEn.accountDeletion,
    eyebrow: "منطقة الخطر", title: "حذف الحساب", description: "احذف نهائيًا بيانات الدخول والملف الشخصي والطلبات والمراجعات ووثائق المترجم المرفوعة.", notice: "أنه الطلبات والمهام النشطة أو ألغها قبل حذف الحساب نهائيًا.", cannotUndo: " لا يمكن التراجع عن هذا الإجراء.", migrationPending: " سيتاح هذا الخيار بعد ضبط سر الخادم وتطبيق أحدث ترحيل لـ Supabase.", deleteButton: "حذف حسابي", modalEyebrow: "يرجى التأكيد", modalTitle: "هل تريد حذف حسابك؟", modalCloseAria: "إغلاق نافذة حذف الحساب", modalDescription: "ستُحذف بيانات الدخول والملف الشخصي والطلبات والمراجعات ووثائق المترجم المرفوعة. لا يمكنك استعادة الحساب أو بياناته.", migrationWarning: "لا تتاح إزالة الحساب نهائيًا قبل ضبط سر الخادم وتطبيق أحدث ترحيل لـ Supabase.", checkboxLabel: "أفهم أن هذا الحساب وبياناته سيُحذفان نهائيًا.", cancelButton: "الاحتفاظ بالحساب", confirmButton: "حذف الحساب نهائيًا", deleting: "جارٍ الحذف نهائيًا…", genericError: "تعذر حذف الحساب نهائيًا. حاول مرة أخرى.",
  },
  photo: {
    ...copyEn.photo,
    title: "صورة الملف الشخصي", description: "اختر صورة واضحة واقتصها إلى مربع قبل حفظها في ملفك الشخصي.", processing: "جارٍ المعالجة…", changePhoto: "تغيير الصورة", removePhoto: "إزالة الصورة", photoUpdated: "تم تحديث صورة الملف الشخصي", photoRemoved: "تمت إزالة صورة الملف الشخصي", invalidType: "اختر صورة بصيغة JPG أو PNG أو WEBP", sizeTooLarge: "يجب ألا يزيد حجم الصورة عن 5 ميغابايت", readError: "تعذرت قراءة الصورة. جرّب صورة أخرى.", cropTitle: "اقتصاص صورتك", cropEyebrow: "صورة الملف الشخصي", cropDescription: "اسحب الصورة لوضعها داخل المربع.", cropCloseAria: "إغلاق محرر الاقتصاص", cropZoom: "تكبير", cropCancel: "إلغاء", cropSaving: "جارٍ الحفظ…", cropConfirm: "استخدام هذه الصورة", cropError: "تعذر حفظ الاقتصاص. حاول مرة أخرى.",
  },
  roleConfig: {
    ...copyEn.roleConfig,
    User: { ...copyEn.roleConfig.User, eyebrow: "صاحب الطلب", title: "ملف صاحب الطلب", description: "حافظ على جاهزية ملف المساعدة اللغوية قبل الحاجة إلى الدعم.", badge: "صاحب الطلب", homeLabel: "العودة للرئيسية", note: "تبقى بيانات الاتصال خاصة إلى أن تسمح خطوة الطلب بمشاركتها." },
    Interpreter: { ...copyEn.roleConfig.Interpreter, eyebrow: "المترجم", title: "ملف المترجم", description: "حافظ على تحديث مهاراتك المعتمدة وتفضيلات المطابقة.", badge: "مترجم معتمد", homeLabel: "فتح مساحة العمل", note: "تُستخدم اللغات والفئات المعتمدة فقط لمطابقتك مع الطلبات المفتوحة." },
    Manager: { ...copyEn.roleConfig.Manager, eyebrow: "المدير", title: "ملف المدير", description: "راجع بياناتك الشخصية وصلاحية التشغيل في مكان واحد.", badge: "مدير العمليات", homeLabel: "فتح اللوحة", note: "تُعيَّن صلاحيات المدير من النظام ولا يمكن تغييرها من الملف الشخصي." },
    Admin: { ...copyEn.roleConfig.Admin, eyebrow: "المسؤول", title: "ملف المسؤول", description: "أدر بياناتك الشخصية مع حماية عناصر تحكم النظام.", badge: "مسؤول النظام", homeLabel: "فتح لوحة الإدارة", note: "الدور وحالة القفل وصلاحيات النظام محمية وتُدار من أدوات الإدارة." },
  },
  roleSettings: {
    ...copyEn.roleSettings,
    eyebrow: "مساحة العمل", title: "إعدادات الدور", description: "عرض سريع للأدوات والتفضيلات المتاحة لدورك.", statusActive: "نشط", statusApproved: "معتمد", statusNormal: "عادي",
    user: { requestHistoryTitle: "سجل الطلبات", requestHistoryDesc: "تابع الطلبات التي أنشأتها والخطوة التالية لكل منها.", requestHistoryLink: "عرض طلباتي", privacyTitle: "الخصوصية والأمان", privacyDesc: "تبقى بيانات الاتصال الحساسة مخفية إلى أن يصل تدفق المطابقة إلى خطوة التأكيد المناسبة.", metricOpen: "الطلبات المفتوحة", metricCompleted: "الطلبات المكتملة", metricStatus: "حالة الحساب" },
    interpreter: { metricApproval: "حالة الاعتماد", metricRadius: "نطاق الخدمة", metricMissions: "المهام المكتملة", metricScore: "درجة المراجعة", serviceLanguagesTitle: "لغات الخدمة", serviceLanguagesDesc: "اللغات التي يمكنك تقديمها أثناء المهمة", matchingCategoriesTitle: "فئات المطابقة", matchingCategoriesDesc: "الفئات المستخدمة لمطابقة الطلبات", searchPrefsTitle: "تفضيلات البحث", searchPrefsDesc: "تستخدم خريطة الطلبات نطاق مطابقة 25 كم ونظام تحديد الموقع في المتصفح عند توفره.", searchPrefsLink: "فتح البحث عن الطلبات", assignmentHistoryTitle: "سجل المهام", assignmentHistoryDesc: "راجع المهام المقبولة والجارية والمكتملة.", assignmentHistoryLink: "عرض المهام", minOneLanguage: "لغة واحدة على الأقل", minTwoCategories: "فئتان على الأقل", skillCardHint: (minimumLabel) => `${minimumLabel}. اكتب قيمة أو اختر اقتراحًا. تُحفظ التغييرات تلقائيًا في هذه المعاينة.`, placeholder: "اكتب أو اختر اقتراحًا…", add: "إضافة", removeAria: (label) => `إزالة ${label}`, langAdded: "تمت إضافة لغة الخدمة", langRemoved: "تمت إزالة لغة الخدمة", catAdded: "تمت إضافة فئة المطابقة", catRemoved: "تمت إزالة فئة المطابقة", keepOneLang: "احتفظ بلغة خدمة واحدة على الأقل", keepTwoCats: "احتفظ بفئتين للمطابقة على الأقل" },
    manager: { metricPending: "طلبات قيد المراجعة", metricOpenRequests: "طلبات المساعدة المفتوحة", metricStatus: "حالة الحساب", applicationsTitle: "طلبات المترجمين", applicationsDesc: "راجع معلومات اللغة والفئة والخبرة قبل الاعتماد.", applicationsLink: "فتح لوحة المدير", auditTitle: "الدعم والتدقيق", auditDesc: "أدر طلبات المساعدة وصعّد البلاغات ضمن الصلاحيات المعيّنة لك.", chips: ["مراجعة الطلبات", "طلبات المساعدة", "تصعيد البلاغات"], notice: "تغييرات الأدوار وقفل الحسابات مخصصة للمسؤول ولا تتاح هنا." },
    admin: { metricStatus: "حالة النظام", metricStaff: "الموظفون ذوو الامتيازات", metricAudit: "أحداث التدقيق اليوم", usersTitle: "المستخدمون والأدوار", usersDesc: "ابحث في الملفات الشخصية وأدر تغييرات الأدوار من لوحة الإدارة المحمية.", usersLink: "فتح لوحة الإدارة", securityTitle: "ضوابط الأمان", securityDesc: "تعيين الأدوار وحالة قفل الحساب وسجل التدقيق عناصر تحكم يديرها النظام.", chips: ["إدارة الأدوار", "قفل الحساب", "سجل التدقيق"], notice: "الدور وحالة الحساب وصلاحيات النظام للقراءة فقط في هذه الصفحة لتجنب تغييرات الامتيازات غير المقصودة." },
  },
};

export function getProfileCopy(locale: Locale): ProfileCopy {
  if (locale === "th") return copyTh;
  if (locale === "zh") return copyZh;
  if (locale === "es") return copyEs;
  if (locale === "ar") return copyAr;
  return copyEn;
}

