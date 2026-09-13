<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# มาตรฐานการทำงานของ AI Agent สำหรับ KHVI Helper

## 1. ขอบเขตของ Repository

- Repository root คือโฟลเดอร์ `khvi/`
- ทำงานเฉพาะไฟล์ภายใน Repository นี้ เว้นแต่ผู้ใช้จะอนุญาตอย่างชัดเจน
- ใช้ภาษาไทยในการอธิบายแผนงาน ผลลัพธ์ และปัญหา
- คงชื่อไฟล์ ชื่อตัวแปร คำสั่ง และศัพท์เทคนิคที่จำเป็นไว้เป็นภาษาอังกฤษ

## 2. เป้าหมายของระบบ

KHVI Helper เป็นเว็บแอปพลิเคชันสำหรับเชื่อมโยงผู้ที่ต้องการความช่วยเหลือด้านภาษา
กับล่ามอาสาที่อยู่ใกล้เคียง โดยมีแนวคิดเรื่องคำขอ SOS การจับคู่ล่าม การติดตามภารกิจ
การตรวจสอบล่าม และการรีวิวหลังจบงาน

เอกสารบางส่วนอธิบายระบบเป้าหมายในอนาคต ไม่ได้หมายความว่าฟีเจอร์นั้นมีอยู่ในโค้ดแล้ว
ต้องตรวจสอบ Source code และ configuration ปัจจุบันก่อนสร้างหรืออ้างอิงไฟล์ใด ๆ

## 3. สถานะปัจจุบันและเทคโนโลยี

### สิ่งที่มีอยู่ในปัจจุบัน

- Next.js 16.3.0 และ App Router
- React และ TypeScript แบบ strict
- Tailwind CSS
- ESLint configuration
- หน้าเริ่มต้นและ root layout ของแอป

### สิ่งที่เป็นแผนงานหรือยังต้องพัฒนา

- Supabase Authentication และ PostgreSQL
- Role-based Access Control สำหรับ User, Interpreter, Manager และ Admin
- ระบบ SOS และการจับคู่ล่าม
- ระบบแผนที่และการอัปเดตแบบ Realtime
- Shared Mission Room
- ระบบ Manager, Admin, Review และ Notification

ห้ามถือว่าโครงสร้างใน `detail.md` หรือเอกสาร roadmap ถูกสร้างแล้วจนกว่าจะพบไฟล์จริง

## 4. แหล่งข้อมูลและความขัดแย้ง

ก่อนแก้ไขงานที่มีผลต่อระบบ ให้ตรวจสอบเอกสารที่เกี่ยวข้องจากรายการนี้:

1. Source code และ configuration ปัจจุบัน
2. Database schema หรือ migration ที่มีอยู่จริง
3. `docs/requirements.md`
4. `docs/user-flows.txt`
5. `docs/development-workflow.md`
6. `detail.md` และเอกสารอ้างอิงใน `docs/reference/`
7. `README.md`

หากข้อมูลจากแหล่งใดขัดแย้งกัน ต้องระบุความขัดแย้งและถามผู้ใช้ก่อนตัดสินใจ
ห้ามเลือกใช้ข้อมูลใดข้อมูลหนึ่งเงียบ ๆ โดยไม่มีการแจ้งให้ทราบ

### Requirement Consistency Gate

งานใดก็ตามที่อ่าน แก้ เพิ่ม หรือนำ requirement ไป implement ต้องผ่าน gate นี้ก่อนเริ่มแก้ไฟล์:

1. ระบุขอบเขต requirement ของ task และรวบรวมเอกสารที่เกี่ยวข้องอย่างน้อยจาก `docs/requirements.md`, `docs/user-flows.txt`, `detail.md`, เอกสาร role ที่เกี่ยวข้อง และ `docs/route-inventory.md` หากมีผลต่อ route
2. ตรวจ Source code, configuration, database schema/migration ที่มีอยู่จริงแยกจากเอกสารแผนงาน
3. ทำ conflict matrix สั้น ๆ โดยเทียบ requirement กับ use case/user flow, database relation/schema, route และ business rule ที่เกี่ยวข้อง
4. แยกผลตรวจเป็น `สอดคล้อง`, `ขัดแย้ง`, `ยังไม่ชัดเจน` และบันทึกไฟล์/หัวข้อที่เป็นหลักฐาน
5. หากพบความขัดแย้งหรือข้อไม่ชัดเจนที่เปลี่ยน scope, business rule, role/permission, status transition, data model หรือ API contract ให้หยุดก่อนแก้ implementation และถามผู้ใช้
6. หากไม่พบความขัดแย้ง ให้สรุป decision ที่จะยึดและไฟล์ที่จะเปลี่ยนในแผนงานก่อนเริ่มแก้
7. หลังแก้เสร็จให้ตรวจ gate ซ้ำกับ diff เพื่อยืนยันว่า requirement, flow, relation และ implementation ยังสอดคล้องกัน

ใช้ checklist กลางที่ `docs/requirement-consistency-checklist.md` ทุกครั้งที่ task แตะ requirement
หรือ behavior หลักของระบบ

## 5. ข้อกำหนดของโครงงาน

- ต้องมีฟีเจอร์หลักตามขอบเขตของทีมและรองรับ CRUD ที่จำเป็น
- ต้องมี Authentication และการควบคุมสิทธิ์ตามบทบาท
- ฐานข้อมูลต้องมีอย่างน้อย 5 ตาราง
- สามารถเพิ่มตารางมากกว่า 5 ตารางได้เมื่อมีเหตุผลทางสถาปัตยกรรมหรือ business rule
- การเพิ่มตารางต้องอัปเดตเอกสารและอธิบายเหตุผลใน Pull Request
- ต้องมี test case อย่างน้อย 10 เคสตามข้อกำหนดของรายวิชา
- ระบบเป้าหมายต้องสามารถ Deploy บน Vercel ได้
- สมาชิกต้องสามารถอธิบายโค้ดในส่วนที่ตนรับผิดชอบได้

## 6. Business Rules สำคัญ

- User ห้าม Claim คำขอที่ตนเองสร้าง
- Interpreter ต้องได้รับการอนุมัติก่อนจึงจะรับงานได้
- Interpreter ต้องมีสถานะพร้อมทำงานและมีภาษาที่ตรงกับคำขอ
- ข้อมูลติดต่อและพิกัดละเอียดต้องไม่เปิดเผยก่อน Claim
- สถานะงานต้องเปลี่ยนตามลำดับที่กำหนด
- การเริ่มงานทำได้หลัง Claim หรือ Accepted เท่านั้น
- การจบงานทำได้หลัง InProgress เท่านั้น
- การรีวิวทำได้เมื่อภารกิจอยู่ในสถานะ Completed
- การ Claim งานต้องป้องกันการรับงานซ้ำจากหลายคน
- การเปลี่ยนสิทธิ์หรือสถานะผู้ใช้ต้องตรวจสอบ authorization ฝั่ง server เสมอ

## 7. มาตรฐานการพัฒนา

- อ่านไฟล์ที่เกี่ยวข้องก่อนแก้ไข
- หากงานเกี่ยวข้องกับ UI, UX, หน้าเว็บ, component, dashboard หรือ visual design ต้องอ่าน `SKILL.md` ก่อนเริ่มเขียนโค้ด
- ก่อนทำงาน UI ให้ระบุ purpose, audience, tone, memorable detail และ constraints ตาม `SKILL.md`
- ใช้ `SKILL.md` เพื่อกำกับทิศทางการออกแบบ ไม่ใช่เพื่อแทนที่ requirements, accessibility หรือ business rules
- ใช้ TypeScript strict mode และรูปแบบของโครงการเดิม
- แยก Server Component และ Client Component ให้ถูกต้อง
- ตรวจสอบ authorization ใน Server Action หรือ server-side logic ไม่พึ่งเฉพาะ UI
- Reuse component และ utility ที่มีอยู่ก่อนสร้างใหม่
- หลีกเลี่ยง dependency ใหม่ เว้นแต่จำเป็นและอธิบายเหตุผลได้
- ห้ามเพิ่ม secret, credential หรือไฟล์ `.env` เข้า Repository
- ห้ามสร้างไฟล์ตาม roadmap โดยไม่ตรวจสอบว่า task ต้องการจริง
- งาน UI ต้องอ่าน `docs/design-system.md` และใช้ token จาก `app/design-tokens.css`
- ห้ามเพิ่มสี ฟอนต์ radius shadow หรือ visual language ใหม่โดยไม่ระบุเหตุผล
- หากไอเดีย UI เปลี่ยน theme ให้ถามว่าใช้เฉพาะหน้านี้หรือเป็น design system ของทั้งโปรเจกต์
- ต้อง reuse component ใน `app/components/` ก่อนสร้าง component ใหม่
- งาน UI ต้องตรวจ mobile, tablet, desktop และ visible focus state ตามความเหมาะสม

## 8. Workflow ของ Agent

### Scope ของงาน

- ทำเฉพาะสิ่งที่ผู้ใช้สั่งหรือสิ่งที่จำเป็นโดยตรงต่อการทำงานนั้น
- ห้ามขยาย scope ไปแก้ refactor, documentation, design, dependency, test หรือ configuration ที่ผู้ใช้ไม่ได้ระบุ
- หากพบงานต่อเนื่องที่เกี่ยวข้อง ให้แนะนำเป็นรายการถัดไปได้ แต่ต้องรอคำสั่งหรือการอนุมัติก่อนลงมือ
- หากงานที่พบเป็น blocker โดยตรง ให้แจ้งผู้ใช้และอธิบายว่าต้องทำอะไรจึงจะทำงานหลักต่อได้
- รายงานให้ชัดว่าส่วนใดทำตามคำสั่งและส่วนใดเป็นคำแนะนำที่ยังไม่ได้ดำเนินการ

### ก่อนเริ่มงาน

1. ตรวจสอบ branch ด้วย `git branch --show-current`
2. ตรวจสอบสถานะไฟล์ด้วย `git status --short`
3. ห้ามเริ่มแก้ไขหากอยู่บน `main` หรือ `develop`
4. หาก task เกี่ยวข้องกับ requirement หรือ behavior หลัก ให้ผ่าน Requirement Consistency Gate และบันทึกผลตาม `docs/requirement-consistency-checklist.md`
5. อ่าน requirements และเอกสารที่เกี่ยวข้อง
6. หากเป็นงาน UI/UX ให้อ่าน `SKILL.md` และกำหนด design direction
7. หากเป็นงาน UI/UX ให้อ่าน `docs/design-system.md` และตรวจ token/component ที่มีอยู่
8. หากเป็นงานเขียนหรือแก้ไข prose, documentation, PR text หรือ UI copy ให้อ่าน `skills/stop-slop/SKILL.md`
9. แยกให้ได้ว่าส่วนใดทำแล้ว ส่วนใดอยู่ระหว่างทำ และส่วนใดเป็นแผนงาน
10. ระบุไฟล์ที่จะเปลี่ยนและวางแผนสั้น ๆ
11. ใช้ feature branch รูปแบบ `feature/<สมาชิก>/<งาน>`, `fix/<สมาชิก>/<งาน>` หรือ `docs/<สมาชิก>/<งาน>`

### ระหว่างทำงาน

- แก้เฉพาะขอบเขตของงาน
- รักษา business rules และ compatibility เดิม
- หากพบ requirement ขัดแย้งกัน ให้หยุดและถาม
- หากต้องลบข้อมูล เปลี่ยน production หรือแก้ schema สำคัญ ให้หยุดและถาม
- ห้ามทำงานโดยตรงบน `main` หรือ `develop`

### ก่อนรายงานว่างานเสร็จ

1. ตรวจสอบ diff และไฟล์ที่เปลี่ยนแปลง
2. รันคำสั่งตรวจสอบที่เกี่ยวข้อง
3. ตรวจสอบว่าไม่มี secret หรือไฟล์ generated ถูกเพิ่ม
4. ตรวจสอบ business rules ที่เกี่ยวข้อง
5. หาก task ผ่าน Requirement Consistency Gate ให้ตรวจ checklist ซ้ำหลังแก้และระบุผลในรายงาน
6. รายงานไฟล์ที่แก้ ผลการตรวจสอบ และความเสี่ยงที่เหลือ

## 9. คำสั่งมาตรฐาน

รันจากโฟลเดอร์ `khvi/`:

- ติดตั้ง dependencies: `npm ci`
- Development server: `npm run dev`
- ตรวจสอบ lint: `npm run lint`
- สร้าง production build: `npm run build`
- Production server: `npm run start`
- รัน test เฉพาะเมื่อมี test script อยู่ใน `package.json`

ห้ามรายงานว่าการทดสอบผ่าน หากยังไม่ได้รันคำสั่งจริง

## 10. Git, Commit และ Pull Request

ค่าเริ่มต้นของการส่งงานขึ้น GitHub คือ `develop` ในฐานะ default integration branch

- เมื่อผู้ใช้สั่ง push โดยไม่ระบุ branch ให้ push feature branch ปัจจุบันและตั้งเป้า Pull Request ไปที่ `develop`
- ห้ามตีความว่าให้ push ตรงเข้า `develop` เว้นแต่ผู้ใช้สั่งโดยตรง
- `main` ใช้สำหรับ release และรับงานจาก `develop` หลังผ่านการ review เท่านั้น

โครงสร้าง branch คือ:

```text
main      = โค้ดที่ผ่านการตรวจสอบและพร้อมใช้งาน
develop   = branch รวมงานของทีม
feature/* = branch สำหรับงานแต่ละชิ้น
```

- ต้องทำงานบน feature branch ที่แตกจาก `develop`
- ต้องเปิด Pull Request เพื่อรวมเข้า `develop`
- ต้องตรวจสอบและ review `develop` ก่อนเปิด Pull Request เข้า `main`
- Agent ห้าม commit จนกว่าผู้ใช้จะสั่งโดยตรง
- Agent ห้าม push, merge, force push หรือ bypass branch protection
- ก่อน commit ต้องแสดง branch, diff summary และผล lint/build/test
- ใช้ commit message ที่สื่อความหมาย เช่น `feat: add SOS request form`

## 11. Definition of Done

งานถือว่าเสร็จเมื่อ:

- ฟีเจอร์ทำงานตามขอบเขตที่ตกลง
- ไม่ละเมิด business rules หรือสิทธิ์ผู้ใช้
- ผ่าน lint และ build ที่เกี่ยวข้อง
- ผ่าน test ที่เกี่ยวข้องเมื่อมี test script
- เอกสารถูกอัปเดตเมื่อ setup, workflow หรือ behavior เปลี่ยน
- ไม่มี secret หรือไฟล์ generated ถูกเพิ่ม
- มีรายงานไฟล์ที่แก้ไขและผลการตรวจสอบ
- ยังไม่มีการ commit หรือ push หากผู้ใช้ไม่ได้สั่ง

## 12. สิ่งที่ต้องขออนุมัติก่อน

ต้องหยุดและขอคำยืนยันก่อนทำสิ่งต่อไปนี้:

- ลบหรือเขียนทับข้อมูลสำคัญ
- เปลี่ยน database schema หรือ migration ที่มีผลกว้าง
- เปลี่ยน business rule
- เปลี่ยนโครงสร้าง branch หรือ GitHub workflow
- Deploy หรือแก้ production configuration
- เพิ่ม dependency ขนาดใหญ่
- ทำ refactor ที่ไม่เกี่ยวข้องกับ task

## 13. คุณภาพของข้อความและ UI Copy

โปรเจกต์นี้ใช้ skill `stop-slop` จาก `skills/stop-slop/SKILL.md` เป็นแนวทางตรวจข้อความ
สำหรับ documentation, Pull Request, status report, user-facing copy และข้อความใน UI

- ตัดคำเกริ่น คำฟุ่มเฟือย และคำอธิบายที่ไม่เพิ่มข้อมูล
- ใช้ประโยคที่มีผู้กระทำชัดเจนและใช้ active voice
- ระบุข้อเท็จจริง ชื่อไฟล์ พฤติกรรม หรือผลกระทบให้ชัดเจน
- เปลี่ยนจังหวะและความยาวของประโยค ไม่ใช้รูปแบบซ้ำ ๆ
- หลีกเลี่ยงถ้อยคำสำเร็จรูป ภาษาธุรกิจที่คลุมเครือ และ meta-commentary
- ห้ามใช้ em dash ใน prose ใหม่
- ใช้หลักการเดียวกันกับข้อความภาษาไทย แต่ต้องรักษาความเป็นธรรมชาติของภาษาไทย
- ห้ามใช้ skill นี้แก้ชื่อ API, code identifier, command, quoted requirement หรือข้อความทางกฎหมาย

ก่อนส่ง prose สำคัญ ให้ประเมิน Directness, Rhythm, Trust, Authenticity และ Density
อย่างละ 1-10 คะแนน หากรวมต่ำกว่า 35/50 ให้ปรับข้อความก่อนส่ง

## 14. Semantic Code Analysis ด้วย LSP

โปรเจกต์นี้ใช้ `lsp-code-analysis` สำหรับการทำความเข้าใจและนำทางโค้ดแบบ semantic
โดยมีไฟล์ project-local อยู่ที่ `skills/lsp-code-analysis/SKILL.md`

- ใช้ LSP เมื่อค้นหา definition, references, implementations, type information หรือ symbol outline
- ใช้ LSP ก่อนการ refactor หรือแก้โค้ดข้ามหลายไฟล์เมื่อ tool พร้อมใช้งาน
- สำหรับ TypeScript และ JavaScript ให้ใช้ LSP เพื่อยืนยันความสัมพันธ์ของ symbol และ import
- อ่าน `references/bp_frontend.md` เมื่อทำงานด้าน frontend ที่ต้องวิเคราะห์โครงสร้างหลายไฟล์
- อ่าน `references/refactor.md` ก่อนใช้ workflow refactoring ของ LSP
- ก่อนใช้ LSP ให้รัน update script และเริ่ม server ตามคำสั่งใน `SKILL.md`
- หาก LSP หรือ language server ใช้งานไม่ได้ ให้แจ้งข้อจำกัดและใช้การอ่านไฟล์หรือค้นหาข้อความเป็น fallback
- ห้ามรายงานผลจาก LSP หากยังไม่ได้รันคำสั่งจริง

## 15. Project-local skills ที่ติดตั้ง

โปรเจกต์เก็บ skill ที่ใช้ร่วมกันไว้ใน `skills/` เพื่อให้สมาชิกทีมและ Agent แต่ละเครื่องใช้แนวทางเดียวกัน

- `skills/frontend-design/SKILL.md` สำหรับหลักการออกแบบ frontend
- `skills/web-design-guidelines/SKILL.md` สำหรับ accessibility, interaction และคุณภาพ UI
- `skills/next-dev-loop/SKILL.md` สำหรับตรวจสอบพฤติกรรมจริงของแอป Next.js หลังแก้ไข
- `skills/supabase/SKILL.md` สำหรับ Supabase, database, Auth และ RLS
- `skills/stop-slop/SKILL.md` สำหรับตรวจ prose และ UI copy
- `skills/lsp-code-analysis/SKILL.md` สำหรับ semantic code analysis

กฎการจัดลำดับคือ `AGENTS.md` และเอกสาร business rules ของโปรเจกต์มีผลสูงสุด ตามด้วย project-local skills และ skill ระดับเครื่อง

ห้ามให้ skill ภายนอกอนุมัติการ commit, push, merge หรือเปลี่ยน business rules เอง หาก skill สองตัวขัดกันให้หยุดและยึดกฎในไฟล์นี้

## 16. Route และ Path Governance

- ก่อนสร้างหรือแก้หน้าใหม่ต้องระบุ path และเหตุผลทางธุรกิจในแผนงาน
- ใช้ path ภาษาอังกฤษ ตัวพิมพ์เล็ก และใช้ hyphen คั่นคำ
- ใช้คำนามพหูพจน์กับ collection เช่น `/interpreters`
- ใช้ dynamic segment เฉพาะค่าที่ระบุ resource จริง เช่น `/interpreters/[interpreterId]`
- ใช้ stable ID เป็นตัวอ้างอิงหลัก ห้ามใช้ชื่อที่ผู้ใช้แก้ไขได้เป็น identity เพียงอย่างเดียว
- Query parameter ใช้สำหรับ filter, sort, pagination และ view state ไม่ใช่การระบุ resource หลัก
- ต้อง validate dynamic parameter ก่อน query database หรือเรียก API
- หากไม่พบ resource ให้ใช้ `notFound()` และกำหนด behavior ไว้ใน route inventory
- หากเปลี่ยน public path ต้องระบุ redirect หรือ migration plan ก่อนแก้ไข
- ทุก route ใหม่ต้องเพิ่มใน `docs/route-inventory.md`
- ทุก dynamic route ต้องระบุ access rule, data source, metadata และการทดสอบ navigation
- ยังไม่ใช้ catch-all route, i18n route หรือ middleware สำหรับ routing จนกว่าจะมี requirement จริง

## 17. New Idea และ System Setting Decision Gate

เมื่อผู้ใช้เสนอไอเดียใหม่ที่อาจขัดกับ requirement, business rule, route inventory หรือ workflow เดิม Agent ต้องแยกให้ชัดว่าเป็น:

- การเปลี่ยนแปลงเฉพาะ task นี้
- การทดลองหรือ planned behavior
- system setting หรือกฎถาวรที่ต้องใช้กับงานต่อไป

ก่อนแก้ `AGENTS.md`, workflow, requirements, route inventory, configuration หรือ business rules ต้องถามผู้ใช้โดยตรงว่า:

> ไอเดียนี้ต้องการให้เป็น setting หรือกฎถาวรของระบบสำหรับงานต่อไปด้วยหรือไม่ หรือใช้เฉพาะ task นี้เท่านั้น?

Agent ต้องรอคำตอบเมื่อการเลือกนี้เปลี่ยน scope หรือพฤติกรรมของระบบ หากผู้ใช้ยังไม่ตัดสินใจ ให้เก็บไอเดียไว้ใน task scope หรือเอกสาร planned behavior โดยไม่ยกระดับเป็นกฎถาวร

เมื่อผู้ใช้ยืนยันให้เป็น system setting ต้องอัปเดตไฟล์ที่เกี่ยวข้อง อธิบายผลกระทบ และเพิ่มรายการตรวจสอบใน Definition of Done หากใช้เฉพาะ task นี้ ห้ามแก้กฎกลางเพียงเพราะมีการพูดถึงไอเดียดังกล่าว
