"use client";
import type { Locale } from "./site-header";

export function VisitorLanguages({ locale }: { locale: Locale }) {
  const th = locale === "th", zh = locale === "zh", es = locale === "es", ar = locale === "ar";
  const languages = [
    ["EN", th ? "อังกฤษ" : zh ? "英语" : es ? "Inglés" : ar ? "الإنجليزية" : "English"],
    ["TH", th ? "ไทย" : zh ? "泰语" : es ? "Tailandés" : ar ? "التايلاندية" : "Thai"],
    ["ZH", th ? "จีน" : zh ? "中文" : es ? "Chino" : ar ? "الصينية" : "Chinese"],
    ["MY", th ? "พม่า" : zh ? "缅甸语" : es ? "Birmano" : ar ? "البورمية" : "Burmese"],
    ["VI", th ? "เวียดนาม" : zh ? "越南语" : es ? "Vietnamita" : ar ? "الفيتنامية" : "Vietnamese"],
  ] as const;
  return <div className="mt-6"><p className="text-sm font-bold">{th ? "ภาษาที่ขอความช่วยเหลือได้" : zh ? "可请求的语言" : es ? "Idiomas que puedes solicitar" : ar ? "اللغات التي يمكنك طلبها" : "Languages you can request"}</p><ul className="mt-3 flex flex-wrap gap-2">{languages.map(([code, name]) => <li key={code} className="inline-flex items-center gap-2 rounded-full border border-(--khvi-teal)/25 bg-white px-3 py-1.5 text-xs font-semibold"><span className="text-(--khvi-teal)">{code}</span><span>{name}</span></li>)}</ul><p className="mt-3 text-xs leading-6 text-(--khvi-ink)/70">{th ? "การรับงานขึ้นอยู่กับล่ามที่ตรงเงื่อนไข ไม่รับประกันว่าจะมีผู้รับคำขอทันที" : zh ? "接单取决于符合条件的口译员，无法保证立即有人接单。" : es ? "La aceptación depende de intérpretes adecuados. No se garantiza una coincidencia inmediata." : ar ? "يعتمد القبول على توفر مترجمين مناسبين، ولا نضمن وجود تطابق فوري." : "Acceptance depends on suitable interpreters. An immediate match is not guaranteed."}</p><p className="mt-3 border-l-2 border-(--khvi-coral) pl-3 text-xs leading-6 text-(--khvi-ink)/75">{th ? "บริการช่วยสื่อสารด้านภาษา หากมีอันตรายฉุกเฉิน ให้ติดต่อหน่วยงานฉุกเฉินในพื้นที่ก่อน" : zh ? "此服务协助语言沟通。如有紧急危险，请先联系当地紧急救援服务。" : es ? "Este servicio apoya la comunicación lingüística. En caso de peligro inmediato, contacta primero con los servicios de emergencia locales." : ar ? "تدعم هذه الخدمة التواصل اللغوي. عند وجود خطر فوري، اتصل بخدمات الطوارئ المحلية أولًا." : "This service supports language communication. For immediate danger, contact local emergency services first."}</p></div>;
}

export function VisitorFaq({ locale }: { locale: Locale }) {
  const th = locale === "th", zh = locale === "zh", es = locale === "es", ar = locale === "ar";
  const items = th ? [
    ["ต้องมีบัญชีก่อนขอความช่วยเหลือไหม", "ต้องเข้าสู่ระบบก่อนสร้างคำขอ เพื่อกลับมาติดตามสถานะและยืนยันจบภารกิจได้"],
    ["ฉันเป็นคนเลือกล่ามเองหรือไม่", "คุณเลือกภาษา หมวดหมู่ และสถานที่ ล่ามที่ผ่านการอนุมัติและตรงเงื่อนไขจะเลือกกดรับงาน จากนั้นคุณตรวจสอบและยืนยันล่าม"],
    ["หากไม่มีล่ามรับคำขอจะเกิดอะไรขึ้น", "คำขอด่วนหมดอายุหลังสร้าง 30 นาที ส่วนคำขอนัดหมายหมดอายุเมื่อถึงเวลานัด หากยังไม่มีล่ามรับงาน"],
    ["ข้อมูลติดต่อจะเปิดเผยเมื่อใด", "ตามขั้นตอนบริการ ข้อมูลติดต่อและพิกัดละเอียดเปิดหลังผู้ขอยืนยันล่าม ก่อนหน้านั้นใช้ข้อมูลพื้นที่กว้าง ๆ"],
    ["สมัครเป็นล่ามได้อย่างไร", "เตรียมภาษา หมวดหมู่ ช่องทางติดต่อ และประสบการณ์ แล้วรอผู้ดูแลอนุมัติ ในรุ่นต้นแบบนี้ระบบยื่นใบสมัครยังไม่เปิดใช้งาน"],
  ] : zh ? [
    ["需要账户吗？", "创建请求前需要登录，以便跟踪进度并确认完成。"],
    ["我可以自己选择口译员吗？", "您选择语言、类别和地点，符合条件的口译员自行接单，然后由您查看并确认。"],
    ["无人接单怎么办？", "无人接单时，紧急请求在创建30分钟后过期，预约请求在预约时间过期。"],
    ["何时开放联系方式？", "求助者确认口译员后才开放联系方式和详细位置，此前仅显示大致区域。"],
    ["如何成为口译员？", "准备语言、类别、联系方式和经验，并等待审批。此预览版本尚未开放申请提交。"],
  ] : es ? [
    ["¿Necesito una cuenta?", "Inicia sesión antes de crear una solicitud para poder seguir su progreso y confirmar la finalización."],
    ["¿Elijo yo mismo al intérprete?", "Elige el idioma, la categoría y el lugar. Un intérprete aprobado y adecuado acepta la solicitud; después la revisas y confirmas."],
    ["¿Qué ocurre si nadie acepta mi solicitud?", "Las solicitudes urgentes sin aceptar caducan después de 30 minutos. Las solicitudes programadas caducan a la hora de la cita."],
    ["¿Cuándo se comparten los datos de contacto?", "Los datos de contacto y la ubicación exacta se desbloquean después de que el solicitante confirme al intérprete."],
    ["¿Cómo puedo ser intérprete?", "Prepara tus idiomas, categorías, canales de contacto y experiencia para la revisión. El envío de solicitudes aún no está disponible en esta vista previa."],
  ] : ar ? [
    ["هل أحتاج إلى حساب؟", "سجّل الدخول قبل إنشاء الطلب حتى تتمكن من متابعة تقدمه وتأكيد إتمامه."],
    ["هل أختار المترجم بنفسي؟", "اختر اللغة والفئة والمكان. يقبل مترجم معتمد ومناسب الطلب، ثم تراجعه وتؤكده."],
    ["ماذا يحدث إذا لم يقبل أحد طلبي؟", "تنتهي الطلبات العاجلة غير المقبولة بعد 30 دقيقة، وتنتهي الطلبات المجدولة عند وقت الموعد."],
    ["متى تتم مشاركة بيانات الاتصال؟", "تُفتح بيانات الاتصال والموقع الدقيق بعد أن يؤكد صاحب الطلب المترجم."],
    ["كيف أصبح مترجمًا؟", "جهّز لغاتك وفئاتك وقنوات الاتصال وخبرتك للمراجعة. إرسال الطلب غير متاح في هذه المعاينة بعد."],
  ] : [
    ["Do I need an account?", "Sign in before creating a request so you can follow its progress and confirm completion."],
    ["Do I choose an interpreter myself?", "Choose a language, category and location. A suitable approved interpreter claims the request, then you review and confirm them."],
    ["What happens if nobody claims my request?", "Unclaimed urgent requests expire after 30 minutes. Scheduled requests expire at the appointment time."],
    ["When are contact details shared?", "The service flow unlocks contact details and exact locations after requester confirmation. Before that, only the broad area is shown."],
    ["How can I become an interpreter?", "Prepare your languages, categories, contact channels and experience for review. Application submission is not available in this preview yet."],
  ];
  return <section id="faq" className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:px-12"><p className="text-sm font-bold text-(--khvi-teal)">{th ? "ก่อนเริ่มใช้งาน" : zh ? "开始之前" : es ? "Antes de comenzar" : ar ? "قبل البدء" : "Before you begin"}</p><h2 className="mt-2 text-3xl font-bold">{th ? "คำถามที่พบบ่อย" : zh ? "常见问题" : es ? "Preguntas frecuentes" : ar ? "الأسئلة الشائعة" : "Frequently asked questions"}</h2><div className="mt-6 divide-y divide-(--khvi-teal)/20 border-y border-(--khvi-teal)/20">{items.map(([q, a]) => <details key={q} className="group py-1"><summary className="cursor-pointer rounded-lg py-5 pr-5 font-bold focus-visible:outline-2 focus-visible:outline-(--khvi-sun)">{q}</summary><p className="max-w-3xl pb-5 text-sm leading-8 text-(--khvi-ink)/75">{a}</p></details>)}</div></section>;
}
