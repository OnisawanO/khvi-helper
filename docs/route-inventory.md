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
| `/mission/[id]` | Dynamic resource | Requester or claimed interpreter (role check not yet wired to real auth) | Mock data (`lib/mock-data.ts`), pending `bookings` table | `notFound()` on invalid id format or missing booking | Implemented (UI, mock data only) |

## Routes ที่วางแผนไว้

| Path | Type | Access | Data source | Not found behavior | Status |
|---|---|---|---|---|---|
| `/interpreters` | Resource list | Public | Interpreter table | Empty state | Planned |
| `/interpreters/[interpreterId]` | Dynamic resource | Public | Interpreter table | `notFound()` | Planned |
| `/requests` | Resource list | Authenticated | Request table | Empty state | Planned |
| `/requests/[requestId]` | Dynamic resource | Authenticated | Request table | `notFound()` or `403` | Planned |
| `/account/profile` | Static private route | Authenticated | User profile | Redirect to login | Planned |

## ข้อกำหนดเมื่อเพิ่ม route

Pull Request ที่เพิ่ม route ต้องระบุ:

1. เหตุผลทางธุรกิจของ path
2. route type และ parameter format
3. access rule
4. data source
5. loading, error และ not-found behavior
6. metadata และ affected links
7. คำสั่งหรือ test ที่ใช้ตรวจ direct URL และ invalid parameter
