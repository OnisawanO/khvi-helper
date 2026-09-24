# Requirement Consistency Checklist

ใช้เอกสารนี้ก่อนและหลังงานที่เกี่ยวข้องกับ requirement, business behavior, role/permission, route หรือ database model

## 1. Task Scope

- [ ] ระบุ requirement และ behavior ที่ task นี้แตะ
- [ ] ระบุ role, route, status, entity และ API/data contract ที่ได้รับผลกระทบ
- [ ] แยกสิ่งที่เป็น implementation ปัจจุบันออกจากสิ่งที่เป็นแผนงาน

## 2. Sources To Read

- [ ] Source code และ configuration ปัจจุบัน
- [ ] Database schema หรือ migration ที่มีอยู่จริง
- [ ] `docs/requirements.md`
- [ ] `docs/user-flows.txt`
- [ ] `detail.md`
- [ ] เอกสาร role ที่เกี่ยวข้อง เช่น `docs/manager-detail.md` หรือ `docs/admin-detail.md`
- [ ] `docs/route-inventory.md` เมื่อมีผลต่อ route
- [ ] `docs/development-workflow.md` และ `AGENTS.md` เมื่อแก้กติกาหรือ workflow

## 3. Conflict Matrix

| ประเด็น | Requirement | Use case / User flow | Database relation / Schema | Source code / Route | ผลตรวจ |
|---|---|---|---|---|---|
| | | | | | สอดคล้อง / ขัดแย้ง / ยังไม่ชัดเจน |

ตรวจอย่างน้อย:

- [ ] ชื่อ entity/table/field และความสัมพันธ์
- [ ] Role และ permission
- [ ] Status transition และเงื่อนไขเวลา
- [ ] ข้อมูลที่เปิดเผยก่อนและหลังการยืนยัน/Claim
- [ ] Route access, parameter และ not-found behavior
- [ ] Validation, authorization และ side effect

## 4. Decision Gate

- [ ] ไม่มี conflict ที่กระทบ scope, business rule, permission, status, schema หรือ API contract
- [ ] ข้อไม่ชัดเจนถูกตัดสินใจแล้ว หรือถูกยกระดับถามผู้ใช้
- [ ] บันทึก decision ที่จะยึดและไฟล์ที่จะเปลี่ยน
- [ ] หากยังมี conflict สำคัญ หยุด implementation และรอคำตอบ

## 5. Post-change Verification

- [ ] ตรวจ diff เทียบกับ requirement และ conflict matrix อีกครั้ง
- [ ] ตรวจเอกสารที่เกี่ยวข้องให้ใช้ชื่อและกติกาเดียวกัน
- [ ] รัน lint, build และ test ที่เกี่ยวข้องตามขอบเขตงาน
- [ ] รายงาน conflict ที่พบ, decision ที่เลือก และความเสี่ยงที่เหลือ

## Auth Completion Review Record

Task scope: Supabase signup without email confirmation, SSR/PKCE recovery callback, server-side role routing, remember-me cookie lifetime, password recovery, canonical private-route refresh, `/login` direct form and `/sign-in` compatibility.

| ประเด็น | Requirement | Use case / User flow | Database relation / Schema | Source code / Route | ผลตรวจ |
|---|---|---|---|---|---|
| Email confirmation | ไม่บังคับยืนยันอีเมลก่อนเข้า private route | สมัครสำเร็จต้องมี session และใช้งานต่อได้ทันที | ใช้ Supabase Auth config; ไม่เพิ่ม schema | `supabase/config.toml`, `app/api/auth/register/route.ts`, `getCurrentUserProfile` | สอดคล้อง |
| Registration identity fields | เบอร์โทรศัพท์และวันเดือนปีเกิดเป็นข้อมูลบังคับ; วันเดือนปีเกิดแสดง วัน เดือน ปี; อีเมลซ้ำต้องแจ้งว่ามีผู้ใช้นี้แล้ว | กรอกข้อมูลสมัครครบก่อนสร้างบัญชี และแก้ไขข้อมูลเมื่อพบอีเมลซ้ำ | ใช้ Supabase Auth email uniqueness; ไม่เพิ่ม schema | `app/components/auth/register-form.tsx`, `app/components/auth/date-picker.tsx`, `app/api/auth/register/route.ts` | สอดคล้อง |
| Protected actions/API | session ต้องมี user และ profile/role ที่อนุญาต | private page/action/API ยังตรวจสิทธิ์ฝั่ง server | ใช้ `auth.uid()`/profile/RLS; ไม่ใช้ email confirmation เป็น gate | workspace guards, profile/interpreter actions, manager/admin actions, certificate API | สอดคล้อง |
| Role routing | พาไป workspace ตาม role และตรวจฝั่ง server | User/Interpreter/Manager/Admin ไป canonical role home | ใช้ `profiles.role` | `app/api/auth/login/route.ts`, `app/user/**`, `app/interpreter/**`, `app/manager/layout.tsx`, `app/admin/page.tsx` | สอดคล้อง |
| Remember me | ค่าเริ่มต้นไม่เลือก; เลือกแล้วใช้ persistent cookie แบบ absolute ไม่เกิน 15 วัน; ไม่เลือกใช้ session cookie | ปิด/เปิด browser แล้ว session อยู่ต่อเฉพาะกรณีที่เลือก และ refresh ห้ามต่อ deadline | ไม่เปลี่ยน schema; ใช้ cookie marker/deadline ที่ไม่ใช่ token | `app/components/auth/login-form.tsx`, `app/api/auth/login/route.ts`, `utils/supabase/{auth-persistence,client,server,middleware}.ts`, `proxy.ts` | สอดคล้อง |
| Recovery | ไม่เปิดเผย account existence และปิด recovery session หลังเปลี่ยนรหัสผ่าน | ลิงก์ผิด/หมดอายุขอลิงก์ใหม่ได้ | ใช้ Supabase Auth recovery session | `app/api/auth/{forgot-password,reset-password,callback}/route.ts`, reset form | สอดคล้อง |
| Route compatibility | `/login` direct, `/sign-in` redirect, หน้าแรกเปิด modal | ลิงก์เดิมยังเปิด login modal ได้ | ไม่กระทบ business tables | `app/login/page.tsx`, `app/sign-in/page.tsx`, `app/page.tsx` | สอดคล้อง |

Decision: ปิด email confirmation ตาม requirement ล่าสุด โดยคง recovery email/password flow ไว้; ยึด route structure ปัจจุบันใน `app/` และใช้ Route Handler เฉพาะ auth API; ไม่เพิ่ม migration หรือ dependency ใหม่ และไม่ใช้ client role เป็น authorization source.
