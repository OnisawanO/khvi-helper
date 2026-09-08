# KHVI Route Inventory

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
| `/manager` | Static Mockup | Manager Role | Mock data (FR-40–46, FR-51–52) | Not applicable | Implemented |
| `/admin` | Static Mockup | Admin Role | Mock data (FR-76–83, NFR-01, NFR-07) | Not applicable | Implemented |

## Routes ที่วางแผนไว้

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/login` | Static auth route | Public | Supabase Auth | Redirect authenticated user by role | Planned |
| `/register` | Static auth route | Public | Supabase Auth, user profile | Redirect authenticated user by role | Planned |
| `/profile` | Static private route | Authenticated | User profile | Redirect to login | Planned |
| `/welcome` | Static private route | Authenticated User | User profile | Redirect to login | Planned |
| `/request-help` | Resource create route | Authenticated User | `bookings`, `languages`, `categories` | Redirect to login or show form error | Planned |
| `/my-requests` | Resource list | Authenticated User | `bookings` filtered by requester | Empty state | Planned |
| `/map` | Resource map/list | Approved Interpreter | `bookings`, interpreter skills | Empty state or `403` | Planned |
| `/volunteer/apply` | Resource create route | Authenticated User | `interpreter_profiles`, `languages`, `categories` | Redirect to current application status | Planned |
| `/volunteer/status` | Resource detail route | Authenticated User | `interpreter_profiles` | Empty state if no application | Planned |
| `/volunteer/dashboard` | Resource dashboard | Approved Interpreter | `bookings`, interpreter skills | `403` if not approved | Planned |
| `/mission/[id]` | Dynamic resource | Booking requester or claimed interpreter | `bookings` | `notFound()` or `403` | Planned |
| `/manager/verify-volunteers` | Resource list/detail | Manager/Admin | `interpreter_profiles`, user profile | Empty state or `403` | Planned |
| `/admin` | Static dashboard | Admin | Users, bookings, reviews summary | `403` | Planned |
| `/admin/users` | Resource list/detail | Admin | User profile and roles | Empty state or `403` | Planned |

## ข้อกำหนดเมื่อเพิ่ม route

Pull Request ที่เพิ่ม route ต้องระบุ:

1. เหตุผลทางธุรกิจของ path
2. route type และ parameter format
3. access rule
4. data source
5. loading, error และ not-found behavior
6. metadata และ affected links
7. คำสั่งหรือ test ที่ใช้ตรวจ direct URL และ invalid parameter
