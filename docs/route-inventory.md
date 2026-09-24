# KHVI Route Inventory

## UI language support

The global UI language switcher supports English (en), Chinese (zh), Thai (th), Spanish (es) and Arabic (ar). Arabic sets document direction to RTL. UI language is separate from interpreter service-language data.

## Role-specific request workspaces

- Canonical role pages live in direct folders under `app/`: `/user`, `/interpreter`, `/manager` and `/admin`. Compatibility routes keep legacy paths working without adding duplicate business logic.
- `User` uses `/request-help` to create a request and `/my-requests` to track requests owned by the signed-in Supabase account.
- `Interpreter` uses `/find-requests` to review open request summaries and `/my-assignments` to claim matching open requests or track claimed, in-progress and completed assignments.
- All four routes read the Supabase Auth session and redirect to the equivalent route when the signed-in role does not match.
- Interpreter lists read matching open requests and assignments from Supabase. RLS, approved profile skills and server actions enforce visibility and claim authorization.
- `/find-requests` supports client-side sorting by request creation time and by distance from the interpreter's browser GPS when location access is available.
- `/find-requests` renders an interactive Leaflet map with OpenStreetMap tiles, request markers and a browser-GPS marker when location access is available.
- Both roles use the same signed-in header and footer as `/welcome`; the navigation labels and paths change with the role.

## Shared profile route

- `/profile` is the shared authenticated Profile & Settings route for `User`, `Interpreter`, `Manager`, and `Admin`.
- The page reads the current Supabase Auth profile and redirects to `/#top` when no valid active session is available. Locked sessions cannot open the page.
- Every role can edit only their own first name, last name, phone, date of birth, preferred UI language, and profile photo through Supabase-backed actions.
- Approved Interpreter profiles read and update service language and matching category selections through the Supabase application flow and active reference catalog.
- Role, lock status, interpreter approval status, and management permissions are shown as read-only context and enforced by server authorization.

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

This update supersedes the older source and state-only behavior notes below.

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
| `/` | Static | Public | None | Not applicable | Implemented at `app/page.tsx` |
| `/_not-found` | Framework fallback | Public | None | Framework fallback | Implemented at `app/not-found.tsx` |
| `/user` | Protected workspace | User Role (Supabase session) | Supabase bookings, reference data and signed-in profile | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/user/page.tsx` |
| `/interpreter` | Protected workspace | Interpreter Role (Supabase session) | Supabase matching requests, assignments, reference data and signed-in profile | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/interpreter/page.tsx` |
| `/manager` | Protected workspace | Manager/Admin Role (Supabase session) | Supabase applications, reports, profile changes and audit logs | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/manager/page.tsx` with server guard at `app/manager/layout.tsx` |
| `/admin` | Protected dashboard | Admin Role (Supabase session) | Supabase profiles, reports, audit logs and platform settings | Redirect unauthenticated or wrong role to public/role route | Implemented at `app/admin/page.tsx` |
| `/profile` | Shared protected settings | Any active role (Supabase session) | Supabase Auth user and own `profiles` row | Redirect unauthenticated, locked or deleted account to public route | Implemented at `app/profile/page.tsx` with server guard |
| `/welcome` | Compatibility role redirect | Authenticated User/Interpreter | Supabase Auth profile role | Redirect by server-verified role | Implemented at `app/welcome/page.tsx` |
| `/request-help` | Compatibility resource-create route | Authenticated User | Supabase `create_booking` RPC | Redirect Interpreter to `/find-requests` | Redirects to canonical `app/user/request-help/page.tsx` from `app/request-help/page.tsx` |
| `/my-requests` | Compatibility requester-list route | Authenticated User | Supabase `bookings` owned by the signed-in account through RLS | Redirect Interpreter to `/my-assignments`; empty state | Redirects to canonical `app/user/my-requests/page.tsx` from `app/my-requests/page.tsx` |
| `/my-requests/[requestId]` | Compatibility dynamic resource | เจ้าของคำขอ หรือ Interpreter ที่ Claim แล้ว | Supabase `bookings`, authorized private-detail/contact/location RPCs | `notFound()` สำหรับ ID ผิดรูปแบบ ไม่พบ หรือไม่มีสิทธิ์เข้าถึง | Redirects to canonical `app/user/my-requests/[requestId]/page.tsx` |
| `/find-requests` | Compatibility interpreter-list route | Authenticated Interpreter | Supabase matching-open `bookings` through RLS; atomic `claim_booking` RPC | Redirect User to `/request-help`; empty state; claim error stays on list | Redirects to canonical `app/interpreter/find-requests/page.tsx` from `app/find-requests/page.tsx` |
| `/my-assignments` | Compatibility interpreter-assignment route | Authenticated Interpreter (Supabase session) | Supabase `bookings` visible through matching-open and assigned-row RLS policies | Redirect User to `/my-requests`; approval guidance or empty state | Redirects to canonical `app/interpreter/my-assignments/page.tsx` from `app/my-assignments/page.tsx` |
| `/register` | Static auth route | Public | Supabase Auth + `public.profiles` trigger; session is available immediately after signup | Not applicable | Implemented at `app/register/page.tsx` |
| `/login` | Static auth route | Public | Direct Supabase Auth form; development-only Fast Login uses server credentials | Not applicable | Implemented at `app/login/page.tsx` |
| `/forgot-password` | Static auth route | Public | Supabase Auth password-reset request | Invalid input stays on the form; success copy is account-enumeration safe | Implemented at `app/forgot-password/page.tsx` |
| `/reset-password` | Static auth route | Recovery session | Supabase Auth recovery session established by the PKCE callback | Invalid or expired link offers a new reset request | Implemented at `app/reset-password/page.tsx` |
| `/api/auth/callback` | Auth callback route | Public recovery/legacy callback entry | Supabase Auth PKCE `exchangeCodeForSession` and server-side profile/role check | Invalid or expired recovery link redirects to `/reset-password` | Implemented at `app/api/auth/callback/route.ts` |
| `/api/auth/login` | Auth action route | Public | Supabase Auth password login; server-side profile/role check; session or persistent cookie according to `rememberMe` | `400` validation; `401` credentials; `403` locked or unavailable profile | Implemented at `app/api/auth/login/route.ts` |
| `/api/auth/register` | Auth action route | Public | Supabase Auth sign-up with server-owned default role and immediate session; required phone and date of birth; duplicate email returns localized existing-user message | `400` validation or registration failure; `409` duplicate email; `503` when Supabase cannot return a session | Implemented at `app/api/auth/register/route.ts` |
| `/api/auth/logout` | Auth action route | Authenticated | Supabase Auth session cookies | Session cookies and persistence marker are cleared | Implemented at `app/api/auth/logout/route.ts` |
| `/api/auth/forgot-password` | Auth action route | Public | Supabase Auth password-reset email | Same success response for existing and unknown email addresses | Implemented at `app/api/auth/forgot-password/route.ts` |
| `/api/auth/reset-password` | Auth action route | Recovery session | Supabase Auth `updateUser` followed by server sign-out | `401` missing or non-recovery session; `400` invalid password | Implemented at `app/api/auth/reset-password/route.ts` |
| `/api/auth/fast-login` | Auth action route | Development only; disabled in production | Supabase Auth accounts configured by `FAST_LOGIN_*` server environment variables | `400` invalid role; `503` missing dev account; `401` Auth failure | Implemented at `app/api/auth/fast-login/route.ts` |
| `/sign-in` | Static auth redirect | Public | None | Redirects to `/?signin=true` | Implemented at `app/sign-in/page.tsx` |

`/my-requests` รับ query parameter `status` ค่าเดียวเท่านั้น: `open`, `claimed`, `in-progress`, `completed`, `cancelled`
ค่าที่ไม่รู้จักจะถูกลดรูปเป็น `all` โดยไม่ตอบ 404 เพราะ query parameter ไม่ใช่ตัวระบุ resource

`/my-assignments` แสดงงานเปิดที่ตรงความสามารถแยกจากงานที่รับแล้ว และรับ `status` เฉพาะ `claimed`, `in-progress` และ `completed` สำหรับกรองงานที่รับแล้ว ค่าอื่นจะถูกลดรูปเป็น `all`
ส่วน `/find-requests` ใช้ตัวกรอง `All`, `Urgent` และ `Scheduled` ใน client โดยไม่เปลี่ยน URL เมื่อ Claim สำเร็จจะไป `/my-requests/[requestId]`

`/my-requests/[requestId]` ตรวจ parameter ด้วย `isValidRequestId()` (ตัวเลขล้วน ตรงกับ `bookings.booking_id` ที่วางแผนไว้)
parameter ที่ผิดรูปแบบหรือไม่พบข้อมูลจะเรียก `notFound()` ทั้งสองกรณี เพื่อไม่เปิดเผยว่ามี id นั้นอยู่จริงหรือไม่

`/register` เป็นระบบสมัครสมาชิกบัญชีผู้ใช้ใหม่ รับข้อมูลตาม Schema ตาราง `profiles` ใน `detail.md` ร่วมกับ Supabase Auth (ชื่อ-นามสกุล, อีเมล, รหัสผ่าน, เบอร์โทรศัพท์, วันเดือนปีเกิด, ภาษาหน้าจอ) โดยเบอร์โทรศัพท์และวันเดือนปีเกิดเป็นข้อมูลบังคับ และวันเดือนปีเกิดแสดงตามลำดับ วัน เดือน ปี; หากอีเมลซ้ำจะแจ้งว่ามีผู้ใช้นี้แล้ว โดยแสดงผลเป็น Modal Overlay แบบ 2 ฝั่ง (Split Card) ซ้อนบนหน้าแรก (`/`) และสามารถเข้าถึงผ่าน Direct URL `/register` ได้เช่นกัน

`/login` เป็นหน้า Login โดยตรงที่ใช้ฟอร์ม Supabase Auth เดียวกับ modal หน้าแรก พร้อม checkbox `จดจำฉัน` และปุ่ม Fast Login สำหรับ development ซึ่งไม่แสดงใน production. หน้าแรกยังเปิด Login modal ได้ ส่วน `/sign-in` redirect ไป `/?signin=true` เพื่อคง compatibility เดิม

Session refresh ผ่าน `proxy.ts` ครอบคลุม canonical private routes `/user/**`, `/interpreter/**`, `/manager/**`, `/admin/**`, `/profile/**` และ compatibility private paths ที่ยังใช้งานอยู่ รวมถึง auth API ที่ต้องล้างหรือ refresh session. Proxy มีหน้าที่ refresh cookie เท่านั้น; page, server action และ API ยังคงตรวจ user/profile/role ฝั่ง server แยกกัน

## Routes ที่ยังวางแผนไว้

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/map` | Resource map/list | Approved Interpreter | `bookings`, interpreter skills | Empty state or `403` | Planned |
| `/user/volunteer/apply` | Resource create route | Authenticated User | `interpreter_applications`, `languages`, `categories` | Redirect to current application status | Implemented at `app/user/volunteer/apply/page.tsx` |
| `/user/volunteer/status` | Resource detail route | Authenticated User | `interpreter_applications` | Empty state if no application | Implemented at `app/user/volunteer/status/page.tsx` |
| `/user/volunteer/dashboard` | Compatibility dashboard redirect | Authenticated User | None | Redirect to interpreter workspace | Implemented at `app/user/volunteer/dashboard/page.tsx` |
| `/manager/verify-volunteers` | Resource list/detail | Manager/Admin | `interpreter_profiles`, user profile | Empty state or `403` | Planned |
| `/admin/users` | Resource list/detail | Admin | User profile and roles | Empty state or `403` | Planned |

Admin ที่ต้องตรวจงานปฏิบัติการสามารถเปิด Manager View ภายใน route เดิมด้วย
`/admin?view=manager-operations` ได้ โดยไม่เปลี่ยนไป `/manager` และไม่เปลี่ยน role
ของผู้ใช้งาน

`/request-help`, `/my-requests`, `/find-requests`, `/my-assignments`, `/register` และ `/login` อยู่ในตาราง implemented แล้ว

### Route สำหรับติดตามภารกิจ

`/my-requests/[requestId]` เป็น canonical route สำหรับรายละเอียดคำขอและภารกิจ โดยผู้ขอและ Interpreter ที่ Claim งานแล้วจะใช้ resource เดียวกันตาม server authorization ใน production

ไม่สร้าง `/mission/[id]` แยกใน scope ปัจจุบัน เพื่อลด route ซ้ำและให้ `requestId` เป็น stable resource ID เดียวของคำขอ

Authenticated flow ใช้ Supabase session แยกมุมมองตาม role โดยไม่มี role toggle ใน URL: ผู้ขอยืนยันล่ามก่อนเปิดข้อมูลติดต่อและพิกัดจริง ล่ามจึงเริ่มงานได้ จากนั้นทั้งสองฝ่ายต้องยืนยันจบงานก่อนสถานะเป็น `Completed` หากล่ามถอนตัวใน `Claimed` ก่อน deadline คำขอกลับเป็น `Open`; การถอนตัวใน `InProgress` เปลี่ยนเป็น `Cancelled`

## สถานะ requester และ interpreter mission routes

- `/welcome`, `/my-requests`, `/find-requests` และ `/my-assignments` ใช้ข้อมูล `bookings` จริงตาม Supabase session และ RLS
- `/my-requests/[requestId]` เป็น shared mission room ของเจ้าของคำขอและล่ามที่รับงาน โดย action ทุกขั้นตรวจ authorization และ state transition ฝั่ง server
- เวลาใช้ `TIMESTAMPTZ` จากฐานข้อมูล และ countdown คำนวณจาก `bookings.expires_at`
- งานที่ยังไม่เปิดใน scope ปัจจุบันคือการส่ง Review หลังงาน `Completed`; หน้า Welcome แสดงสถานะนี้ว่า unavailable
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
