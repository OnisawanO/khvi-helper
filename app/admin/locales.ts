import type { Locale } from "@/app/components/site-header";

export type AdminTranslation = {
  header: {
    subtitle: string;
    home: string;
    menu: string;
    closeMenu: string;
    profile: string;
    signOut: string;
    primaryAdmin: string;
    delegatedAdmin: string;
  };
  navigation: {
    administration: string;
    overview: string;
    users: string;
    reports: string;
    audit: string;
    policies: string;
    operations: string;
    queue: string;
    approved: string;
    changeRequests: string;
    rejected: string;
    history: string;
  };
  kpi: {
    users: string;
    interpreters: string;
    softSuspended: string;
    hardBanned: string;
    activeFilter: string;
    filterAll: string;
    filterInterpreters: string;
    healthyBase: string;
    filterSoftSuspended: string;
    filterHardBans: string;
  };
};

const translations: Record<Locale, AdminTranslation> = {
  en: {
    header: { subtitle: "Admin Dashboard", home: "KHVI Home", menu: "Toggle navigation menu", closeMenu: "Close menu", profile: "Profile", signOut: "Sign out", primaryAdmin: "Primary Admin", delegatedAdmin: "Delegated Admin" },
    navigation: { administration: "Administration", overview: "Platform Overview", users: "User Management", reports: "System Reports", audit: "Audit Trail", policies: "Platform Policies", operations: "Manager Operations", queue: "Application Queue", approved: "Approved Volunteers", changeRequests: "Profile Change Requests", rejected: "Rejected Archive", history: "Operations History" },
    kpi: { users: "users", interpreters: "registered", softSuspended: "soft suspended", hardBanned: "permanently banned", activeFilter: "Active Filter", filterAll: "Filter All", filterInterpreters: "Filter Interpreters", healthyBase: "Healthy Base", filterSoftSuspended: "Filter Soft Suspended", filterHardBans: "Filter Hard Bans" },
  },
  th: {
    header: { subtitle: "แดชบอร์ดผู้ดูแล", home: "หน้าหลัก KHVI", menu: "เปิดเมนูนำทาง", closeMenu: "ปิดเมนู", profile: "โปรไฟล์", signOut: "ออกจากระบบ", primaryAdmin: "ผู้ดูแลหลัก", delegatedAdmin: "ผู้ดูแลที่ได้รับมอบหมาย" },
    navigation: { administration: "การดูแลระบบ", overview: "ภาพรวมแพลตฟอร์ม", users: "จัดการผู้ใช้", reports: "รายงานระบบ", audit: "ประวัติการตรวจสอบ", policies: "นโยบายแพลตฟอร์ม", operations: "การปฏิบัติงานของ Manager", queue: "คิวใบสมัคร", approved: "อาสาสมัครที่อนุมัติแล้ว", changeRequests: "คำขอเปลี่ยนโปรไฟล์", rejected: "คลังใบสมัครที่ไม่ผ่าน", history: "ประวัติการดำเนินงาน" },
    kpi: { users: "ผู้ใช้", interpreters: "ลงทะเบียนแล้ว", softSuspended: "ระงับชั่วคราว", hardBanned: "แบนถาวร", activeFilter: "ตัวกรองที่ใช้อยู่", filterAll: "กรองทั้งหมด", filterInterpreters: "กรองล่าม", healthyBase: "สถานะปกติ", filterSoftSuspended: "กรองผู้ถูกระงับ", filterHardBans: "กรองผู้ถูกแบน" },
  },
  zh: {
    header: { subtitle: "管理员面板", home: "KHVI 首页", menu: "切换导航菜单", closeMenu: "关闭菜单", profile: "个人资料", signOut: "退出登录", primaryAdmin: "主管理员", delegatedAdmin: "委派管理员" },
    navigation: { administration: "系统管理", overview: "平台概览", users: "用户管理", reports: "系统报告", audit: "审计记录", policies: "平台政策", operations: "管理员运营", queue: "申请队列", approved: "已批准志愿者", changeRequests: "资料变更请求", rejected: "未通过档案", history: "运营历史" },
    kpi: { users: "用户", interpreters: "已注册", softSuspended: "暂时限制", hardBanned: "永久封禁", activeFilter: "当前筛选", filterAll: "筛选全部", filterInterpreters: "筛选口译员", healthyBase: "状态正常", filterSoftSuspended: "筛选暂时限制", filterHardBans: "筛选永久封禁" },
  },
  es: {
    header: { subtitle: "Panel de administración", home: "Inicio de KHVI", menu: "Alternar menú de navegación", closeMenu: "Cerrar menú", profile: "Perfil", signOut: "Cerrar sesión", primaryAdmin: "Administrador principal", delegatedAdmin: "Administrador delegado" },
    navigation: { administration: "Administración", overview: "Resumen de la plataforma", users: "Gestión de usuarios", reports: "Informes del sistema", audit: "Registro de auditoría", policies: "Políticas de la plataforma", operations: "Operaciones del gestor", queue: "Cola de solicitudes", approved: "Voluntarios aprobados", changeRequests: "Cambios de perfil", rejected: "Archivo rechazado", history: "Historial operativo" },
    kpi: { users: "usuarios", interpreters: "registrados", softSuspended: "suspendidos", hardBanned: "bloqueados permanentemente", activeFilter: "Filtro activo", filterAll: "Filtrar todos", filterInterpreters: "Filtrar intérpretes", healthyBase: "Base saludable", filterSoftSuspended: "Filtrar suspendidos", filterHardBans: "Filtrar bloqueos" },
  },
  ar: {
    header: { subtitle: "لوحة المسؤول", home: "صفحة KHVI الرئيسية", menu: "تبديل قائمة التنقل", closeMenu: "إغلاق القائمة", profile: "الملف الشخصي", signOut: "تسجيل الخروج", primaryAdmin: "المسؤول الرئيسي", delegatedAdmin: "المسؤول المفوض" },
    navigation: { administration: "الإدارة", overview: "نظرة عامة على المنصة", users: "إدارة المستخدمين", reports: "تقارير النظام", audit: "سجل التدقيق", policies: "سياسات المنصة", operations: "عمليات المدير", queue: "قائمة الطلبات", approved: "المتطوعون المعتمدون", changeRequests: "طلبات تغيير الملف", rejected: "الأرشيف المرفوض", history: "السجل التشغيلي" },
    kpi: { users: "المستخدمون", interpreters: "مسجلون", softSuspended: "موقوفون مؤقتًا", hardBanned: "محظورون نهائيًا", activeFilter: "التصفية النشطة", filterAll: "تصفية الكل", filterInterpreters: "تصفية المترجمين", healthyBase: "الحالة سليمة", filterSoftSuspended: "تصفية الموقوفين", filterHardBans: "تصفية المحظورين" },
  },
};

export function getAdminTranslation(locale: Locale): AdminTranslation {
  return translations[locale];
}
