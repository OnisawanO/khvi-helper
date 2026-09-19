# Database Integration Handoff

เอกสารนี้เป็นคู่มือสำหรับ agent และสมาชิกทีมที่ต้องพัฒนาต่อจาก branch ที่มี database-backed flow ของ KHVI Helper

## สรุปสถาปัตยกรรม

- Database คือ Supabase PostgreSQL
- Identity, password และ session ใช้ Supabase Auth
- ข้อมูล application ใช้ตารางใน `public` schema โดยอ้าง `auth.users.id` ผ่าน `public.profiles.user_id`
- Server Actions ใช้ Supabase RPC สำหรับ mutation ที่ต้องตรวจสิทธิ์ เปลี่ยน status หรือทำหลายขั้นตอนใน transaction เดียว
- Server data loader ใช้ `@supabase/ssr` และ session cookie ของผู้ใช้
- Certificate ใช้ Supabase Storage bucket ชื่อ `interpreter-certificates` ซึ่งเป็น private bucket
- `supabase/config.toml` เปิด Realtime ไว้ แต่ application flow ปัจจุบันยังไม่มี subscription ผ่าน `channel()` หรือ `postgres_changes`; หน้าเว็บใช้ Server Action และ `revalidatePath()`

ให้ยึด source code และ migration ปัจจุบันเป็นหลักเมื่อเอกสาร roadmap ระบุสถานะเก่ากว่า implementation

## วิธีเชื่อมต่อจาก Next.js

Environment ที่ต้องมีใน `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ใช้ได้ทั้ง browser และ server เพราะเป็น publishable key ตามชื่อ environment ห้ามนำ `service_role` key หรือ secret key มาใส่ใน client code หรือ commit ลง repository

ใช้ client ตาม execution boundary:

| Boundary | Import | วิธีใช้ |
|---|---|---|
| Client Component | `@/utils/supabase/client` | `const supabase = createClient()` |
| Server Component หรือ Server Action | `@/utils/supabase/server` | `const supabase = await createClient()` |
| Session refresh | `@/utils/supabase/middleware` ผ่าน `proxy.ts` | `getClaims()` แล้วส่ง cookie ที่ refresh แล้วต่อไปยัง request |

ห้ามสร้าง Supabase client แบบใหม่ใน feature โดยอ่าน cookie เอง ห้ามใช้ direct PostgreSQL connection และห้ามเพิ่ม ORM โดยไม่ตกลง architecture ก่อน

## Session และ profile

Supabase Auth เป็น source of truth ของ account เมื่อสร้าง user ใหม่ trigger `private.handle_new_user()` จะสร้างแถวใน `public.profiles` ให้โดยอัตโนมัติ

`app/lib/supabase-auth.ts` ใช้ `auth.getUser()` แล้วอ่าน `public.profiles` ของ `user_id` เดียวกันผ่าน `getCurrentUserProfile()`

Role ที่ระบบรองรับ:

```text
User | Interpreter | Manager | Admin
```

`profiles` เปิด RLS และให้ผู้ใช้ที่ login แล้วอ่านหรือแก้ไขเฉพาะ profile ของตนเอง ฟิลด์ role, lock status และสิทธิ์สำคัญต้องเปลี่ยนผ่าน server-side authorization เมื่อมี feature รองรับในอนาคต อย่าใช้ `user_metadata` เป็นแหล่งตัดสินสิทธิ์

Fast Login ใช้เฉพาะ development ผ่าน `FAST_LOGIN_*` server environment variables และ `/api/auth/fast-login` ไม่ควรนำไปใช้เป็น production login flow

## Schema ที่มีอยู่จริง

ความสัมพันธ์หลัก:

```text
auth.users
  1 ── 1 public.profiles
             ├──< public.interpreter_applications
             │       ├──< public.interpreter_application_languages >── public.languages
             │       └──< public.interpreter_application_categories >── public.categories
             └──< public.bookings
                     ├── 1 public.booking_private_details
                     └──< public.mission_locations >── public.profiles
```

ตารางหลัก:

| Table | หน้าที่ | ข้อควรจำ |
|---|---|---|
| `public.profiles` | application profile และ role | `user_id` เป็น UUID จาก `auth.users.id` |
| `public.languages` | reference ภาษา | อ่านเฉพาะรายการที่ `is_active = true` |
| `public.categories` | reference หมวดหมู่งาน | อ่านเฉพาะรายการที่ `is_active = true` |
| `public.interpreter_applications` | ใบสมัครล่าม | มี active application ได้หนึ่งรายการต่อ user |
| `public.interpreter_application_languages` | junction ใบสมัครกับภาษา | ใช้ `is_primary` และ `language_level` |
| `public.interpreter_application_categories` | junction ใบสมัครกับหมวดหมู่ | ใช้ matching skill |
| `public.bookings` | คำขอและสถานะภารกิจ | เก็บพิกัดพื้นที่แบบหยาบเท่านั้น |
| `public.booking_private_details` | ที่อยู่และพิกัดจริง | เปิดผ่าน guarded RPC ตามสิทธิ์ |
| `public.mission_locations` | ตำแหน่งล่าสุดของแต่ละ actor | ห้ามอ่านหรือเขียน table โดยตรงจาก client |

`public.bookings.area_latitude` และ `area_longitude` ถูกปัดเหลือ 2 ตำแหน่งตอนสร้างงาน ส่วนพิกัดจริงอยู่ใน `booking_private_details` และเปิดให้ interpreter หลัง requester ยืนยัน interpreter แล้ว

## วิธีอ่านข้อมูล

ใช้ direct table query เฉพาะข้อมูลที่ RLS อนุญาต:

- Profile: `getCurrentUserProfile()` ใน `app/lib/supabase-auth.ts`
- Reference: `languages` และ `categories` ใน `app/lib/real-request-data.ts` หรือ `app/lib/real-interpreter-application-data.ts`
- Booking list: อ่าน `bookings` แล้ว filter ตาม user, interpreter หรือ open pool ใน `app/lib/real-request-data.ts`
- Interpreter application: อ่าน application และ junction tables ใน `app/lib/real-interpreter-application-data.ts`

ข้อมูล private ของ booking ต้องใช้ RPC เหล่านี้:

- `get_booking_private_details`
- `get_booking_contacts`
- `get_mission_locations`

RPC เหล่านี้ตรวจ actor ใน database ก่อนคืนข้อมูล อย่าเพิ่ม query ที่อ่าน `booking_private_details` หรือ `mission_locations` ตรง ๆ เพื่อหลบ authorization

ตัวอย่าง server-side read:

```ts
import { createClient } from "@/utils/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase
  .from("bookings")
  .select("booking_id, status, user_id")
  .eq("status", "open");
```

## วิธีเขียนข้อมูล

Booking และ interpreter application ใช้ Server Action ที่เรียก RPC เท่านั้น

### Booking RPC

| RPC | หน้าที่ | Result |
|---|---|---|
| `create_booking` | สร้างคำขอและ private details | `booking_id` |
| `claim_booking` | claim แบบ lock row ป้องกันรับงานซ้ำ | `booking_id` |
| `confirm_booking_interpreter` | requester ยืนยัน interpreter | void |
| `start_booking` | เริ่มงานหลัง requester ยืนยัน | void |
| `confirm_booking_completion` | บันทึกการยืนยันจบงานของแต่ละฝ่าย | void |
| `cancel_booking` | ยกเลิกหรือถอนตัวตาม status | void |
| `update_booking_details` | แก้รายละเอียดก่อนเริ่มงาน | void |
| `save_mission_location` | upsert ตำแหน่งล่าสุดของ actor | void |

Entry point อยู่ที่ `app/actions/booking-actions.ts`

### Interpreter application RPC

| RPC | หน้าที่ | Result |
|---|---|---|
| `submit_interpreter_application` | สร้างหรือแก้ใบสมัครพร้อม language/category links | `application_id` |
| `cancel_interpreter_application` | ยกเลิกใบสมัครของตนเอง | void |
| `reupload_interpreter_certificate` | ส่งเอกสารใหม่เมื่อระบบขอแก้ไขหรือใบสมัครถูกปฏิเสธ | void |
| `review_interpreter_application` | Manager/Admin อนุมัติ ขอแก้ไข หรือปฏิเสธ | void |

Entry point อยู่ที่ `app/actions/interpreter-application-actions.ts`

ตัวอย่าง mutation:

```ts
"use server";

import { createClient } from "@/utils/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase.rpc("claim_booking", {
  p_booking_id: Number(bookingId),
});
```

ห้ามย้าย validation หรือ authorization ไปไว้เฉพาะใน component เพราะ RPC เป็นจุดบังคับใช้ business rule ฝั่ง server/database

## Business rule ที่ database บังคับใช้

Booking status ใช้ค่าภายใน database ดังนี้:

```text
open -> claimed -> in_progress -> completed
  ├-> expired
  └-> cancelled
```

- User ห้าม claim booking ของตนเอง
- Claim ได้เฉพาะ profile ที่ role เป็น `Interpreter`, ไม่ locked และมี application `approved` ที่ตรงทั้งภาษาและหมวดหมู่
- Interpreter ที่มีงาน `claimed` หรือ `in_progress` อยู่แล้วห้าม claim งานใหม่
- `start_booking` ต้องเกิดหลัง requester ยืนยัน interpreter
- `completed` จะเกิดเมื่อ requester และ interpreter ยืนยันจบงานครบทั้งสองฝ่าย
- การถอนตัวจาก `claimed` จะคืนงานเป็น `open` หากยังไม่พ้น deadline
- การถอนตัวจาก `in_progress` จะเปลี่ยนเป็น `cancelled`
- Scheduled booking ต้องมีเวลานัดอย่างน้อยวันถัดไป
- Immediate booking หมดอายุหลัง 30 นาที

Interpreter application status ใช้ค่าภายใน database ดังนี้:

```text
pending | under_review | needs_revision | approved | rejected | cancelled
```

เมื่อ Manager/Admin approve ระบบจะเปลี่ยน `profiles.role` ของผู้สมัครเป็น `Interpreter`

## RLS, grants และ Storage

- ตารางที่อยู่ใน `public` schema เปิด RLS ใน migration
- `anon` ไม่มีสิทธิ์อ่านหรือเขียนข้อมูล domain
- `authenticated` เข้าถึงตาม policy ที่ผูกกับ `auth.uid()` และ role ใน `profiles`
- Application mutation revoke direct table write ใน migration ล่าสุดแล้ว ส่วน `bookings` และ `booking_private_details` ยังมีสิทธิ์ insert สำหรับ `authenticated` ตาม policy เดิม แต่ application code ต้องใช้ RPC เพื่อรักษา validation, expiry, private details และ atomic flow
- RPC ที่อยู่ใน `public` ต้อง `revoke all ... from public` และ grant เฉพาะ role ที่ต้องใช้
- `SECURITY DEFINER` ที่มีอยู่ต้องคง `auth.uid()` check และ `set search_path = public, pg_temp` ไว้
- ห้ามใช้ `service_role` key ใน browser หรือ Server Action ของ user-facing flow

Certificate upload ใช้ bucket private:

```text
interpreter-certificates/{auth.uid()}/{uuid}-{safe-file-name}
```

Upload ทำใน `uploadInterpreterCertificateAction()` หลังตรวจชนิดไฟล์และขนาดไม่เกิน 10 MB จากนั้นจึงส่ง path เข้า `submit_interpreter_application` หรือ `reupload_interpreter_certificate`

## Migration workflow

Project นี้ใช้ imperative migration ใน `supabase/migrations/` และไม่ได้ใช้ `supabase/schemas/`

ลำดับ migration ปัจจุบัน:

1. `20260914000100_create_profiles.sql`
2. `20260914000200_create_reference_and_interpreter_application_tables.sql`
3. `20260917000100_update_ui_language_options.sql`
4. `20260917085611_real_flow_bookings_and_mission.sql`
5. `20260917094342_real_interpreter_application_flow.sql`
6. `20260917095513_real_interpreter_certificate_storage.sql`
7. `20260917100148_complete_interpreter_reference_catalog.sql`

เมื่อต้องเปลี่ยน schema, policy, RPC หรือ Storage ให้เพิ่ม migration ใหม่ตามลำดับ ห้ามแก้ migration ที่เคย apply ไปแล้วใน shared project

ตัวอย่าง local workflow:

```bash
npm ci
cp .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev
```

ก่อนใช้ remote project ต้อง link project ให้ถูกต้องและตรวจ migration ก่อน `db push` เสมอ การ push schema ไป shared หรือ production ต้องได้รับอนุมัติจากผู้ดูแลโครงการ

ใน repository ยังไม่มี `supabase/seed.sql` หรือ committed test users ดังนั้น local reset ไม่ได้สร้างบัญชี Fast Login ให้เอง บัญชีทดสอบต้องมีทั้ง Supabase Auth user และ `public.profiles` ที่ตรงกัน

## สถานะของ feature บน branch นี้

เชื่อม database แล้ว:

- `/request-help` สร้าง booking ผ่าน `create_booking`
- `/my-requests`, `/find-requests`, `/my-assignments` อ่าน booking จริง
- `/my-requests/[requestId]` อ่าน booking และข้อมูล private ผ่าน guarded RPC
- Claim, confirm, start, complete, cancel และ mission location ใช้ booking RPC
- `/volunteer/apply` อ่าน reference จริงและส่ง application จริง
- `/volunteer/status` อ่านและจัดการ application จริง
- Manager application queue อ่านข้อมูลจริงและ review ผ่าน RPC

ยังเป็น mock หรือยังไม่เชื่อมใน domain อื่น:

- `/admin` ยังใช้ mock dashboard data
- Manager tickets, reports และ activity บางส่วนยังใช้ mock data
- Review, notification, audit log และ report ยังไม่อยู่ใน migration ชุดนี้
- Realtime config เปิดอยู่ แต่ application ยังใช้ request/response และ cache revalidation แทน realtime subscription

`docs/route-inventory.md`, `detail.md` และ role documents บางส่วนยังมีข้อความที่อธิบาย route หรือ status เป็น mock/planned จากช่วงก่อนเชื่อม database เอกสารนี้บันทึก implementation ปัจจุบันจาก source code และ migration หากจะขยาย feature ให้ผ่าน Requirement Consistency Gate และอัปเดตเอกสารที่เกี่ยวข้องใน PR เดียวกัน

## ไฟล์อ้างอิงหลัก

- `supabase/config.toml`
- `supabase/migrations/`
- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/middleware.ts`
- `app/lib/supabase-auth.ts`
- `app/lib/real-request-data.ts`
- `app/lib/real-interpreter-application-data.ts`
- `app/actions/booking-actions.ts`
- `app/actions/interpreter-application-actions.ts`
- `.env.example`

ก่อนแก้ database contract ให้ตรวจ source files และ migration เหล่านี้พร้อมกัน แล้วรัน `npm run lint` และ `npm run build`
