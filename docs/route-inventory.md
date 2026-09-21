# KHVI Route Inventory

## UI language support

The global UI language switcher supports English (en), Chinese (zh), Thai (th), Spanish (es) and Arabic (ar). Arabic sets document direction to RTL. UI language is separate from interpreter service-language data.

## Role-specific request workspaces

- Source routes now use Next.js route groups to keep role ownership visible in the file tree without changing public URLs: `(public)`, `(auth)`, `(workspace)`, `(user)`, `(interpreter)`, `(manager)`, and `(admin)`.
- `User` uses `/request-help` to create a request and `/my-requests` to track requests created in the browser preview.
- `Interpreter` uses `/find-requests` to review open request summaries and `/my-assignments` to claim matching open requests or track claimed, in-progress and completed assignments.
- All four routes read the Supabase Auth session and redirect to the equivalent route when the signed-in role does not match.
- Interpreter lists reuse browser-local preview records. Profile matching, account ownership, claim actions and server authorization remain planned.
- `/find-requests` supports preview sorting by request creation time and by distance from the interpreter's browser GPS when location access is available.
- `/find-requests` renders an interactive Leaflet map with OpenStreetMap tiles, request markers and a browser-GPS marker when location access is available.
- Both roles use the same signed-in header and footer as `/welcome`; the navigation labels and paths change with the role.

## Shared profile route

- `/profile` is the shared authenticated Profile & Settings route for `User`, `Interpreter`, `Manager`, and `Admin`.
- The page reads the current Supabase Auth profile and redirects to `/#top` when no valid active session is available. Browser mock session fallback remains available for local preview without Supabase. Locked sessions cannot open the page.
- Every role can edit only their own first name, last name, phone, date of birth, and preferred UI language in the current preview. The browser-local session is updated after validation.
- Every role can change, crop, or remove an optional profile photo in the current preview. The cropped image is resized and stored as `avatarUrl` in the browser-local session; production storage and ownership checks remain planned.
- Approved Interpreter profiles can add, type, or remove service language and matching category selections in the current preview. The UI keeps at least one language and two categories, stores standard IDs or custom values in the browser-local session, and does not replace the planned `interpreter_languages` or `interpreter_categories` relations. Production must validate custom values against the system catalog before persistence.
- Role, lock status, interpreter approval status, and management permissions are shown as read-only context. Production ownership checks, Supabase persistence, role-specific profile tables, and server authorization remain planned.

## Requester preview flow update

- Entry: `/welcome`.
- Flow: welcome → `/request-help` → `/my-requests/[requestId]` → interpreter claim in `/find-requests` or the available-request section of `/my-assignments` → requester confirmation → interpreter start → dual completion. Both roles return to the same canonical detail route.
- Requester pages now share browser-local storage (`khvi-requester-v1`) and start empty. Example records are not presented as the user's requests.
- Creation, request detail edits during `Open` or `Claimed` before work starts, cancellation reasons and completion confirmations persist across reloads in the same browser. Storage errors leave the form available for retry.
- Mission detail watches the current actor's browser geolocation while an active mission page is open and stores updates in a separate browser-local preview store. Each role sees its own marker update automatically; the other party's exact marker appears only after requester confirmation. Tracking stops when the page closes or the mission is no longer active. Missing locations remain empty instead of using invented coordinates.
- Urgent requests expire 30 minutes after creation; scheduled requests expire at their appointment if still open. Absolute deadlines survive navigation.
- Missing GPS stays empty, without invented coordinates. A meeting-point description can be saved; map placement still needs map integration.
- These pages remain public previews, not authenticated production features. No request reaches a real interpreter. Server authorization, Supabase storage and interpreter actions remain pending.
- Malformed IDs return server 404. Unknown numeric IDs show a browser-local missing-request screen after loading (HTTP 200, because the server cannot read browser storage).
- Verification: `node --test app/lib/request-store.test.mjs`, `npm run lint`, `npm run build`.

This update supersedes the older mock-source and state-only behavior notes below.

เอกสารนี้เป็นรายการกลางของ path ในระบบ ใช้ตรวจสอบชื่อ route, สิทธิ์, data source และ behavior เมื่อไม่พบข้อมูล

## กติกา

- ใช้ path ภาษาอังกฤษ ตัวพิมพ์เล็ก และ hyphen คั่นคำ
- ใช้ dynamic segment เมื่อ path ระบุ resource จริง
- ตรวจสอบ parameter ก่อน query database หรือเรียก API
- อัปเดตเอกสารนี้พร้อม Pull Request ที่เพิ่มหรือแก้ route
- แยก route ที่มีอยู่จริงออกจาก route ที่เป็นแผนงาน

## Routes ที่มีอยู่ในโค้ดปัจจุบัน

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/` | Static | Public | None | Not applicable | Implemented at `app/(public)/page.tsx` |
| `/_not-found` | Framework fallback | Public | None | Framework fallback | Implemented at `app/not-found.tsx` |
| `/manager` | Static Mockup | Manager Role (Supabase session) | Mock data (FR-14–18) | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/(manager)/manager/page.tsx` |
| `/admin` | Static Mockup | Admin Role (Supabase session) | Mock data | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/(admin)/admin/page.tsx` |
| `/request-help` | Resource create route | Authenticated User (Supabase session; domain preview remains client-side) | `app/lib/request-store.ts` | Redirect Interpreter to `/find-requests` | Implemented at `app/(user)/request-help/page.tsx` |
| `/my-requests` | Requester resource list | Authenticated User (Supabase session; domain preview remains client-side) | `app/lib/request-store.ts` | Redirect Interpreter to `/my-assignments`; empty state | Implemented at `app/(user)/my-requests/page.tsx` |
| `/my-requests/[requestId]` | Dynamic resource | เจ้าของคำขอ หรือ Interpreter ที่ Claim แล้ว (Supabase session + browser preview ownership) | `app/lib/request-store.ts` | `notFound()` สำหรับ ID ผิดรูปแบบ; browser-local missing/unauthorized state สำหรับ record ที่อ่านไม่ได้ | Implemented shared mission preview at `app/(user)/my-requests/[requestId]/page.tsx` |
| `/find-requests` | Interpreter open-request list and claim entry | Authenticated Interpreter (Supabase session; domain preview remains client-side) | `app/lib/request-store.ts` open requests | Redirect User to `/request-help`; empty state; claim error stays on list | Implemented at `app/(interpreter)/find-requests/page.tsx` |
| `/my-assignments` | Interpreter available-request and assignment list | Authenticated Interpreter (Supabase session) | Supabase `bookings` visible through matching-open and assigned-row RLS policies | Redirect User to `/my-requests`; approval guidance or empty state | Implemented at `app/(interpreter)/my-assignments/page.tsx` |
| `/register` | Static auth route | Public | Supabase Auth + `public.profiles` trigger; UI locale is inherited from the Guest Welcome page | Not applicable | Implemented at `app/(auth)/register/page.tsx` |
| `/login` | Static auth route | Public | Supabase Auth + `public.profiles`; development-only Fast Login uses server credentials | Not applicable | Implemented at `app/(auth)/login/page.tsx` |
| `/api/auth/fast-login` | Auth action route | Development only; disabled in production | Supabase Auth accounts configured by `FAST_LOGIN_*` server environment variables | `400` invalid role; `503` missing dev account; `401` Auth failure | Implemented at `app/api/auth/fast-login/route.ts` |
| `/sign-in` | Static auth redirect | Public | None | Redirects to `/?signin=true` | Implemented at `app/(auth)/sign-in/page.tsx` |

`/my-requests` รับ query parameter `status` ค่าเดียวเท่านั้น: `open`, `claimed`, `in-progress`, `completed`, `cancelled`
ค่าที่ไม่รู้จักจะถูกลดรูปเป็น `all` โดยไม่ตอบ 404 เพราะ query parameter ไม่ใช่ตัวระบุ resource

`/my-assignments` แสดงงานเปิดที่ตรงความสามารถแยกจากงานที่รับแล้ว และรับ `status` เฉพาะ `claimed`, `in-progress` และ `completed` สำหรับกรองงานที่รับแล้ว ค่าอื่นจะถูกลดรูปเป็น `all`
ส่วน `/find-requests` ใช้ตัวกรอง `All`, `Urgent` และ `Scheduled` ใน client โดยไม่เปลี่ยน URL เมื่อ Claim สำเร็จจะไป `/my-requests/[requestId]`

`/my-requests/[requestId]` ตรวจ parameter ด้วย `isValidRequestId()` (ตัวเลขล้วน ตรงกับ `bookings.booking_id` ที่วางแผนไว้)
parameter ที่ผิดรูปแบบหรือไม่พบข้อมูลจะเรียก `notFound()` ทั้งสองกรณี เพื่อไม่เปิดเผยว่ามี id นั้นอยู่จริงหรือไม่

`/register` เป็นระบบสมัครสมาชิกบัญชีผู้ใช้ใหม่ รับข้อมูลตาม Schema ตาราง `profiles` ใน `detail.md` ร่วมกับ Supabase Auth (ชื่อ-นามสกุล, อีเมล, รหัสผ่าน, เบอร์โทรศัพท์, วันเดือนปีเกิด, ภาษาหน้าจอ) โดยแสดงผลเป็น Modal Overlay แบบ 2 ฝั่ง (Split Card) ซ้อนบนหน้าแรก (`/`) และสามารถเข้าถึงผ่าน Direct URL `/register` ได้เช่นกัน

`/login` (และ `/sign-in`) เป็นระบบลงชื่อเข้าใช้บัญชีผู้ใช้ที่มีอยู่แล้วผ่าน Supabase Auth ตรวจสอบอีเมลและรหัสผ่าน พร้อมปุ่ม Fast Login สำหรับ development ที่ลงชื่อเข้าบัญชีทดสอบจริง 4 บทบาท (User, Interpreter, Manager, Admin) ผ่าน server route โดยไม่แสดงใน production หน้า login แสดงผลเป็น Modal Overlay แบบ 2 ฝั่ง (Split Card) ซ้อนบนหน้าแรก (`/`) และสามารถเข้าถึงผ่าน Direct URL ได้

## Routes ที่วางแผนไว้

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/profile` | Static private route | Authenticated User, Interpreter, Manager, Admin (preview session) | Supabase Auth `profiles`; browser mock session fallback | Redirect to `/#top` when session is missing, locked, or soft-deleted | Implemented at `app/(workspace)/profile/page.tsx`; self-service soft delete is available for Supabase sessions |
| `/welcome` | Static private route | Authenticated User/Interpreter | Supabase Auth session + `public.profiles`; browser preview data | Redirect by Supabase profile role | Implemented at `app/(workspace)/welcome/page.tsx` |
| `/map` | Resource map/list | Approved Interpreter | `bookings`, interpreter skills | Empty state or `403` | Planned |
| `/volunteer/apply` | Resource create route | Authenticated User | `interpreter_profiles`, `languages`, `categories` | Redirect to current application status | Planned |
| `/volunteer/status` | Resource detail route | Authenticated User | `interpreter_profiles` | Empty state if no application | Planned |
| `/volunteer/dashboard` | Resource dashboard | Approved Interpreter | `bookings`, interpreter skills | `403` if not approved | Planned |
| `/manager/verify-volunteers` | Resource list/detail | Manager/Admin | `interpreter_profiles`, user profile | Empty state or `403` | Planned |
| `/admin` | Static dashboard | Admin | Users, bookings, reviews summary | `403` | Planned |
| `/admin/users` | Resource list/detail | Admin | User profile and roles | Empty state or `403` | Planned |

`/request-help`, `/my-requests`, `/find-requests`, `/my-assignments`, `/register` และ `/login` อยู่ในตาราง implemented แล้ว

### Route สำหรับติดตามภารกิจ

`/my-requests/[requestId]` เป็น canonical route สำหรับรายละเอียดคำขอและภารกิจ โดยผู้ขอและ Interpreter ที่ Claim งานแล้วจะใช้ resource เดียวกันตาม server authorization ใน production

ไม่สร้าง `/mission/[id]` แยกใน scope ปัจจุบัน เพื่อลด route ซ้ำและให้ `requestId` เป็น stable resource ID เดียวของคำขอ

Preview flow ใช้ mock session แยกมุมมองตาม role โดยไม่มี role toggle ใน URL: ผู้ขอยืนยันล่ามก่อนเปิดข้อมูลติดต่อและพิกัดจริง ล่ามจึงเริ่มงานได้ จากนั้นทั้งสองฝ่ายต้องยืนยันจบงานก่อนสถานะเป็น `Completed` หากล่ามถอนตัวใน `Claimed` ก่อน deadline คำขอกลับเป็น `Open`; การถอนตัวใน `InProgress` เปลี่ยนเป็น `Cancelled`

## งานที่เหลือของ requester routes

สาม route ข้างต้นทำงานบน mock data ใน `app/lib/mock-requests.ts` เท่านั้น ยังไม่ต่อ Supabase
รายการต่อไปนี้ต้องปิดให้ครบก่อนถือว่า feature domain นี้เสร็จ

### ต้องทำก่อนใช้งานจริง

- **Authorization ฝั่ง server:** ตอนนี้ทั้งสาม route เปิดสาธารณะ ใครก็เข้า `/my-requests` ได้
  ต้องบังคับว่าผู้เรียกต้อง login และเป็นเจ้าของ `bookings.user_id` ของคำขอนั้น
  ถ้าไม่ใช่เจ้าของให้ตอบ `notFound()` เหมือนกรณีไม่พบข้อมูล เพื่อไม่เปิดเผยว่ามี id นั้นจริง
- **แทน mock ด้วย query จริง:** `findRequest()`, `filterRequests()` และ `countRequests()` ใน
  `app/lib/mock-requests.ts` ต้องเปลี่ยนไปอ่านตาราง `bookings` โดยคง contract เดิมไว้เพื่อไม่ต้องแก้ UI
- **Server Actions:** ปุ่ม claim, ยืนยันล่าม, เริ่มงาน, ยกเลิกและยืนยันจบงานในหน้า preview
  ยังเปลี่ยน browser-local state ผ่าน `app/lib/request-store.ts` ต้องย้าย logic ไป server actions และ atomic claim RPC
  พร้อมตรวจ authorization และลำดับสถานะตาม BR-05 ฝั่ง server
- **Timestamp จริง:** mock เก็บเวลาเป็น string ที่ format แล้วเพื่อกัน hydration mismatch
  เมื่อต่อฐานข้อมูลต้องเปลี่ยนเป็น `TIMESTAMPTZ` และใช้ formatter กลางที่ให้ผลตรงกันทั้ง server และ client
- **`expiresInSeconds`:** เป็น field สำหรับ mock เท่านั้น ต้องแทนด้วยการคำนวณจาก `bookings.expires_at`
  และต้องมีงานฝั่งระบบเปลี่ยนสถานะเป็น `Expired` ตาม BR-07 ไม่ใช่แค่ให้ countdown หมดบนหน้าจอ

### อยู่ในขอบเขตของสมาชิกคนอื่น

- **ปุ่มเริ่มงาน (`Claimed` → `InProgress`):** ไม่ได้ใส่ในหน้า requester
  เป็นส่วนของ mission controls ตามการแบ่งงานใน `detail.md`
- **ปักหมุดเองบนแผนที่:** `/request-help` รองรับเฉพาะดึง GPS กับกรอกชื่อสถานที่
  การปักหมุดเองต้องรอ component แผนที่
- **รีวิวหลังจบงาน:** หน้า `/my-requests/[requestId]` ที่สถานะ `Completed` ยังไม่มีทางเข้าสู่ flow รีวิว
  ต้องเพิ่ม link เมื่อ route รีวิวพร้อม

### ที่ยังไม่ได้ทดสอบ

ตรวจแล้วเฉพาะระดับ HTTP กับ HTML ที่ server render (status code ของทุก route, invalid parameter, การล็อกข้อมูลติดต่อรายสถานะ)
ยังไม่ได้ตรวจพฤติกรรมฝั่ง client ด้วยเบราว์เซอร์จริง: ปุ่มดึง GPS, ฟอร์มยกเลิก, countdown ที่เดินจริง และตัวสลับภาษา

## ข้อกำหนดเมื่อเพิ่ม route

Pull Request ที่เพิ่ม route ต้องระบุ:

1. เหตุผลทางธุรกิจของ path
2. route type และ parameter format
3. access rule
4. data source
5. loading, error และ not-found behavior
6. metadata และ affected links
7. คำสั่งหรือ test ที่ใช้ตรวจ direct URL และ invalid parameter
