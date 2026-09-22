# KHVI Route Inventory

## UI language support

The global UI language switcher supports English (en), Chinese (zh), Thai (th), Spanish (es) and Arabic (ar). Arabic sets document direction to RTL. UI language is separate from interpreter service-language data.

## Role-specific request workspaces

- Source routes now use Next.js route groups to keep role ownership visible in the file tree without changing public URLs: `(public)`, `(auth)`, `(workspace)`, `(user)`, `(interpreter)`, `(manager)`, and `(admin)`.
- `User` uses `/request-help` to create a request and `/my-requests` to track requests owned by the signed-in Supabase account.
- `Interpreter` uses `/find-requests` to review open request summaries and `/my-assignments` to claim matching open requests or track claimed, in-progress and completed assignments.
- All four routes read the Supabase Auth session and redirect to the equivalent route when the signed-in role does not match.
- Interpreter lists read matching open requests and assignments from Supabase. RLS, approved profile skills and server actions enforce visibility and claim authorization.
- `/find-requests` supports client-side sorting by request creation time and by distance from the interpreter's browser GPS when location access is available.
- `/find-requests` renders an interactive Leaflet map with OpenStreetMap tiles, request markers and a browser-GPS marker when location access is available.
- Both roles use the same signed-in header and footer as `/welcome`; the navigation labels and paths change with the role.

## Shared profile route

- `/profile` is the shared authenticated Profile & Settings route for `User`, `Interpreter`, `Manager`, and `Admin`.
- The page reads the current Supabase Auth profile and redirects to `/#top` when no valid active session is available. Browser mock session fallback remains available for local preview without Supabase. Locked sessions cannot open the page.
- Every role can edit only their own first name, last name, phone, date of birth, and preferred UI language in the current preview. The browser-local session is updated after validation.
- Every role can change, crop, or remove an optional profile photo in the current preview. The cropped image is resized and stored as `avatarUrl` in the browser-local session; production storage and ownership checks remain planned.
- Approved Interpreter profiles can add, type, or remove service language and matching category selections in the current preview. The UI keeps at least one language and two categories, stores standard IDs or custom values in the browser-local session, and does not replace the planned `interpreter_languages` or `interpreter_categories` relations. Production must validate custom values against the system catalog before persistence.
- Role, lock status, interpreter approval status, and management permissions are shown as read-only context. Production ownership checks, Supabase persistence, role-specific profile tables, and server authorization remain planned.

## Requester mission flow update

- Entry: `/welcome`.
- Flow: welcome → `/request-help` → `/my-requests/[requestId]` → interpreter claim in `/find-requests` or the available-request section of `/my-assignments` → requester confirmation → interpreter start → dual completion. Both roles return to the same canonical detail route.
- Request creation, requester lists, interpreter discovery, assignments and the shared mission detail read and write Supabase `bookings` through RLS and authorized RPCs.
- Request detail edits are allowed during `Open` or `Claimed` before work starts. Cancellation and dual-completion actions follow the database state machine and server authorization.
- Mission detail watches the current actor's browser geolocation while an active mission page is open and saves permitted updates through `save_mission_location`. Each role sees its own marker; the other party's exact marker appears only after requester confirmation.
- Urgent requests expire 30 minutes after creation; scheduled requests expire at their appointment if still open. Supabase timestamps remain stable across devices and navigation.
- Missing GPS stays empty, without invented coordinates. A meeting-point description can be saved independently from coordinates.
- Malformed, missing and unauthorized request IDs return server `notFound()` so the route does not reveal whether another account owns the booking.
- Verification: Supabase RLS query, `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build` and browser runtime checks.

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
| `/request-help` | Resource create route | Authenticated User | Supabase `create_booking` RPC | Redirect Interpreter to `/find-requests` | Implemented at `app/(user)/request-help/page.tsx` |
| `/my-requests` | Requester resource list | Authenticated User | Supabase `bookings` owned by the signed-in account through RLS | Redirect Interpreter to `/my-assignments`; empty state | Implemented at `app/(user)/my-requests/page.tsx` |
| `/my-requests/[requestId]` | Dynamic resource | เจ้าของคำขอ หรือ Interpreter ที่ Claim แล้ว | Supabase `bookings`, authorized private-detail/contact/location RPCs | `notFound()` สำหรับ ID ผิดรูปแบบ ไม่พบ หรือไม่มีสิทธิ์เข้าถึง | Implemented shared mission route at `app/(user)/my-requests/[requestId]/page.tsx` |
| `/find-requests` | Interpreter open-request list and claim entry | Authenticated Interpreter | Supabase matching-open `bookings` through RLS; atomic `claim_booking` RPC | Redirect User to `/request-help`; empty state; claim error stays on list | Implemented at `app/(interpreter)/find-requests/page.tsx` |
| `/my-assignments` | Interpreter available-request and assignment list | Authenticated Interpreter (Supabase session) | Supabase `bookings` visible through matching-open and assigned-row RLS policies | Redirect User to `/my-requests`; approval guidance or empty state | Implemented at `app/(interpreter)/my-assignments/page.tsx` |
| `/register` | Static auth route | Public | Supabase Auth + `public.profiles` trigger; UI locale is inherited from the Guest Welcome page | Not applicable | Implemented at `app/(auth)/register/page.tsx` |
| `/login` | Static auth route | Public | Supabase Auth + `public.profiles`; development-only Fast Login uses server credentials | Not applicable | Implemented at `app/(auth)/login/page.tsx` |
| `/api/auth/fast-login` | Auth action route | Development only; disabled in production | Supabase Auth accounts configured by `FAST_LOGIN_*` server environment variables | `400` invalid role; `503` missing dev account; `401` Auth failure | Implemented at `app/api/auth/fast-login/route.ts` |
| `/api/auth/login` | Auth action route | Public | Supabase Auth password login and `public.profiles` | 400 validation; 401 invalid credentials; 403 missing or locked profile | Implemented at `app/api/auth/login/route.ts` |
| `/api/auth/register` | Auth action route | Public | Supabase Auth sign-up and `public.profiles` trigger | 400 validation or unsupported locale | Implemented at `app/api/auth/register/route.ts` |
| `/api/auth/logout` | Auth action route | Authenticated | Supabase Auth session cookies | 401 when no active session | Implemented at `app/api/auth/logout/route.ts` |
| `/api/auth/forgot-password` | Auth action route | Public | Supabase Auth password-reset email | 400 invalid email | Implemented at `app/api/auth/forgot-password/route.ts` |
| `/api/auth/reset-password` | Auth action route | Authenticated recovery session | Supabase Auth recovery session | 400 invalid password; 401 missing session | Implemented at `app/api/auth/reset-password/route.ts` |
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
| `/profile` | Static private route | Authenticated User, Interpreter, Manager, Admin (preview session) | Supabase Auth `profiles`; server-only Admin API for permanent deletion; browser mock session fallback | Redirect to `/#top` when session is missing or locked | Implemented at `app/(workspace)/profile/page.tsx`; permanent self-service deletion requires no active booking and a server secret key |
| `/welcome` | Static private route | Authenticated User/Interpreter | Supabase Auth session + `public.profiles`; role-scoped `bookings` data through RLS | Redirect by Supabase profile role | Implemented at `app/(workspace)/welcome/page.tsx` |
| `/map` | Resource map/list | Approved Interpreter | `bookings`, interpreter skills | Empty state or `403` | Planned |
| `/volunteer/apply` | Resource create route | Authenticated User | `interpreter_profiles`, `languages`, `categories` | Redirect to current application status | Planned |
| `/volunteer/status` | Resource detail route | Authenticated User | `interpreter_profiles` | Empty state if no application | Planned |
| `/volunteer/dashboard` | Resource dashboard | Approved Interpreter | `bookings`, interpreter skills | `403` if not approved | Planned |
| `/manager/verify-volunteers` | Resource list/detail | Manager/Admin | `interpreter_profiles`, user profile | Empty state or `403` | Planned |
| `/admin` | Static dashboard | Admin | Users, bookings, real interpreter rating summary; reports/audit remain preview data | `403` | Partially implemented |
| `/admin/users` | Resource list/detail | Admin | User profile and roles | Empty state or `403` | Planned |

`/request-help`, `/my-requests`, `/find-requests`, `/my-assignments`, `/register` และ `/login` อยู่ในตาราง implemented แล้ว

### Route สำหรับติดตามภารกิจ

`/my-requests/[requestId]` เป็น canonical route สำหรับรายละเอียดคำขอและภารกิจ โดยผู้ขอและ Interpreter ที่ Claim งานแล้วจะใช้ resource เดียวกันตาม server authorization ใน production

ไม่สร้าง `/mission/[id]` แยกใน scope ปัจจุบัน เพื่อลด route ซ้ำและให้ `requestId` เป็น stable resource ID เดียวของคำขอ

Authenticated flow ใช้ Supabase session แยกมุมมองตาม role โดยไม่มี role toggle ใน URL: ผู้ขอยืนยันล่ามก่อนเปิดข้อมูลติดต่อและพิกัดจริง ล่ามจึงเริ่มงานได้ จากนั้นทั้งสองฝ่ายต้องยืนยันจบงานก่อนสถานะเป็น `Completed` หากล่ามถอนตัวใน `Claimed` ก่อน deadline คำขอกลับเป็น `Open`; การถอนตัวใน `InProgress` เปลี่ยนเป็น `Cancelled`

## สถานะ requester และ interpreter mission routes

- `/welcome`, `/my-requests`, `/find-requests` และ `/my-assignments` ใช้ข้อมูล `bookings` จริงตาม Supabase session และ RLS
- `/my-requests/[requestId]` เป็น shared mission room ของเจ้าของคำขอและล่ามที่รับงาน โดย action ทุกขั้นตรวจ authorization และ state transition ฝั่ง server
- เวลาใช้ `TIMESTAMPTZ` จากฐานข้อมูล และ countdown คำนวณจาก `bookings.expires_at`
- Review หลังงาน `Completed` รองรับแล้วใน branch นี้: ผู้ขอส่งรีวิวจากหน้า Mission ได้ และ Welcome กับ Request List แสดงสถานะ pending/reviewed จากข้อมูลจริง
- การตรวจล่าสุดครอบคลุม lint, TypeScript, production build, Supabase RLS query และ browser runtime ของ User mission link

## ข้อกำหนดเมื่อเพิ่ม route

Pull Request ที่เพิ่ม route ต้องระบุ:

1. เหตุผลทางธุรกิจของ path
2. route type และ parameter format
3. access rule
4. data source
5. loading, error และ not-found behavior
6. metadata และ affected links
7. คำสั่งหรือ test ที่ใช้ตรวจ direct URL และ invalid parameter
