# Welcome UI update · 2026-09-13

งานนี้ปรับหน้าแรกและ Welcome ตามคำขอผู้ใช้ โดยใช้สี ฟอนต์ และ component เดิม ให้ผู้มาใหม่เริ่มใช้งานได้ และให้ผู้ที่ล็อกอินเห็นงานที่ต้องทำต่อก่อนคู่มือ

> สถานะปัจจุบัน 2026-09-23: หน้า workspace `/user` และ `/interpreter` อ่าน `bookings`, `languages` และ `categories` จาก Supabase ตาม session/RLS แล้ว ส่วน request-help ตาม role อ่าน catalog จาก Supabase และสร้าง booking ผ่าน `create_booking` RPC รายละเอียด mock ด้านล่างเป็นบันทึกประวัติและไม่ใช่ data source ปัจจุบัน

## ขอบเขตและผลตรวจความสอดคล้อง

| ประเด็น | หลักฐาน | ผลตรวจและการใช้งานในงานนี้ |
|---|---|---|
| หน้าเริ่มต้นสามกลุ่ม | requirements FR-03/04, user-flows, route-inventory | สอดคล้อง: ผู้มาใหม่ใช้ `/`, User ใช้ `/user` และ Interpreter ใช้ `/interpreter` |
| ข้อมูลรายบัญชี | request-store และ mock-auth ไม่มี owner ID ในคำขอ | ยังไม่พร้อม: แสดงเป็นข้อมูลในเบราว์เซอร์ ไม่อ้างว่าเป็นงานที่เป็นเจ้าของหรือผลจับคู่ที่ยืนยันแล้ว |
| การเปิดข้อมูลติดต่อ | FR-10/11 และ user-flows ต้องยืนยันล่าม; request detail เดิมปลดล็อกหลัง Claim | ขัดแย้งเดิม: Welcome แสดงเฉพาะชื่อ/ภาษาล่ามและคำแนะนำตาม requirement ไม่เปลี่ยนการปลดล็อกหรือ state machine ในหน้ารายละเอียด |
| จำกัดงานที่ยังไม่จบ | requirements หมวด 5; store รองรับหลายรายการ | ต่างจากเป้าหมาย: ปุ่มหลักบน Welcome เน้นกลับสู่งานปัจจุบัน มีทางดูทั้งหมด ไม่เพิ่มกฎบังคับใน store |
| โปรไฟล์ ใบสมัคร และรีวิว | FR-14/15/16; ไม่มี data source/route สำหรับดำเนินการ | ยังไม่พร้อม: มีส่วนแนะนำและสถานะไม่เปิดใช้งาน ไม่สร้างสถานะ Pending/Approved หรือรีวิวขึ้นมาเอง |
| การค้นหา | FR-07; `/interpreter/find-requests` มีแผนที่ต้นแบบ | สอดคล้องกับต้นแบบ: เพิ่มตัวกรองภาษา หมวดหมู่ และรัศมีบนรายการในเครื่อง พิกัด GPS อยู่ใน component memory เท่านั้น |

## สิ่งที่เพิ่ม

- หน้าแรก: แถบภาษา FAQ ป้ายแผนที่ตัวอย่าง ขอบเขตบริการ และ login/register intent ที่พา User ไปสร้างคำขอหรือส่วนข้อมูลสมัครล่ามบน Welcome หลังเข้าสู่ระบบ
- User: คำขอปัจจุบัน ขั้นตอนถัดไป ป้ายความเร่งด่วน countdown จาก expiresAt ชื่อล่ามเมื่อมีข้อมูล รายการล่าสุด ข้อมูลสมัครล่าม และสถานะระบบรีวิว
- Interpreter: ภารกิจในเครื่องที่ยังดำเนินอยู่ ตัวกรองงาน GPS/รัศมี ประวัติในเครื่อง และสถานะข้อมูลโปรไฟล์
- ระบบภาษา UI รองรับ English, Chinese, Thai, Spanish และ Arabic โดย Arabic ใช้ทิศทาง RTL; ภาษาที่ล่ามให้บริการยังคงเป็นข้อมูลอีกชุดหนึ่ง
- Login/Register modal รองรับข้อความจุดประสงค์ วน keyboard focus ภายใน modal และคืน focus เมื่อปิด

## การตรวจสอบรอบนี้

- lint, production build และ request-store tests 6 เคสผ่าน
- ตรวจเบราว์เซอร์จริง: การเลือกภาษาไทย ปุ่มขอความช่วยเหลือเปิด login พร้อม intent, Quick Login User ไปหน้าสร้างคำขอ, กลับ Welcome และสร้างคำขอทดสอบเพื่อให้เห็น active card
- Quick Login Interpreter แสดงเนื้อหาตามบทบาท ตัวกรองภาษาเปลี่ยนจากรายการที่ตรงเป็น empty state ได้
- FAQ เปิดคำตอบได้ ตรวจหน้าจอ 390, 768 และ 1440 พิกเซลตามหน้าที่ทดสอบ ไม่พบ horizontal overflow; พบปุ่มสีข้อความผิดระหว่างตรวจและแก้ก่อนตรวจซ้ำ
- Next.js /_next/mcp get_errors ไม่พบ config/session errors
- ยังไม่ได้ตรวจ GPS สำเร็จโดยใช้พิกัดจริง ไม่ได้ทดสอบ approval/review/atomic Claim เพราะ backend ส่วนนี้ยังไม่มี
- Post-change gate: ไม่เพิ่ม route, schema, ownership, availability switch หรือการเปลี่ยนสถานะงาน ข้อจำกัด production ข้างต้นยังคงอยู่

---

## บันทึกก่อนการปรับรอบนี้ (historical)

# Welcome workspace (task scope)

`/user#welcome-user` is the signed-in starting view for User and `/interpreter#welcome-Interpreter` is the signed-in starting view for Interpreter. Both views share the same header. The header shows the signed-in profile; its dropdown contains Profile & Settings and sign-out actions. Manager and Admin continue to their existing consoles. Visitors return to `/#top`. This describes the current implementation paths; server and client authorization still enforce the signed-in role.

## Consistency review

| Topic | Evidence | Decision |
|---|---|---|
| User starting page | requirements FR-04, user-flows.txt | Show service guidance and working links to create and track requests. |
| Interpreter starting page | Existing documents plan an interpreter dashboard; the current user request asks for Welcome for both roles. | Use role-specific Welcome content for this task. The map remains planned. |
| Authentication | mock-auth.ts stores sessions locally; requirements FR-01 and server authorization are future integration work. | Use the existing session for navigation and presentation. This is not a security boundary. |
| Request activity | request-store.ts stores device-wide records with no requester or interpreter identity. | Label activity as saved on this device. Interpreter routes may show status-based request summaries for preview, but must not present them as account-owned or skill-matched data. |
| Interpreter jobs | Matching, claims and account-scoped job history use Supabase data. | Use `/interpreter/find-requests` for open summaries and `/interpreter/my-assignments` for claimed, in-progress or completed summaries. |
| Privacy | FR-10/11 require requester confirmation before sensitive details unlock. | Explain the confirmation gate consistently in the requester and interpreter guidance. |
| Scheduling | Scheduled requests start on the next calendar day and have no maximum future date. | Explain the next-day minimum; scheduled requests still expire at the appointment time. |

No database schema, claim workflow, request ownership or server authorization is changed. Existing design tokens, header, footer, badges and navigation anchors are reused. Welcome displays the signed-in name and role in a profile menu, with sign-out inside that menu, plus role-specific links. There is no availability switch, chat or rating data.

Production work still requires Supabase sessions, server authorization and account-scoped records. Canonical requirements and route governance remain unchanged by this task-specific design.

## Verification

- `npm run lint` and `npm run build` passed.
- Existing development server: `http://localhost:3000`. `/_next/mcp` `get_errors` returned empty configuration and session errors.
- Browser checks cover role-specific workspace entry, sign-out to `/#top`, requester links, role-specific Back to main paths, interpreter guide anchor and Chinese language switching.
- Checked layouts at 390, 768 and 1440 pixels with no horizontal overflow. Also checked overflow at 320 pixels. The requester empty state was exercised; populated records retain existing request-store and status-badge contracts.
- LSP CLI was unavailable; source reads, reference searches and the TypeScript build covered import/type verification.
- Post-change review keeps claim, contact-unlock, scheduling and database contracts unchanged. The implementation remains a mock workspace.
