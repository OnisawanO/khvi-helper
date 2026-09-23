import type { Locale } from "@/app/components/site-header";
import { ManagerNavSection } from "./types";

export type ManagerTranslation = {
  headings: Partial<Record<
    ManagerNavSection,
    {
      title: string;
      subtitle: string;
    }
  >>;
  kpi: {
    pending: { label: string; countSuffix: string; footLabel: string; action: string; activeAction: string };
    approved: { label: string; countSuffix: string; footLabel: string; action: string; activeAction: string };
    rejected: { label: string; countSuffix: string; footLabel: string; action: string; activeAction: string };
    reports: { label: string; countSuffix: string; footLabel: string; action: string; activeAction: string };
  };
  navigation: {
    toggleMenu: string;
    queue: string;
    approved: string;
    rejected: string;
    reports: string;
    history: string;
    verificationGroup: string;
    operationsGroup: string;
  };
  table: {
    searchPlaceholder: string;
    filterButton: string;
    resetButton: string;
    languagesTitle: string;
    categoriesTitle: string;
    columns: {
      applicant: string;
      languages: string;
      specialties: string;
      background: string;
      status: string;
      action: string;
    };
    emptyTitle: string;
    emptySubtitle: string;
    approveBtn: string;
    rejectBtn: string;
    approvedStatus: string;
    rejectedStatus: string;
    pendingStatus: string;
    underReviewStatus: string;
    needsRevisionStatus: string;
    otherLanguagesCount: string;
    paginationShowing: string;
    paginationOf: string;
    paginationCandidates: string;
    paginationPrev: string;
    paginationNext: string;
  };
  header: {
    hubSubtitle: string;
    profile: string;
    signOut: string;
    verifiedManager: string;
    roleManager: string;
    interfaceLanguage: string;
  };
};

export const managerTranslations: Record<Locale, ManagerTranslation> = {
  en: {
    headings: {
      queue: {
        title: "Volunteer Interpreter Queue",
        subtitle: "Review volunteer applicant credentials and verify language capabilities.",
      },
      approved: {
        title: "Approved Volunteer Interpreters",
        subtitle: "List of certified volunteers authorized to receive live mission broadcasts.",
      },
      rejected: {
        title: "Rejected Applicant Archive",
        subtitle: "Historical record of rejected applicants and specified rejection reasons.",
      },
      reports: {
        title: "System Reports",
        subtitle: "Review platform issues, resolve them internally, or escalate cases to Admin.",
      },
      history: {
        title: "Operations Activity History",
        subtitle: "Audit log of operational actions, review approvals, and dispute resolutions.",
      },
    },
    kpi: {
      pending: { label: "Pending Queue", countSuffix: "candidates", footLabel: "Awaiting Review", action: "Inspect Queue", activeAction: "Active Filter" },
      approved: { label: "Approved Volunteers", countSuffix: "certified", footLabel: "Live Ready", action: "Browse Certified", activeAction: "Active Filter" },
      rejected: { label: "Rejected Archive", countSuffix: "archived", footLabel: "Disqualified Records", action: "View History", activeAction: "Active Filter" },
      reports: { label: "System Reports", countSuffix: "unresolved", footLabel: "Needs Attention", action: "Handle Reports", activeAction: "Active Filter" },
    },
    navigation: {
      toggleMenu: "Toggle Navigation Menu",
      queue: "Volunteer Queue",
      approved: "Approved Interpreters",
      rejected: "Rejected Archive",
      reports: "System Reports",
      history: "Operations History",
      verificationGroup: "Verification & Onboarding",
      operationsGroup: "Live Operations & Support",
    },
    table: {
      searchPlaceholder: "Search candidate by name, language, category, or ID...",
      filterButton: "Filter",
      resetButton: "Reset",
      languagesTitle: "Spoken Languages",
      categoriesTitle: "Specialty Domains",
      columns: {
        applicant: "Applicant & Location",
        languages: "Languages",
        specialties: "Specialties",
        background: "Background",
        status: "Status",
        action: "Action",
      },
      emptyTitle: "No candidates matching the criteria",
      emptySubtitle: "Try adjusting your search query or reset active filters.",
      approveBtn: "Approve",
      rejectBtn: "Reject",
      approvedStatus: "Approved",
      rejectedStatus: "Rejected",
      pendingStatus: "Pending",
      underReviewStatus: "Under Review",
      needsRevisionStatus: "Needs Revision",
      otherLanguagesCount: "other language(s)",
      paginationShowing: "Showing",
      paginationOf: "of",
      paginationCandidates: "candidates",
      paginationPrev: "Previous",
      paginationNext: "Next",
    },
    header: {
      hubSubtitle: "Interpreter Operations Hub",
      profile: "Profile",
      signOut: "Sign Out",
      verifiedManager: "Verified Regional Manager",
      roleManager: "Regional Manager",
      interfaceLanguage: "Interface Language",
    },
  },
  th: {
    headings: {
      queue: {
        title: "คิวตรวจสอบล่ามจิตอาสา",
        subtitle: "ตรวจสอบคุณสมบัติและยืนยันความสามารถทางภาษาของผู้ยื่นใบสมัครล่ามจิตอาสา",
      },
      approved: {
        title: "รายชื่อล่ามจิตอาสาที่ผ่านการอนุมัติ",
        subtitle: "รายชื่อล่ามจิตอาสาที่ผ่านการรับรองและพร้อมรับภารกิจช่วยเหลือสด",
      },
      rejected: {
        title: "คลังประวัติใบสมัครที่ไม่ผ่านการอนุมัติ",
        subtitle: "ประวัติใบสมัครที่ไม่ผ่านเกณฑ์การตรวจสอบพร้อมระบุเหตุผลในการปฏิเสธ",
      },
      reports: {
        title: "รายงานปัญหาระบบ",
        subtitle: "ตรวจสอบปัญหาของแพลตฟอร์ม แก้ไขภายใน หรือส่งต่อให้ผู้ดูแลระบบ",
      },
      history: {
        title: "ประวัติกิจกรรมและการดำเนินงาน",
        subtitle: "บันทึกประวัติการดำเนินงาน การอนุมัติใบสมัคร และการระงับข้อพิพาทในระบบ",
      },
    },
    kpi: {
      pending: { label: "คิวรอตรวจสอบ", countSuffix: "ผู้สมัคร", footLabel: "รอการพิจารณา", action: "ตรวจสอบคิว", activeAction: "กำลังดูคิวนี้" },
      approved: { label: "ล่ามที่ผ่านการอนุมัติ", countSuffix: "คนที่รับรองแล้ว", footLabel: "พร้อมรับงานทันที", action: "ดูรายชื่อล่าม", activeAction: "กำลังดูรายชื่อ" },
      rejected: { label: "คลังไม่ผ่านการอนุมัติ", countSuffix: "ประวัติที่บันทึก", footLabel: "ใบสมัครที่ไม่ผ่านเกณฑ์", action: "ดูประวัติเดิม", activeAction: "กำลังดูประวัติ" },
      reports: { label: "รายงานปัญหาระบบ", countSuffix: "รายงานคงค้าง", footLabel: "ต้องติดตาม", action: "จัดการรายงาน", activeAction: "กำลังดูรายงาน" },
    },
    navigation: {
      toggleMenu: "เปิด/ปิดแถบเมนูนำทาง",
      queue: "คิวตรวจสอบล่าม",
      approved: "ล่ามที่ผ่านการอนุมัติ",
      rejected: "คลังประวัติปฏิเสธ",
      reports: "รายงานปัญหาระบบ",
      history: "ประวัติดำเนินงาน",
      verificationGroup: "การตรวจสอบและรับรองล่าม",
      operationsGroup: "การปฏิบัติงานและการสนับสนุน",
    },
    table: {
      searchPlaceholder: "ค้นหาผู้สมัครด้วยชื่อ, ภาษา, หมวดหมู่ หรือรหัส ID...",
      filterButton: "ตัวกรอง",
      resetButton: "รีเซ็ต",
      languagesTitle: "ภาษาที่สื่อสารได้",
      categoriesTitle: "ความเชี่ยวชาญเฉพาะทาง",
      columns: {
        applicant: "ผู้สมัครและพื้นที่",
        languages: "ภาษา",
        specialties: "ความเชี่ยวชาญ",
        background: "ประวัติความปลอดภัย",
        status: "สถานะ",
        action: "การจัดการ",
      },
      emptyTitle: "ไม่พบผู้สมัครที่ตรงกับเงื่อนไขการค้นหา",
      emptySubtitle: "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองที่เลือกไว้",
      approveBtn: "อนุมัติ",
      rejectBtn: "ปฏิเสธ",
      approvedStatus: "อนุมัติแล้ว",
      rejectedStatus: "ปฏิเสธแล้ว",
      pendingStatus: "รอตรวจสอบ",
      underReviewStatus: "กำลังพิจารณา",
      needsRevisionStatus: "ขอเอกสารเพิ่ม",
      otherLanguagesCount: "ภาษาเพิ่มเติม",
      paginationShowing: "แสดง",
      paginationOf: "จากทั้งหมด",
      paginationCandidates: "รายการ",
      paginationPrev: "ก่อนหน้า",
      paginationNext: "ถัดไป",
    },
    header: {
      hubSubtitle: "ศูนย์ควบคุมและประสานงานล่าม",
      profile: "โปรไฟล์ส่วนตัว",
      signOut: "ออกจากระบบ",
      verifiedManager: "ผู้ประสานงานประจำภูมิภาค",
      roleManager: "ผู้ประสานงานภูมิภาค",
      interfaceLanguage: "ภาษาของระบบ",
    },
  },
  zh: {
    headings: {
      queue: {
        title: "志愿口译员待审队列",
        subtitle: "审核志愿者申请人资质并核实各项语言服务能力。",
      },
      approved: {
        title: "已通过认证的口译员",
        subtitle: "获准接收实时求助任务与现场语言支援的认证志愿者名单。",
      },
      rejected: {
        title: "未通过申请档案",
        subtitle: "记录未通过审核的申请人历史及已说明的具体拒绝原因。",
      },
      reports: {
        title: "突发事件报告与争议",
        subtitle: "审查未解决的事件报告，调解任务纠纷或上报至超级管理员。",
      },
      history: {
        title: "运营操作活动历史",
        subtitle: "记录审批操作、纠纷调解及平台系统审核的详细日志。",
      },
    },
    kpi: {
      pending: { label: "待审队列", countSuffix: "位候选人", footLabel: "等待人工审核", action: "检查队列", activeAction: "当前筛选" },
      approved: { label: "已认证口译员", countSuffix: "位已通过", footLabel: "可即时出勤", action: "浏览名单", activeAction: "当前筛选" },
      rejected: { label: "未通过档案", countSuffix: "条记录", footLabel: "不合规档案", action: "查看历史", activeAction: "当前筛选" },
      reports: { label: "待决争议报告", countSuffix: "起待处理", footLabel: "需协调介入", action: "处理报告", activeAction: "当前筛选" },
    },
    navigation: {
      toggleMenu: "切换导航菜单",
      queue: "候选人队列",
      approved: "已通过志愿者",
      rejected: "未通过档案",
      reports: "事件报告",
      history: "操作历史",
      verificationGroup: "志愿者审核与认证",
      operationsGroup: "日常运营与纠纷",
    },
    table: {
      searchPlaceholder: "按姓名、语言、专业领域或编号搜索候选人...",
      filterButton: "筛选",
      resetButton: "重置",
      languagesTitle: "所掌握语言",
      categoriesTitle: "专业服务领域",
      columns: {
        applicant: "申请人与地区",
        languages: "掌握语言",
        specialties: "专业领域",
        background: "资质核查",
        status: "状态",
        action: "操作",
      },
      emptyTitle: "没有符合条件的候选人",
      emptySubtitle: "请尝试更改搜索关键词或重置筛选选项。",
      approveBtn: "批准",
      rejectBtn: "拒绝",
      approvedStatus: "已批准",
      rejectedStatus: "已拒绝",
      pendingStatus: "待审核",
      underReviewStatus: "正在复核",
      needsRevisionStatus: "需补充资料",
      otherLanguagesCount: "种其他语言",
      paginationShowing: "显示",
      paginationOf: "共",
      paginationCandidates: "位申请人",
      paginationPrev: "上一页",
      paginationNext: "下一页",
    },
    header: {
      hubSubtitle: "口译调度运营中心",
      profile: "个人资料",
      signOut: "退出登录",
      verifiedManager: "认证区域调度主管",
      roleManager: "区域主管",
      interfaceLanguage: "界面语言",
    },
  },
  es: {
    headings: {
      queue: {
        title: "Cola de Intérpretes Voluntarios",
        subtitle: "Revise las credenciales y verifique las habilidades lingüísticas de los solicitantes.",
      },
      approved: {
        title: "Intérpretes Voluntarios Aprobados",
        subtitle: "Lista de voluntarios certificados autorizados para recibir misiones en vivo.",
      },
      rejected: {
        title: "Archivo de Solicitudes Rechazadas",
        subtitle: "Registro histórico de solicitudes no aprobadas y sus motivos especificados.",
      },
      reports: {
        title: "Informes de Incidentes y Disputas",
        subtitle: "Revise reportes no resueltos, medie disputas o escale al Administrador.",
      },
      history: {
        title: "Historial de Actividades Operativas",
        subtitle: "Registro de auditoría de aprobaciones, revisiones y resoluciones operativas.",
      },
    },
    kpi: {
      pending: { label: "Cola de Espera", countSuffix: "candidatos", footLabel: "Esperando Revisión", action: "Inspeccionar", activeAction: "Filtro Activo" },
      approved: { label: "Aprobados", countSuffix: "certificados", footLabel: "Listos para Misión", action: "Ver Lista", activeAction: "Filtro Activo" },
      rejected: { label: "Archivados", countSuffix: "rechazados", footLabel: "No Calificados", action: "Ver Historial", activeAction: "Filtro Activo" },
      reports: { label: "Disputas Abiertas", countSuffix: "pendientes", footLabel: "Mediación Requerida", action: "Gestionar", activeAction: "Filtro Activo" },
    },
    navigation: {
      toggleMenu: "Alternar menú de navegación",
      queue: "Cola de Solicitudes",
      approved: "Voluntarios Aprobados",
      rejected: "Archivo de Rechazos",
      reports: "Reportes de Incidentes",
      history: "Historial Operativo",
      verificationGroup: "Verificación y Admisión",
      operationsGroup: "Operaciones y Disputas",
    },
    table: {
      searchPlaceholder: "Buscar candidato por nombre, idioma, categoría o ID...",
      filterButton: "Filtrar",
      resetButton: "Restablecer",
      languagesTitle: "Idiomas Hablados",
      categoriesTitle: "Dominios Especializados",
      columns: {
        applicant: "Candidato y Ubicación",
        languages: "Idiomas",
        specialties: "Especialidades",
        background: "Antecedentes",
        status: "Estado",
        action: "Acción",
      },
      emptyTitle: "No hay candidatos que coincidan con el criterio",
      emptySubtitle: "Intente ajustar su búsqueda o restablezca los filtros.",
      approveBtn: "Aprobar",
      rejectBtn: "Rechazar",
      approvedStatus: "Aprobado",
      rejectedStatus: "Rechazado",
      pendingStatus: "Pendiente",
      underReviewStatus: "En Revisión",
      needsRevisionStatus: "Requiere Corrección",
      otherLanguagesCount: "otro(s) idioma(s)",
      paginationShowing: "Mostrando",
      paginationOf: "de",
      paginationCandidates: "candidatos",
      paginationPrev: "Anterior",
      paginationNext: "Siguiente",
    },
    header: {
      hubSubtitle: "Centro de Operaciones de Intérpretes",
      profile: "Perfil",
      signOut: "Cerrar Sesión",
      verifiedManager: "Coordinador Regional Verificado",
      roleManager: "Coordinador Regional",
      interfaceLanguage: "Idioma de la interfaz",
    },
  },
  ar: {
    headings: {
      queue: {
        title: "قائمة انتظار المترجمين المتطوعين",
        subtitle: "مراجعة مؤهلات المتقدمين والتحقق من كفاءاتهم اللغوية بدقة.",
      },
      approved: {
        title: "المترجمون المتطوعون المعتمدون",
        subtitle: "قائمة المتطوعين المعتمدين المصرح لهم بتلقي مهام المساعدة المباشرة.",
      },
      rejected: {
        title: "أرشيف الطلبات المرفوضة",
        subtitle: "سجل تاريخي للطلبات التي لم تستوفِ المعايير مع توضيح الأسباب.",
      },
      reports: {
        title: "تقارير الحوادث والنزاعات",
        subtitle: "مراجعة تقارير الحوادث غير المحسومة والوساطة في النزاعات أو تصعيدها.",
      },
      history: {
        title: "سجل العمليات والأنشطة",
        subtitle: "سجل تدقيق للإجراءات التشغيلية والاعتمادات وحل النزاعات.",
      },
    },
    kpi: {
      pending: { label: "قيد الانتظار", countSuffix: "مرشحين", footLabel: "بانتظار المراجعة", action: "فحص القائمة", activeAction: "عرض نشط" },
      approved: { label: "المعتمدون", countSuffix: "مترجمين معتمدين", footLabel: "جاهزون للخدمة", action: "تصفح القائمة", activeAction: "عرض نشط" },
      rejected: { label: "المرفوضون", countSuffix: "سجلات مؤرشفة", footLabel: "طلبات غير مؤهلة", action: "عرض السجل", activeAction: "عرض نشط" },
      reports: { label: "نزاعات مفتوحة", countSuffix: "تقارير معلقة", footLabel: "تتطلب وساطة", action: "معالجة التقارير", activeAction: "عرض نشط" },
    },
    navigation: {
      toggleMenu: "تبديل القائمة",
      queue: "قائمة الانتظار",
      approved: "المترجمون المعتمدون",
      rejected: "الأرشيف المرفوض",
      reports: "تقارير الحوادث",
      history: "سجل العمليات",
      verificationGroup: "التحقق والاعتماد",
      operationsGroup: "العمليات والنزاعات",
    },
    table: {
      searchPlaceholder: "البحث عن مرشح بالاسم أو اللغة أو التخصص أو المعرف...",
      filterButton: "تصفية",
      resetButton: "إعادة ضبط",
      languagesTitle: "اللغات المتقنة",
      categoriesTitle: "مجالات التخصص",
      columns: {
        applicant: "المتقدم والموقع",
        languages: "اللغات",
        specialties: "التخصصات",
        background: "التحقق الأمني",
        status: "الحالة",
        action: "الإجراء",
      },
      emptyTitle: "لا يوجد مرشحون يطابقون معايير البحث",
      emptySubtitle: "يرجى تعديل مصطلح البحث أو إعادة تعيين عوامل التصفية.",
      approveBtn: "قبول",
      rejectBtn: "رفض",
      approvedStatus: "معتمد",
      rejectedStatus: "مرفوض",
      pendingStatus: "معلق",
      underReviewStatus: "قيد المراجعة",
      needsRevisionStatus: "يتطلب تعديلاً",
      otherLanguagesCount: "لغة أخرى",
      paginationShowing: "عرض",
      paginationOf: "من أصل",
      paginationCandidates: "مرشحين",
      paginationPrev: "السابق",
      paginationNext: "التالي",
    },
    header: {
      hubSubtitle: "مركز عمليات الترجمة الفورية",
      profile: "الملف الشخصي",
      signOut: "تسجيل الخروج",
      verifiedManager: "منسق إقليمي معتمد",
      roleManager: "منسق إقليمي",
      interfaceLanguage: "لغة الواجهة",
    },
  },
};

export function getManagerTranslation(locale: Locale): ManagerTranslation {
  return managerTranslations[locale] || managerTranslations.en;
}
