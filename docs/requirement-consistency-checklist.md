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
