import type { Locale } from "@/app/components/site-header";
import type { UserRole } from "@/app/lib/mock-auth";

export type AuthCopy = {
  login: {
    title: string;
    accent: string;
    description: string;
    forgotPassword: string;
    forgotPasswordSoon: string;
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
    noSessionError: string;
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
    noSessionError: "Account created, but no session is available. Check the Supabase Confirm email setting.",
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
    noSessionError: "สมัครสมาชิกแล้ว แต่ยังไม่มี session ให้ใช้งาน กรุณาตรวจสอบการตั้งค่า Confirm email ใน Supabase",
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
    noSessionError: "账户已创建，但没有可用 session。请检查 Supabase 的 Confirm email 设置。",
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

export function getAuthCopy(locale: Locale): AuthCopy {
  if (locale === "th") return thaiCopy;
  if (locale === "zh") return chineseCopy;
  return englishCopy;
}
