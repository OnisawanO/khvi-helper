# KHVI Route Inventory

## Requester preview flow update

- Entry: `/welcome`; `/wellcom` redirects to `/welcome`.
- Flow: welcome → `/request-help` → `/my-requests/[requestId]`; the list and welcome link back to the saved request.
- Requester pages now share browser-local storage (`khvi-requester-v1`) and start empty. Example records are not presented as the user's requests.
- Creation, cancellation reasons and completion confirmations persist across reloads in the same browser. Storage errors leave the form available for retry.
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
| `/` | Static | Public | None | Not applicable | Implemented |
| `/_not-found` | Framework fallback | Public | None | Framework fallback | Implemented |
| `/manager` | Static Mockup | Manager Role | Mock data (FR-14–18) | Not applicable | Implemented |
| `/request-help` | Resource create route | Authenticated User (ยังไม่บังคับ) | `app/lib/mock-requests.ts` | Not applicable | Implemented (mock) |
| `/my-requests` | Resource list | Authenticated User, เจ้าของคำขอ (ยังไม่บังคับ) | `app/lib/mock-requests.ts` | Empty state | Implemented (mock) |
| `/my-requests/[requestId]` | Dynamic resource | เจ้าของคำขอ (ยังไม่บังคับ) | `app/lib/mock-requests.ts` | `notFound()` | Implemented (mock) |
| `/register` | Static auth route | Public | `app/lib/mock-auth.ts` (Mock session) | Not applicable | Implemented (mock) |
| `/login` | Static auth route | Public | `app/lib/mock-auth.ts` (Mock session) | Not applicable | Implemented (mock) |

`/my-requests` รับ query parameter `status` ค่าเดียวเท่านั้น: `open`, `claimed`, `in-progress`, `completed`, `cancelled`
ค่าที่ไม่รู้จักจะถูกลดรูปเป็น `all` โดยไม่ตอบ 404 เพราะ query parameter ไม่ใช่ตัวระบุ resource

`/my-requests/[requestId]` ตรวจ parameter ด้วย `isValidRequestId()` (ตัวเลขล้วน ตรงกับ `bookings.booking_id` ที่วางแผนไว้)
parameter ที่ผิดรูปแบบหรือไม่พบข้อมูลจะเรียก `notFound()` ทั้งสองกรณี เพื่อไม่เปิดเผยว่ามี id นั้นอยู่จริงหรือไม่

`/register` เป็นระบบสมัครสมาชิกบัญชีผู้ใช้ใหม่ รับข้อมูลตาม Schema ตาราง `profiles` ใน `detail.md` ร่วมกับ Supabase Auth (ชื่อ-นามสกุล, อีเมล, รหัสผ่าน, เบอร์โทรศัพท์, วันเดือนปีเกิด, ภาษาหน้าจอ) โดยแสดงผลเป็น Modal Overlay แบบ 2 ฝั่ง (Split Card) ซ้อนบนหน้าแรก (`/`) และสามารถเข้าถึงผ่าน Direct URL `/register` ได้เช่นกัน

`/login` (และ `/sign-in`) เป็นระบบลงชื่อเข้าใช้บัญชีผู้ใช้ที่มีอยู่แล้ว ตรวจสอบอีเมลและรหัสผ่าน พร้อมปุ่ม Quick Login สำหรับทดสอบ 4 บทบาท (User, Interpreter, Manager, Admin) โดยแสดงผลเป็น Modal Overlay แบบ 2 ฝั่ง (Split Card) ซ้อนบนหน้าแรก (`/`) และสามารถเข้าถึงผ่าน Direct URL ได้

## Routes ที่วางแผนไว้

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/profile` | Static private route | Authenticated | User profile | Redirect to login | Planned |
| `/welcome` | Static private route | Authenticated User | User profile | Redirect to login | Planned |
| `/map` | Resource map/list | Approved Interpreter | `bookings`, interpreter skills | Empty state or `403` | Planned |
| `/volunteer/apply` | Resource create route | Authenticated User | `interpreter_profiles`, `languages`, `categories` | Redirect to current application status | Planned |
| `/volunteer/status` | Resource detail route | Authenticated User | `interpreter_profiles` | Empty state if no application | Planned |
| `/volunteer/dashboard` | Resource dashboard | Approved Interpreter | `bookings`, interpreter skills | `403` if not approved | Planned |
| `/mission/[id]` | Dynamic resource | Booking requester or claimed interpreter | `bookings` | `notFound()` or `403` | Planned |
| `/manager/verify-volunteers` | Resource list/detail | Manager/Admin | `interpreter_profiles`, user profile | Empty state or `403` | Planned |
| `/admin` | Static dashboard | Admin | Users, bookings, reviews summary | `403` | Planned |
| `/admin/users` | Resource list/detail | Admin | User profile and roles | Empty state or `403` | Planned |

`/request-help`, `/my-requests`, `/register` และ `/login` ย้ายจากตารางนี้ขึ้นไปอยู่ตาราง implemented แล้ว โดย path ตรงกับที่ทีมวางแผนไว้เดิม

### ประเด็นค้าง: `/my-requests/[requestId]` ทับซ้อนกับ `/mission/[id]`

route inventory วางแผน `/mission/[id]` เป็นหน้าติดตามภารกิจที่ใช้ร่วมกันทั้งฝ่ายผู้ขอและล่ามที่รับงาน
ส่วน `/my-requests/[requestId]` ที่เพิ่มเข้ามาเป็นหน้าติดตามสถานะสำหรับผู้ขอเท่านั้น
ทั้งสอง path จึงอ่านข้อมูลชุดเดียวกันและแสดงสถานะเดียวกัน ต่างกันแค่ขอบเขตผู้ดู

ยังไม่ตัดสินใจว่าจะเก็บทั้งสอง path หรือรวมเป็นอันเดียว ต้องตกลงกับเจ้าของงาน mission ก่อน
ถ้ารวมเป็น `/mission/[id]` อันเดียว ต้องกำหนด redirect จาก `/my-requests/[requestId]` และย้าย component ที่เกี่ยวข้อง

## งานที่เหลือของ requester routes

สาม route ข้างต้นทำงานบน mock data ใน `app/lib/mock-requests.ts` เท่านั้น ยังไม่ต่อ Supabase
รายการต่อไปนี้ต้องปิดให้ครบก่อนถือว่า feature domain นี้เสร็จ

### ต้องทำก่อนใช้งานจริง

- **Authorization ฝั่ง server:** ตอนนี้ทั้งสาม route เปิดสาธารณะ ใครก็เข้า `/my-requests` ได้
  ต้องบังคับว่าผู้เรียกต้อง login และเป็นเจ้าของ `bookings.user_id` ของคำขอนั้น
  ถ้าไม่ใช่เจ้าของให้ตอบ `notFound()` เหมือนกรณีไม่พบข้อมูล เพื่อไม่เปิดเผยว่ามี id นั้นจริง
- **แทน mock ด้วย query จริง:** `findRequest()`, `filterRequests()` และ `countRequests()` ใน
  `app/lib/mock-requests.ts` ต้องเปลี่ยนไปอ่านตาราง `bookings` โดยคง contract เดิมไว้เพื่อไม่ต้องแก้ UI
- **Server Actions:** ปุ่มยกเลิกและปุ่มยืนยันจบงานในหน้า `/my-requests/[requestId]`
  ยังเปลี่ยนแค่ state ในหน้า ต้องย้าย logic ไป `actions/pin-actions.ts` และ `actions/mission-actions.ts`
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
