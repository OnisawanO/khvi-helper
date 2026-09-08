# KHVI Team Responsibilities

เอกสารนี้แยกหน้าที่ของสมาชิก 6 คนตามโครงงานปัจจุบันของ KHVI Helper ใช้คู่กับ `detail.md` และ `route-inventory.md` ก่อนเริ่มทำ UI หรือเปิด Pull Request ใหม่

## ภาพรวมการแบ่งงาน

| คน | Feature Domain | เป้าหมายหลัก |
| :---: | :--- | :--- |
| คนที่ 1 | Identity, Auth & Localization | ทำให้ผู้ใช้สมัคร, เข้าสู่ระบบ, มีโปรไฟล์, มี role และเลือกภาษา UI ได้ |
| คนที่ 2 | SOS Pin Creation & Requester Hub | ทำให้ผู้ขอความช่วยเหลือสร้างหมุด SOS และติดตามคำขอของตัวเองได้ |
| คนที่ 3 | Interactive SOS Map & Visual Discovery | ทำให้ล่ามเห็นหมุดที่ตรงกับภาษา/หมวดหมู่ และกรองงานบนแผนที่ได้ |
| คนที่ 4 | Volunteer Portal & Matching Engine | ทำให้ผู้ใช้สมัครเป็นล่าม, รออนุมัติ และกดรับงานที่ตรงความสามารถได้ |
| คนที่ 5 | Mission Status & Contact Tracking | ทำให้ผู้ขอและล่ามติดตามงานเดียวกันหลัง claim ได้จนจบภารกิจ |
| คนที่ 6 | Manager/Admin Backoffice & Quality | ทำให้ผู้ดูแลตรวจใบสมัคร, จัดการผู้ใช้ และดูแล review/support/report ได้ |

---

## คนที่ 1: Identity, Auth & Localization

**ขอบเขต UI**

- `/login` หรือ `app/(auth)/login/page.tsx`
- `/register` หรือ `app/(auth)/register/page.tsx`
- `/profile` หรือ `app/profile/page.tsx`
- Language Switcher ใน header/layout
- หน้า redirect หลัง login ตาม role

**Component ที่ต้องทำ**

- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx`
- `components/auth/ProfileForm.tsx`
- `components/layout/LanguageSwitcher.tsx`
- Auth error/empty/loading states

**Logic ที่เกี่ยวข้อง**

- Supabase Auth: sign up, sign in, sign out
- สร้างหรืออัปเดต profile ที่ผูกกับ `auth.users.id`
- จัดการ `role`: `User`, `Interpreter`, `Manager`, `Admin`
- `middleware.ts` สำหรับป้องกัน route ตาม role
- `actions/auth-actions.ts`

**ขอบเขต MVP**

- ผู้ใช้ใหม่สมัครแล้วได้ role เป็น `User`
- Login แล้วระบบพาไปหน้าเหมาะกับ role
- ผู้ใช้แก้ไขข้อมูลโปรไฟล์พื้นฐานและภาษา UI ได้

**จุดส่งต่องาน**

- ส่ง user/session/role ให้คนที่ 2, 4, 5, 6 ใช้ตรวจสิทธิ์หน้า UI
- ต้องตกลงชื่อ field profile กับคนที่ 4 และ 6 ก่อนต่อ Supabase จริง

---

## คนที่ 2: SOS Pin Creation & Requester Hub

**ขอบเขต UI**

- `/welcome` หรือ `app/welcome/page.tsx`
- `/request-help` หรือ `app/request-help/page.tsx`
- `/my-requests` หรือ `app/my-requests/page.tsx`
- หน้ารอผลหลังสร้างหมุด
- รายการคำขอของผู้ใช้ แยกตามสถานะ `Open`, `Claimed`, `InProgress`, `Completed`, `Cancelled`, `Expired`

**Component ที่ต้องทำ**

- `components/pin-request/PinForm.tsx`
- `components/pin-request/SOSButton.tsx`
- `components/pin-request/LocationPicker.tsx`
- `components/pin-request/RequestStatus.tsx`
- `components/pin-request/RadarWaiting.tsx`

**Logic ที่เกี่ยวข้อง**

- ดึงตำแหน่งด้วย Geolocation API
- สร้าง record ใน `bookings`
- บันทึก `language_id`, `category_id`, `description`, `latitude`, `longitude`, `location_name`, `urgency`, `scheduled_at`, `expires_at`
- ตั้งสถานะเริ่มต้นเป็น `Open`
- `actions/pin-actions.ts`

**ขอบเขต MVP**

- ผู้ใช้เลือกภาษา 1 ภาษาและหมวดหมู่ 1 หมวด
- งานเร่งด่วนต้องมีเวลาหมดอายุ
- งานนัดหมายต้องอยู่ในกรอบไม่เกิน 1 วันตาม requirement ล่าสุด
- ผู้ใช้เห็นรายการคำขอของตัวเองและกดเข้า `/mission/[id]` ได้

**จุดส่งต่องาน**

- ส่งข้อมูล `bookings` ให้คนที่ 3 แสดงบนแผนที่
- ส่ง `booking_id` ให้คนที่ 5 ใช้ในหน้า mission

---

## คนที่ 3: Interactive SOS Map & Visual Discovery

**ขอบเขต UI**

- `/map` หรือ `app/map/page.tsx`
- แผนที่ Leaflet สำหรับล่ามที่ได้รับอนุมัติ
- แถบ filter ภาษา, หมวดหมู่, ระยะทาง, ความเร่งด่วน
- marker งานเร่งด่วนและงานนัดหมาย
- modal สรุปหมุดก่อน claim

**Component ที่ต้องทำ**

- `components/map/LeafletMap.tsx`
- `components/map/CustomMarkers.tsx`
- `components/map/MapFilterBar.tsx`
- `components/map/PinSummaryModal.tsx`
- `components/map/ApproximateLocationLayer.tsx`

**Logic ที่เกี่ยวข้อง**

- Query `bookings` เฉพาะ `status = 'Open'`
- แสดงเฉพาะงานที่ match `language_id` และ `category_id` กับความสามารถของล่าม
- ซ่อนพิกัดจริงก่อน claim โดยแสดงพื้นที่คร่าว ๆ
- เตรียมข้อมูลให้ปุ่ม claim ของคนที่ 4

**ขอบเขต MVP**

- ล่ามเห็นเฉพาะหมุดที่ตัวเองมีสิทธิ์รับ
- หมุดที่ถูก claim แล้วต้องหายจากรายการ open pins
- UI ต้องแยกงาน `Immediate` กับ `Scheduled`

**จุดส่งต่องาน**

- รับ interpreter profile และ skill set จากคนที่ 4
- ส่ง `booking_id` ที่เลือกให้คนที่ 4 ทำ claim
- เมื่อ claim สำเร็จ ให้พาไป `/mission/[id]` ของคนที่ 5

---

## คนที่ 4: Volunteer Portal & Matching Engine

**ขอบเขต UI**

- `/volunteer/apply` หรือ `app/volunteer/apply/page.tsx`
- `/volunteer/status` หรือ `app/volunteer/status/page.tsx`
- `/volunteer/dashboard` หรือ `app/volunteer/dashboard/page.tsx`
- ส่วนแสดงงานที่ตรงความสามารถ
- ปุ่ม claim งาน

**Component ที่ต้องทำ**

- `components/volunteer/ApplicationForm.tsx`
- `components/volunteer/ApplicationStatus.tsx`
- `components/volunteer/VolunteerDashboard.tsx`
- `components/volunteer/SkillSelector.tsx`
- `components/volunteer/ClaimButton.tsx`

**Logic ที่เกี่ยวข้อง**

- ตาราง `interpreter_profiles`
- ตาราง `languages`, `categories`
- ตารางเชื่อม `interpreter_languages`, `interpreter_categories`
- สถานะใบสมัคร `Pending`, `Approved`, `Rejected`
- Postgres RPC `claim_booking` สำหรับกันการรับงานซ้ำ
- `actions/volunteer-actions.ts`

**ขอบเขต MVP**

- ผู้ใช้สมัครเป็นล่ามได้ แต่ยังคง role เป็น `User` ระหว่างรออนุมัติ
- เมื่อ Manager/Admin อนุมัติ ระบบเปลี่ยน role เป็น `Interpreter`
- ล่ามที่ approved เท่านั้นจึงเห็น dashboard งานและกด claim ได้
- MVP ไม่ต้องมี `is_available`

**จุดส่งต่องาน**

- ส่งข้อมูลภาษา/หมวดหมู่ของล่ามให้คนที่ 3 ใช้กรอง map
- ส่งสถานะใบสมัครให้คนที่ 6 ใช้ตรวจอนุมัติ
- เมื่อ claim สำเร็จ ต้องอัปเดต booking ให้คนที่ 5 ใช้ต่อ

---

## คนที่ 5: Mission Status & Contact Tracking

**ขอบเขต UI**

- `/mission/[id]` หรือ `app/mission/[id]/page.tsx`
- หน้ารายละเอียดภารกิจที่ใช้ร่วมกันระหว่าง User และ Interpreter
- Timeline สถานะงาน
- ข้อมูลติดต่อหลัง claim
- ปุ่มเริ่มงาน, ยืนยันจบงาน, ยกเลิกงาน

**Component ที่ต้องทำ**

- `components/mission/MissionHeader.tsx`
- `components/mission/StatusTimeline.tsx`
- `components/mission/ContactCard.tsx`
- `components/mission/ExecutionControls.tsx`
- `components/mission/CompletionConfirm.tsx`
- `components/mission/CancelMissionDialog.tsx`

**Logic ที่เกี่ยวข้อง**

- อ่านและอัปเดต `bookings`
- ใช้ field `claimed_at`, `requester_confirmed_at`, `started_at`, `ended_at`, `user_confirmed_done_at`, `interpreter_confirmed_done_at`, `cancelled_by`, `cancel_reason`
- เปิดเผยพิกัดจริงและข้อมูลติดต่อเฉพาะหลัง claim
- `actions/mission-actions.ts`

**ขอบเขต MVP**

- ผู้ขอและล่ามเห็นข้อมูล mission เดียวกันตามสิทธิ์ของตัวเอง
- `Claimed` กดเริ่มงานได้
- `InProgress` ต้องให้ทั้งสองฝ่ายยืนยันจบ ก่อนเปลี่ยนเป็น `Completed`
- ถ้าล่ามยกเลิกใน `Claimed` ก่อนหมดอายุ ให้เปิดหมุดกลับเป็น `Open`; ถ้ายกเลิกใน `InProgress` ให้เป็น `Cancelled`
- MVP ไม่รวมระบบแชท

**จุดส่งต่องาน**

- รับ `booking_id` จากคนที่ 2, 3, 4
- เมื่อ `Completed` ส่งต่อให้คนที่ 6 เปิด review flow

---

## คนที่ 6: Manager/Admin Backoffice & Quality

**ขอบเขต UI**

- `/manager` หรือ `app/manager/page.tsx`
- `/manager/verify-volunteers` หรือ `app/manager/verify-volunteers/page.tsx`
- `/admin` หรือ `app/admin/page.tsx`
- `/admin/users` หรือ `app/admin/users/page.tsx`
- Review modal หรือหน้า review หลัง mission completed
- หน้า report/help request เมื่อเริ่มทำฟีเจอร์ support

**Component ที่ต้องทำ**

- `components/manager/VolunteerVerifyCard.tsx`
- `components/manager/ApplicationDetailPanel.tsx`
- `components/manager/HelpRequestList.tsx`
- `components/admin/UserTable.tsx`
- `components/admin/RoleEditor.tsx`
- `components/review/ReviewModal.tsx`
- `components/review/StarRating.tsx`

**Logic ที่เกี่ยวข้อง**

- อนุมัติ/ปฏิเสธ `interpreter_profiles`
- อัปเดต role ผู้สมัครเป็น `Interpreter` เมื่อ approved
- ตาราง `reviews`
- ตาราง `notifications`, `reports`, `help_requests` เมื่อเริ่มทำฟีเจอร์เสริม
- Trigger หรือ action สำหรับคำนวณ `average_rating`
- `actions/manager-actions.ts`, `actions/admin-actions.ts`, `actions/review-actions.ts`

**ขอบเขต MVP**

- Manager/Admin เห็นรายการใบสมัครล่าม
- Manager/Admin อนุมัติหรือปฏิเสธพร้อมเหตุผลได้
- Admin จัดการ role ผู้ใช้ได้
- Review ทำหลัง `Completed` เท่านั้น
- notification, report และ help request แยกทำหลัง core flow ได้

**จุดส่งต่องาน**

- รับข้อมูลใบสมัครจากคนที่ 4
- ส่งผลอนุมัติกลับให้คนที่ 4 เปลี่ยนหน้า status/dashboard
- รับ mission completed จากคนที่ 5 เพื่อเปิด review

---

## ข้อตกลงร่วมก่อนรวมงาน

- ทุก route ที่เพิ่มต้องอัปเดต `docs/route-inventory.md`
- ทุกคนใช้ชื่อ table และ status ตาม `detail.md`
- ทุกคนทำ loading, empty, error และ unauthorized state ของหน้าตัวเอง
- ก่อนเปิด Pull Request ต้องรัน lint/build ตามคำสั่งของโปรเจกต์
