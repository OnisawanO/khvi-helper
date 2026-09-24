import type { Locale } from "@/app/components/site-header";
import type { UserRole } from "@/app/lib/auth-types";

export type AuthCopy = {
  login: {
    title: string;
    accent: string;
    description: string;
    forgotPassword: string;
    forgotPasswordSoon: string;
    resetPasswordTitle: string;
    resetPasswordDescription: string;
    resetPasswordSubmit: string;
    resetPasswordSubmitting: string;
    resetPasswordSuccess: string;
    resetPasswordBack: string;
    resetPasswordInvalidLink: string;
    resetPasswordRequestNew: string;
    resetPasswordUpdatedTitle: string;
    resetPasswordUpdatedBody: string;
    passwordPlaceholder: string;
    rememberMe: string;
    submit: string;
    submitting: string;
    fastLoginTitle: string;
    fastLoginNote: string;
    successTitle: string;
    successBody: (name: string, role: string) => string;
    emptyEmail: string;
    invalidEmail: string;
    emptyPassword: string;
    profileError: string;
    genericError: string;
    fastLoginError: string;
    fastLoginRoleMismatch: string;
    showPassword: string;
    hidePassword: string;
    noAccount: string;
    signUp: string;
  };
  register: {
    eyebrow: string;
    title: string;
    description: string;
    successTitle: string;
    successBody: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    phoneHint: string;
    dateOfBirth: string;
    age: (age: number) => string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    cancel: string;
    submit: string;
    submitting: string;
    existingAccount: string;
    signInHere: string;
    signUpHere: string;
    profileError: string;
    genericError: string;
  };
  roleLabels: Record<UserRole, string>;
  validation: {
    firstNameRequired: string;
    firstNameMin: string;
    lastNameRequired: string;
    lastNameMin: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin: string;
    confirmPasswordRequired: string;
    passwordsMismatch: string;
    phoneRequired: string;
    phoneInvalid: string;
    dateOfBirthRequired: string;
    dateOfBirthInvalid: string;
    minimumAge: string;
    dateOfBirthRange: string;
    localeInvalid: string;
  };
  errors: {
    weakPassword: string;
    emailExists: string;
    invalidEmail: string;
    loginFallback: string;
    registerFallback: string;
  };
  side: {
    login: {
      eyebrow: string;
      title: string;
      description: string;
      centerTitle: string;
      roles: string;
      secure: string;
      roleCount: string;
      trustOne: string;
      trustTwo: string;
    };
    register: {
      eyebrow: string;
      title: string;
      description: string;
      centerTitle: string;
      languages: string;
      radius: string;
      verified: string;
      trustOne: string;
      trustTwo: string;
    };
  };
};

const englishCopy: AuthCopy = {
  login: {
    title: "Welcome back",
    accent: "to KHVI Helper",
    description: "Sign in to track requests, create a help request, or support someone as an interpreter.",
    forgotPassword: "Forgot password?",
    forgotPasswordSoon: "This feature will be available in a later step.",
    resetPasswordTitle: "Reset your password",
    resetPasswordDescription: "Enter your email and we’ll send you a link to choose a new password.",
    resetPasswordSubmit: "Send reset link",
    resetPasswordSubmitting: "Sending reset link…",
    resetPasswordSuccess: "Check your email for a password reset link.",
    resetPasswordBack: "Back to sign in",
    resetPasswordInvalidLink: "This password reset link is invalid or has expired.",
    resetPasswordRequestNew: "Request a new reset link",
    resetPasswordUpdatedTitle: "Password updated",
    resetPasswordUpdatedBody: "Your recovery session is closed. Sign in again with your new password.",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Keep me signed in",
    submit: "Sign in",
    submitting: "Signing in…",
    fastLoginTitle: "Development fast login:",
    fastLoginNote: "Uses test accounts in Supabase Auth and is disabled in production.",
    successTitle: "Signed in successfully",
    successBody: (name, role) => `Welcome ${name} (role: ${role}). Redirecting…`,
    emptyEmail: "Enter your email.",
    invalidEmail: "Enter a valid email address.",
    emptyPassword: "Enter your password.",
    profileError: "Unable to load your profile.",
    genericError: "Something went wrong while signing in. Please try again.",
    fastLoginError: "Unable to connect to Fast Login.",
    fastLoginRoleMismatch: "The test account does not match the selected role.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    noAccount: "Don’t have an account yet?",
    signUp: "Sign up",
  },
  register: {
    eyebrow: "Create a new account",
    title: "Sign up",
    description: "Create an account to request language help from volunteer interpreters.",
    successTitle: "Account created",
    successBody: "Signing you in and taking you to Welcome…",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    phone: "Phone number",
    phoneHint: "Used to contact you after an interpreter accepts your request.",
    dateOfBirth: "Date of birth",
    age: (age) => `${age} years old`,
    firstNamePlaceholder: "e.g. Somchai or John",
    lastNamePlaceholder: "e.g. Jaidee or Doe",
    passwordPlaceholder: "At least 8 characters",
    confirmPasswordPlaceholder: "Enter your password again",
    cancel: "Cancel",
    submit: "Create account",
    submitting: "Creating account…",
    existingAccount: "Already have an account?",
    signInHere: "Sign in here",
    signUpHere: "Sign up here",
    profileError: "Unable to create your profile.",
    genericError: "Something went wrong while creating your account. Please try again.",
  },
  roleLabels: { User: "User", Interpreter: "Interpreter", Manager: "Manager", Admin: "Admin" },
  validation: {
    firstNameRequired: "Enter your first name.",
    firstNameMin: "First name must be at least 2 characters.",
    lastNameRequired: "Enter your last name.",
    lastNameMin: "Last name must be at least 2 characters.",
    emailRequired: "Enter your email.",
    emailInvalid: "Enter a valid email address.",
    passwordRequired: "Create a password.",
    passwordMin: "Password must be at least 8 characters.",
    confirmPasswordRequired: "Confirm your password.",
    passwordsMismatch: "Passwords do not match.",
    phoneRequired: "Enter your phone number.",
    phoneInvalid: "Enter a valid phone number (e.g. 0812345678).",
    dateOfBirthRequired: "Select your date of birth.",
    dateOfBirthInvalid: "Enter a valid date of birth.",
    minimumAge: "You must be at least 13 years old.",
    dateOfBirthRange: "Enter a valid date of birth.",
    localeInvalid: "The selected interface language is not supported.",
  },
  errors: {
    weakPassword: "Password does not meet the requirements. Use at least 8 characters.",
    emailExists: "This email already has an account. Sign in or use another email.",
    invalidEmail: "Enter a valid email address.",
    loginFallback: "Email or password is incorrect.",
    registerFallback: "Unable to create your account. Check your details and try again.",
  },
  side: {
    login: {
      eyebrow: "Welcome back",
      title: "Continue helping\nand connecting people",
      description: "Sign in to manage missions, support people, or keep the community running smoothly.",
      centerTitle: "KHVI Helper Portal",
      roles: "User · Volunteer · Manager · Admin",
      secure: "Secure sign in",
      roleCount: "4 roles supported",
      trustOne: "Your personal data is protected throughout the journey.",
      trustTwo: "You will be taken to the dashboard for your role automatically.",
    },
    register: {
      eyebrow: "KHVI Helper Platform",
      title: "Open the door to\nnearby language help",
      description: "Join a volunteer network supporting people who need language help in urgent situations.",
      centerTitle: "Connect through care",
      languages: "Burmese · Chinese · English · Sign",
      radius: "5 km radius",
      verified: "Verified interpreters",
      trustOne: "Personal details stay protected until a request is accepted.",
      trustTwo: "Volunteer interpreters are reviewed by a Manager.",
    },
  },
};

const thaiCopy: AuthCopy = {
  login: {
    title: "ยินดีต้อนรับกลับมา",
    accent: "สู่ KHVI Helper",
    description: "เข้าสู่ระบบเพื่อติดตามงาน ปักหมุดขอความช่วยเหลือ หรือปฏิบัติหน้าที่ล่าม",
    forgotPassword: "ลืมรหัสผ่าน?",
    forgotPasswordSoon: "ฟังก์ชันนี้จะเปิดใช้งานในขั้นตอนถัดไป",
    resetPasswordTitle: "ตั้งรหัสผ่านใหม่",
    resetPasswordDescription: "กรอกอีเมล แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
    resetPasswordSubmit: "ส่งลิงก์ตั้งรหัสผ่าน",
    resetPasswordSubmitting: "กำลังส่งลิงก์…",
    resetPasswordSuccess: "ตรวจสอบอีเมลของคุณเพื่อใช้ลิงก์ตั้งรหัสผ่านใหม่",
    resetPasswordBack: "กลับไปเข้าสู่ระบบ",
    resetPasswordInvalidLink: "ลิงก์ตั้งรหัสผ่านนี้ไม่ถูกต้องหรือหมดอายุแล้ว",
    resetPasswordRequestNew: "ขอลิงก์ใหม่",
    resetPasswordUpdatedTitle: "เปลี่ยนรหัสผ่านสำเร็จ",
    resetPasswordUpdatedBody: "ระบบปิดเซสชันกู้คืนแล้ว กรุณาเข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่",
    passwordPlaceholder: "กรอกรหัสผ่านของคุณ",
    rememberMe: "จดจำการเข้าสู่ระบบไว้",
    submit: "เข้าสู่ระบบ",
    submitting: "กำลังเข้าสู่ระบบ…",
    fastLoginTitle: "เข้าสู่ระบบด่วนสำหรับการพัฒนา:",
    fastLoginNote: "ใช้บัญชีทดสอบใน Supabase Auth และไม่แสดงใน production",
    successTitle: "เข้าสู่ระบบสำเร็จ",
    successBody: (name, role) => `ยินดีต้อนรับคุณ ${name} (บทบาท: ${role}) กำลังนำทาง...`,
    emptyEmail: "กรุณากรอกอีเมล",
    invalidEmail: "รูปแบบอีเมลไม่ถูกต้อง",
    emptyPassword: "กรุณากรอกรหัสผ่าน",
    profileError: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
    genericError: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
    fastLoginError: "ไม่สามารถเชื่อมต่อ Fast Login ได้",
    fastLoginRoleMismatch: "บัญชีทดสอบมี role ไม่ตรงกับปุ่มที่เลือก",
    showPassword: "แสดงรหัสผ่าน",
    hidePassword: "ซ่อนรหัสผ่าน",
    noAccount: "ยังไม่มีบัญชีใช่ไหม?",
    signUp: "สมัครสมาชิก",
  },
  register: {
    eyebrow: "สร้างบัญชีผู้ใช้ใหม่ · New Account",
    title: "สมัครสมาชิก",
    description: "กรอกข้อมูลเพื่อเริ่มต้นใช้งานและขอความช่วยเหลือด้านภาษากับล่ามจิตอาสา",
    successTitle: "สมัครสมาชิกสำเร็จ",
    successBody: "ระบบกำลังเข้าสู่ระบบและนำท่านไปยังหน้า Welcome...",
    firstName: "ชื่อ",
    lastName: "นามสกุล",
    email: "อีเมล",
    password: "รหัสผ่าน",
    confirmPassword: "ยืนยันรหัสผ่าน",
    phone: "เบอร์โทรศัพท์",
    phoneHint: "สำหรับติดต่อเมื่อมีล่ามกดรับงานแล้ว",
    dateOfBirth: "วันเดือนปีเกิด",
    age: (age) => `อายุ ${age} ปี`,
    firstNamePlaceholder: "เช่น สมชาย หรือ John",
    lastNamePlaceholder: "เช่น ใจดี หรือ Doe",
    passwordPlaceholder: "อย่างน้อย 8 ตัวอักษร",
    confirmPasswordPlaceholder: "กรอกรหัสผ่านอีกครั้ง",
    cancel: "ยกเลิก",
    submit: "สมัครสมาชิก",
    submitting: "กำลังสร้างบัญชี...",
    existingAccount: "มีบัญชีอยู่แล้ว?",
    signInHere: "เข้าสู่ระบบที่นี่",
    signUpHere: "สมัครสมาชิกที่นี่",
    profileError: "ไม่สามารถสร้างข้อมูลโปรไฟล์ได้",
    genericError: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง",
  },
  roleLabels: { User: "ผู้ขอรับบริการ", Interpreter: "ล่ามจิตอาสา", Manager: "ผู้จัดการ", Admin: "ผู้ดูแลระบบ" },
  validation: {
    firstNameRequired: "กรุณากรอกชื่อ",
    firstNameMin: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
    lastNameRequired: "กรุณากรอกนามสกุล",
    lastNameMin: "นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
    emailRequired: "กรุณากรอกอีเมล",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    passwordRequired: "กรุณากำหนดรหัสผ่าน",
    passwordMin: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    confirmPasswordRequired: "กรุณายืนยันรหัสผ่าน",
    passwordsMismatch: "รหัสผ่านไม่ตรงกัน",
    phoneRequired: "กรุณากรอกเบอร์โทรศัพท์",
    phoneInvalid: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678)",
    dateOfBirthRequired: "กรุณาเลือกวันเดือนปีเกิด",
    dateOfBirthInvalid: "วันเดือนปีเกิดไม่ถูกต้อง",
    minimumAge: "ผู้ใช้งานต้องมีอายุอย่างน้อย 13 ปีขึ้นไป",
    dateOfBirthRange: "กรุณาระบุวันเดือนปีเกิดที่ถูกต้อง",
    localeInvalid: "กรุณาเลือกภาษาหน้าจอที่รองรับ",
  },
  errors: {
    weakPassword: "รหัสผ่านไม่ผ่านเงื่อนไข กรุณาใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร",
    emailExists: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น",
    invalidEmail: "รูปแบบอีเมลไม่ถูกต้อง",
    loginFallback: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    registerFallback: "ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง",
  },
  side: {
    login: {
      eyebrow: "ยินดีต้อนรับกลับมา",
      title: "สานต่อความช่วยเหลือ\nและภารกิจด้านภาษา",
      description: "เข้าสู่ระบบเพื่อจัดการภารกิจ ช่วยเหลือผู้คน หรือตรวจสอบความเรียบร้อยของชุมชน",
      centerTitle: "KHVI Helper Portal",
      roles: "ผู้ใช้ · ล่าม · ผู้จัดการ · ผู้ดูแลระบบ",
      secure: "เข้าสู่ระบบปลอดภัย",
      roleCount: "รองรับ 4 สิทธิ์",
      trustOne: "คุ้มครองข้อมูลส่วนบุคคลในทุกขั้นตอน",
      trustTwo: "ระบบจะนำทางไปยังแดชบอร์ดตามสิทธิ์ของคุณโดยอัตโนมัติ",
    },
    register: {
      eyebrow: "KHVI Helper Platform",
      title: "เปิดประตูสู่ความช่วยเหลือ\nด้านภาษาที่ใกล้ตัวคุณ",
      description: "ร่วมเป็นส่วนหนึ่งของเครือข่ายจิตอาสาและผู้ต้องการความช่วยเหลือด้านภาษาในสถานการณ์เร่งด่วน",
      centerTitle: "เชื่อมโยงผู้คนด้วยใจ",
      languages: "Burmese · Chinese · English · Sign",
      radius: "รัศมี 5 กม.",
      verified: "ล่ามผ่านการรับรอง",
      trustOne: "คุ้มครองข้อมูลส่วนบุคคล พิกัดละเอียดเปิดเผยหลังรับงานเท่านั้น",
      trustTwo: "ล่ามอาสาทุกคนผ่านการตรวจสอบคุณสมบัติโดย Manager",
    },
  },
};

const chineseCopy: AuthCopy = {
  ...englishCopy,
  login: {
    ...englishCopy.login,
    title: "欢迎回来",
    accent: "进入 KHVI Helper",
    description: "登录以跟踪请求、创建求助，或作为口译员帮助他人。",
    forgotPassword: "忘记密码？",
    forgotPasswordSoon: "此功能将在后续步骤中开放。",
    resetPasswordInvalidLink: "此密码重置链接无效或已过期。",
    resetPasswordRequestNew: "重新申请重置链接",
    resetPasswordUpdatedTitle: "密码已更新",
    resetPasswordUpdatedBody: "恢复会话已关闭。请使用新密码重新登录。",
    passwordPlaceholder: "请输入密码",
    rememberMe: "保持登录状态",
    submit: "登录",
    submitting: "正在登录…",
    fastLoginTitle: "开发用快速登录：",
    fastLoginNote: "使用 Supabase Auth 测试账户，生产环境不会显示。",
    successTitle: "登录成功",
    successBody: (name, role) => `欢迎你，${name}（角色：${role}）。正在跳转…`,
    emptyEmail: "请输入邮箱。",
    invalidEmail: "请输入有效的邮箱地址。",
    emptyPassword: "请输入密码。",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    noAccount: "还没有账户？",
    signUp: "立即注册",
  },
  register: {
    ...englishCopy.register,
    eyebrow: "创建新账户",
    title: "注册",
    description: "创建账户，向志愿口译员申请语言帮助。",
    successTitle: "注册成功",
    successBody: "正在登录并前往 Welcome…",
    firstName: "名字",
    lastName: "姓氏",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    phone: "电话号码",
    phoneHint: "口译员接受请求后用于联系你。",
    dateOfBirth: "出生日期",
    age: (age) => `${age} 岁`,
    firstNamePlaceholder: "例如：小明",
    lastNamePlaceholder: "例如：王",
    passwordPlaceholder: "至少 8 个字符",
    confirmPasswordPlaceholder: "再次输入密码",
    cancel: "取消",
    submit: "创建账户",
    submitting: "正在创建账户…",
    existingAccount: "已有账户？",
    signInHere: "在此登录",
    signUpHere: "在此注册",
    profileError: "无法创建个人资料。",
    genericError: "创建账户时发生错误，请重试。",
  },
  roleLabels: { User: "用户", Interpreter: "口译员", Manager: "经理", Admin: "管理员" },
  side: {
    login: {
      eyebrow: "欢迎回来",
      title: "继续提供帮助\n连接每一个人",
      description: "登录以管理任务、帮助他人或维护社区秩序。",
      centerTitle: "KHVI Helper Portal",
      roles: "用户 · 口译员 · 经理 · 管理员",
      secure: "安全登录",
      roleCount: "支持 4 种角色",
      trustOne: "全程保护你的个人资料。",
      trustTwo: "系统会自动带你前往对应角色的控制面板。",
    },
    register: {
      eyebrow: "KHVI Helper Platform",
      title: "打开身边的\n语言帮助之门",
      description: "加入志愿网络，为紧急情况下需要语言帮助的人提供支持。",
      centerTitle: "用心连接彼此",
      languages: "缅甸语 · 中文 · 英语 · 手语",
      radius: "5 公里范围",
      verified: "认证口译员",
      trustOne: "请求被接受前，个人详细资料会受到保护。",
      trustTwo: "志愿口译员会由经理审核。",
    },
  },
};

const spanishCopy: AuthCopy = {
  ...englishCopy,
  login: {
    ...englishCopy.login,
    title: "Bienvenido de nuevo",
    accent: "a KHVI Helper",
    description: "Inicia sesión para seguir solicitudes, crear una petición de ayuda o apoyar a alguien como intérprete.",
    forgotPassword: "¿Olvidaste tu contraseña?",
    forgotPasswordSoon: "Esta función estará disponible más adelante.",
    resetPasswordInvalidLink: "Este enlace para restablecer la contraseña no es válido o ha caducado.",
    resetPasswordRequestNew: "Solicitar un enlace nuevo",
    resetPasswordUpdatedTitle: "Contraseña actualizada",
    resetPasswordUpdatedBody: "La sesión de recuperación se cerró. Inicia sesión de nuevo con tu nueva contraseña.",
    passwordPlaceholder: "Introduce tu contraseña",
    rememberMe: "Mantener la sesión iniciada",
    submit: "Iniciar sesión",
    submitting: "Iniciando sesión…",
    fastLoginTitle: "Inicio rápido para desarrollo:",
    fastLoginNote: "Usa cuentas de prueba de Supabase Auth y no aparece en producción.",
    successTitle: "Sesión iniciada correctamente",
    successBody: (name, role) => "Bienvenido, " + name + " (rol: " + role + "). Redirigiendo…",
    emptyEmail: "Introduce tu correo electrónico.",
    invalidEmail: "Introduce un correo electrónico válido.",
    emptyPassword: "Introduce tu contraseña.",
    noAccount: "¿Aún no tienes una cuenta?",
    signUp: "Regístrate",
    profileError: "No se pudo cargar tu perfil.",
    genericError: "Se produjo un error al iniciar sesión. Inténtalo de nuevo.",
    fastLoginError: "No se pudo conectar con el inicio rápido.",
    fastLoginRoleMismatch: "La cuenta de prueba no coincide con el rol seleccionado.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
  },
  register: {
    ...englishCopy.register,
    eyebrow: "Crear una cuenta nueva",
    title: "Registrarse",
    description: "Crea una cuenta para solicitar ayuda lingüística a intérpretes voluntarios.",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    phone: "Número de teléfono",
    phoneHint: "Se utilizará para contactarte cuando un intérprete acepte tu solicitud.",
    dateOfBirth: "Fecha de nacimiento",
    age: (age) => String(age) + " años",
    firstNamePlaceholder: "p. ej., María",
    lastNamePlaceholder: "p. ej., García",
    passwordPlaceholder: "Al menos 8 caracteres",
    confirmPasswordPlaceholder: "Introduce la contraseña de nuevo",
    cancel: "Cancelar",
    submit: "Crear cuenta",
    submitting: "Creando cuenta…",
    existingAccount: "¿Ya tienes una cuenta?",
    signInHere: "Inicia sesión aquí",
    signUpHere: "Regístrate aquí",
    genericError: "Se produjo un error al crear la cuenta. Inténtalo de nuevo.",
  },
  roleLabels: { User: "Usuario", Interpreter: "Intérprete", Manager: "Gestor", Admin: "Administrador" },
  validation: {
    ...englishCopy.validation,
    firstNameRequired: "Introduce tu nombre.",
    lastNameRequired: "Introduce tus apellidos.",
    emailRequired: "Introduce tu correo electrónico.",
    emailInvalid: "Introduce un correo electrónico válido.",
    passwordRequired: "Crea una contraseña.",
    passwordMin: "La contraseña debe tener al menos 8 caracteres.",
    confirmPasswordRequired: "Confirma tu contraseña.",
    passwordsMismatch: "Las contraseñas no coinciden.",
    phoneRequired: "Introduce tu número de teléfono.",
    phoneInvalid: "Introduce un número de teléfono válido.",
    dateOfBirthRequired: "Selecciona tu fecha de nacimiento.",
    dateOfBirthInvalid: "Introduce una fecha de nacimiento válida.",
    minimumAge: "Debes tener al menos 13 años.",
    dateOfBirthRange: "Introduce una fecha de nacimiento válida.",
    localeInvalid: "El idioma seleccionado no es compatible.",
  },
  errors: {
    ...englishCopy.errors,
    weakPassword: "La contraseña no cumple los requisitos. Usa al menos 8 caracteres.",
    emailExists: "Este correo ya tiene una cuenta. Inicia sesión o usa otro correo.",
    invalidEmail: "Introduce un correo electrónico válido.",
    loginFallback: "El correo o la contraseña no son correctos.",
    registerFallback: "No se pudo crear la cuenta. Comprueba los datos e inténtalo de nuevo.",
  },
  side: {
    ...englishCopy.side,
    login: { ...englishCopy.side.login, eyebrow: "Bienvenido de nuevo", title: "Sigue ayudando y conectando personas", roles: "Usuario · Intérprete · Gestor · Administrador", secure: "Inicio de sesión seguro", roleCount: "4 roles disponibles" },
    register: { ...englishCopy.side.register, title: "Abre la puerta a la ayuda lingüística cercana", centerTitle: "Conectar con empatía", languages: "Birmano · Chino · Inglés · Lengua de signos", radius: "Radio de 5 km", verified: "Intérpretes verificados" },
  },
};

const arabicCopy: AuthCopy = {
  ...englishCopy,
  login: {
    ...englishCopy.login,
    title: "مرحبًا بعودتك",
    accent: "إلى KHVI Helper",
    description: "سجّل الدخول لمتابعة الطلبات أو إنشاء طلب مساعدة أو دعم الآخرين كمترجم.",
    forgotPassword: "هل نسيت كلمة المرور؟",
    forgotPasswordSoon: "ستتوفر هذه الميزة في خطوة لاحقة.",
    resetPasswordInvalidLink: "رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته.",
    resetPasswordRequestNew: "طلب رابط جديد",
    resetPasswordUpdatedTitle: "تم تحديث كلمة المرور",
    resetPasswordUpdatedBody: "تم إغلاق جلسة الاسترداد. سجّل الدخول مرة أخرى باستخدام كلمة المرور الجديدة.",
    passwordPlaceholder: "أدخل كلمة المرور",
    rememberMe: "إبقائي مسجّلًا",
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول…",
    fastLoginTitle: "تسجيل دخول سريع للتطوير:",
    fastLoginNote: "يستخدم حسابات اختبار في Supabase Auth ولا يظهر في الإنتاج.",
    successTitle: "تم تسجيل الدخول بنجاح",
    successBody: (name, role) => "مرحبًا " + name + " (الدور: " + role + "). جارٍ التحويل…",
    emptyEmail: "أدخل بريدك الإلكتروني.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صالحًا.",
    emptyPassword: "أدخل كلمة المرور.",
    profileError: "تعذر تحميل ملفك الشخصي.",
    genericError: "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.",
    fastLoginError: "تعذر الاتصال بتسجيل الدخول السريع.",
    fastLoginRoleMismatch: "حساب الاختبار لا يطابق الدور المحدد.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    noAccount: "ليس لديك حساب؟",
    signUp: "سجّل الآن",
  },
  register: {
    ...englishCopy.register,
    eyebrow: "إنشاء حساب جديد",
    title: "إنشاء حساب",
    description: "أنشئ حسابًا لطلب المساعدة اللغوية من المترجمين المتطوعين.",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    phone: "رقم الهاتف",
    phoneHint: "يُستخدم للتواصل معك بعد قبول مترجم لطلبك.",
    dateOfBirth: "تاريخ الميلاد",
    age: (age) => String(age) + " عامًا",
    firstNamePlaceholder: "مثل: أحمد",
    lastNamePlaceholder: "مثل: علي",
    passwordPlaceholder: "8 أحرف على الأقل",
    confirmPasswordPlaceholder: "أدخل كلمة المرور مرة أخرى",
    cancel: "إلغاء",
    submit: "إنشاء الحساب",
    submitting: "جارٍ إنشاء الحساب…",
    existingAccount: "لديك حساب بالفعل؟",
    signInHere: "سجّل الدخول هنا",
    signUpHere: "أنشئ حسابًا هنا",
    genericError: "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.",
  },
  roleLabels: { User: "مستخدم", Interpreter: "مترجم", Manager: "مدير", Admin: "مسؤول النظام" },
  validation: {
    ...englishCopy.validation,
    firstNameRequired: "أدخل اسمك الأول.",
    lastNameRequired: "أدخل اسم العائلة.",
    emailRequired: "أدخل بريدك الإلكتروني.",
    emailInvalid: "أدخل بريدًا إلكترونيًا صالحًا.",
    passwordRequired: "أنشئ كلمة مرور.",
    passwordMin: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    confirmPasswordRequired: "أكد كلمة المرور.",
    passwordsMismatch: "كلمتا المرور غير متطابقتين.",
    phoneRequired: "أدخل رقم هاتفك.",
    phoneInvalid: "أدخل رقم هاتف صالحًا.",
    dateOfBirthRequired: "اختر تاريخ ميلادك.",
    dateOfBirthInvalid: "أدخل تاريخ ميلاد صالحًا.",
    minimumAge: "يجب أن يكون عمرك 13 عامًا على الأقل.",
    dateOfBirthRange: "أدخل تاريخ ميلاد صالحًا.",
    localeInvalid: "اللغة المحددة غير مدعومة.",
  },
  errors: {
    ...englishCopy.errors,
    weakPassword: "كلمة المرور لا تستوفي المتطلبات. استخدم 8 أحرف على الأقل.",
    emailExists: "هذا البريد مرتبط بحساب بالفعل. سجّل الدخول أو استخدم بريدًا آخر.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صالحًا.",
    loginFallback: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    registerFallback: "تعذر إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى.",
  },
  side: {
    ...englishCopy.side,
    login: { ...englishCopy.side.login, eyebrow: "مرحبًا بعودتك", title: "واصل المساعدة وربط الناس", roles: "مستخدم · مترجم · مدير · مسؤول النظام", secure: "تسجيل دخول آمن", roleCount: "4 أدوار مدعومة" },
    register: { ...englishCopy.side.register, title: "افتح باب المساعدة اللغوية القريبة", centerTitle: "نصل الناس بالعناية", languages: "البورمية · الصينية · الإنجليزية · لغة الإشارة", radius: "نطاق 5 كم", verified: "مترجمون موثوقون" },
  },
};

export function getAuthCopy(locale: Locale): AuthCopy {
  if (locale === "th") return thaiCopy;
  if (locale === "zh") return chineseCopy;
  if (locale === "es") return spanishCopy;
  if (locale === "ar") return arabicCopy;
  return englishCopy;
}
