# แนวทางการพัฒนา KHVI Helper

เอกสารนี้กำหนด workflow กลางสำหรับสมาชิกทีมและ AI Agent

## โครงสร้าง Branch

```text
main      = โค้ดที่ผ่านการตรวจสอบและพร้อมใช้งาน
develop   = branch รวมงานของทีม
feature/* = งานย่อยของสมาชิกแต่ละคน
```

`develop` เป็น default integration branch สำหรับงานใหม่ หากผู้ใช้ไม่ระบุ target branch
ให้ถือว่า Pull Request ต้องมุ่งเข้า `develop` งานต้อง push จาก feature branch
การ push ตรงเข้า `develop` หรือ `main` ต้องมีคำสั่งชัดเจนจากผู้ดูแลโครงการ

ตัวอย่างชื่อ branch:

```text
feature/ilham/sos-request
feature/member-2/map-view
fix/member-3/claim-race-condition
docs/ilham/update-requirements
```

## ลำดับการทำงาน

1. แตก branch จาก `develop`
2. หาก task เกี่ยวข้องกับ requirement หรือ behavior หลัก ให้ผ่าน Requirement Consistency Gate ตาม `docs/requirement-consistency-checklist.md` ก่อนแก้ไฟล์
3. อ่าน requirement และเอกสารที่เกี่ยวข้อง
4. หากเป็นงาน UI/UX ให้อ่าน `SKILL.md` และกำหนด design direction
5. หากเป็นงาน UI/UX ให้อ่าน `docs/design-system.md` และตรวจ token/component ที่มีอยู่
6. หากเป็นงานเขียนหรือแก้ไข prose, documentation, PR text หรือ UI copy ให้อ่าน `skills/stop-slop/SKILL.md`
7. วางแผนงานและกำหนดขอบเขตไฟล์
8. หากเพิ่มหรือแก้หน้าเว็บ ให้กำหนด path, route type, parameter, access rule และ not-found behavior ใน `docs/route-inventory.md`
9. พัฒนาและทดสอบบน branch ของตนเอง
10. รัน `npm run lint` และ `npm run build`
11. ตรวจ Requirement Consistency Gate ซ้ำกับ diff หาก task แตะ requirement หรือ behavior หลัก
12. เปิด Pull Request เข้า `develop`
13. แก้ไข review comment และรอ status checks ผ่าน
14. รวมงานเข้า `develop` หลังผ่านการ review
15. ทดสอบภาพรวมจาก `develop`
16. เปิด Pull Request จาก `develop` เข้า `main`
17. รวมเข้า `main` เมื่อ review และ status checks ผ่านครบถ้วน

## Requirement Consistency Gate

ก่อน implement requirement หรือ behavior หลัก ต้องใช้ checklist ที่ `docs/requirement-consistency-checklist.md` โดยตรวจอย่างน้อย:

- Requirement กับ use case และ user flow
- Requirement กับ database relation, schema และ migration ที่มีจริง
- Requirement กับ route, role/permission และ business rule
- Requirement กับ Source code และ configuration ปัจจุบัน

ต้องแยกผลเป็นข้อที่สอดคล้อง, ขัดแย้ง และยังไม่ชัดเจน หากข้อขัดแย้งหรือข้อไม่ชัดเจนกระทบ scope, business rule, permission, status หรือ schema ให้หยุดและถามผู้ดูแลก่อนเริ่ม implementation ห้ามแก้โดยการเดา

งาน UI ที่เปลี่ยนสี ฟอนต์ รูปทรง หรือ visual language ต้องถามก่อนว่าจะใช้เฉพาะ task หรือยกระดับเป็น design system ทั้งโปรเจกต์

## Route และ Path Workflow

ก่อน implement route ใหม่ ให้ตรวจสอบ `docs/route-inventory.md` และทำตามลำดับนี้:

1. ระบุ URL path และความหมายทางธุรกิจ
2. ระบุว่าเป็น static route, dynamic resource route หรือ query-based view
3. ระบุ parameter และ validation rule
4. ระบุว่า route เป็น public หรือจำเป็นต้อง authentication/authorization
5. ระบุ data source และ behavior เมื่อไม่พบข้อมูล
6. ระบุ metadata และลิงก์ที่ได้รับผลกระทบ
7. เพิ่มหรือปรับ navigation test สำหรับ direct URL และ invalid parameter
8. อัปเดต route inventory ใน Pull Request เดียวกัน

ยังไม่เพิ่ม catch-all route, i18n routing, middleware routing หรือระบบ redirect จนกว่าจะมี requirement รองรับ

## New Idea และการยกระดับเป็น System Setting

เมื่อมีไอเดียใหม่ที่ไม่ตรงกับแนวทางเดิม ให้ Agent หยุดก่อนแก้กฎกลางและจำแนกไอเดียเป็นหนึ่งในสามแบบ:

1. การเปลี่ยนแปลงเฉพาะ task
2. การทดลองหรือ planned behavior
3. system setting หรือกฎถาวรของระบบ

Agent ต้องถามผู้ใช้ด้วยคำถามนี้ก่อนเลือกแบบที่สาม:

> ไอเดียนี้ต้องการให้เป็น setting หรือกฎถาวรของระบบสำหรับงานต่อไปด้วยหรือไม่ หรือใช้เฉพาะ task นี้เท่านั้น?

หากยังไม่มีคำตอบ ให้ใช้ขอบเขตเฉพาะ task และห้ามแก้ `AGENTS.md`, requirements, workflow, route inventory หรือ business rules เพื่อรองรับไอเดียโดยอัตโนมัติ

หากผู้ใช้ยืนยันให้เป็น system setting ต้อง:

- ระบุไฟล์และพฤติกรรมที่ได้รับผลกระทบ
- อัปเดตเอกสารกฎกลางที่เกี่ยวข้อง
- เพิ่ม acceptance criteria หรือ Definition of Done ที่ตรวจสอบได้
- ระบุว่า setting มีผลกับงานใดและไม่ครอบคลุมงานใด

## กฎการใช้ Design Skill

`SKILL.md` เป็นแนวทางกลางสำหรับงาน UI/UX ของโปรเจกต์ โดยต้องใช้เมื่อสร้าง
หรือปรับปรุงหน้าเว็บ component dashboard layout typography color responsive behavior
หรือ motion

ก่อนเริ่มงาน UI ให้ตอบคำถามเหล่านี้ในแผนงาน:

- หน้านี้มี purpose อะไร
- ใครเป็นผู้ใช้หลักและต้องเห็นข้อมูลใดก่อน
- tone ของหน้าจอควรเป็นแบบใด
- memorable detail ของงานคืออะไร
- มีข้อจำกัดด้าน accessibility, performance และ responsive อย่างไร

หลังทำเสร็จต้องตรวจสอบว่า layout, typography, contrast, responsive behavior และ
การใช้งานจริงสอดคล้องกับ `SKILL.md` โดยไม่ละเมิด requirements หรือ business rules

## คุณภาพข้อความ

ใช้ `skills/stop-slop/SKILL.md` ตรวจ documentation, Pull Request, status report และ
ข้อความที่ผู้ใช้เห็นใน UI ตัดคำเกริ่น ภาษาคลุมเครือ และ meta-commentary ออก
ใช้ active voice ระบุผู้กระทำและผลกระทบให้ชัดเจน หลีกเลี่ยง em dash ใน prose ใหม่

ก่อนส่งข้อความสำคัญ ให้ประเมิน Directness, Rhythm, Trust, Authenticity และ Density
รวมกันต้องได้อย่างน้อย 35/50 หากต่ำกว่านั้นให้ปรับแก้ก่อนส่ง

## Semantic Code Analysis ด้วย LSP

ใช้ `lsp-code-analysis` จาก `skills/lsp-code-analysis/SKILL.md` เมื่อต้องเข้าใจ
โครงสร้าง TypeScript/JavaScript, ค้นหา definition หรือ references, ตรวจสอบ type,
ดู symbol outline หรือ refactor ข้ามหลายไฟล์

ก่อนใช้ skill:

1. อ่าน `skills/lsp-code-analysis/SKILL.md`
2. รัน `scripts/update.sh` ของ skill เพื่ออัปเดตเครื่องมือ
3. รัน `lsp server start <project_path>` และตรวจสอบว่า project รองรับ
4. ใช้ `outline`, `doc`, `definition`, `reference` หรือ `symbol` ตามประเภทงาน

หาก LSP ใช้งานไม่ได้ ให้แจ้งข้อจำกัดและใช้การอ่านไฟล์หรือค้นหาข้อความแทน

## Project-local skills

เพื่อให้ coworker ใช้แนวทางเดียวกัน ให้โหลด skill จาก `skills/` ใน repository ก่อน skill ระดับเครื่อง:

- `frontend-design` และ `web-design-guidelines` สำหรับงาน UI
- `next-dev-loop` สำหรับตรวจ runtime ของ Next.js หลังแก้ไข
- `supabase` สำหรับ schema, migration, Auth และ RLS
- `stop-slop` สำหรับเอกสารและข้อความบน UI
- `lsp-code-analysis` สำหรับการนำทางและ refactoring เชิง semantic

หาก skill ต้องการ dependency ที่เครื่องยังไม่มี ให้แจ้งข้อจำกัดและห้ามรายงานว่าการตรวจสอบนั้นสำเร็จ
โดยต้องระบุว่าไม่ได้ใช้ semantic analysis ในรายงานงาน

## กฎการ Commit

- Commit ควรมีขอบเขตเล็กและอธิบายได้
- ใช้ข้อความที่สื่อความหมาย เช่น `feat: add SOS request form`
- AI Agent ต้องรอคำสั่งก่อน commit
- ห้าม push โดย AI Agent
- ห้ามใช้ force push
- ห้ามแก้ไข commit เดิมด้วย `--amend` เว้นแต่ได้รับคำสั่ง

## การตั้งค่า GitHub ที่ควรเปิดใช้

ตั้งค่า `main` และ `develop` เป็น protected branches:

- บังคับให้เปิด Pull Request ก่อน merge
- ต้องมี reviewer อย่างน้อย 1 คน
- ต้องให้ status checks ผ่านก่อน merge
- ต้องแก้ conversation ที่ยังไม่ resolved
- ยกเลิก approval เดิมเมื่อมี commit ใหม่
- บังคับให้ branch ทันกับ branch ปลายทางก่อน merge
- ปิด force push และการลบ branch
- ใช้ Squash and merge เป็นวิธีหลัก

สถานะ checks ขั้นต่ำในปัจจุบันคือ `lint` และ `build` จาก
`.github/workflows/ci.yml` เมื่อเพิ่ม test script แล้วให้เพิ่ม test เป็น required check

## Definition of Done

- ฟีเจอร์ทำงานตาม requirement
- มีการตรวจสอบสิทธิ์และ business rules ที่เกี่ยวข้อง
- Lint และ build ผ่าน
- Test ที่เกี่ยวข้องผ่านเมื่อมี test script
- Pull Request ระบุไฟล์สำคัญ วิธีทดสอบ และความเสี่ยง
- ไม่มี secret หรือไฟล์ generated ถูกเพิ่มเข้า Repository

## การจัดการความขัดแย้ง

หาก source code, requirements, user flow หรือเอกสารรายวิชาขัดแย้งกัน
ให้หยุดการเปลี่ยนแปลงที่มีผลต่อ scope หรือ database และแจ้งผู้ดูแลโครงการก่อน
