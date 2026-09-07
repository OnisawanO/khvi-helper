# KHVI Design System

เอกสารนี้เป็นมาตรฐานกลางสำหรับสี ตัวอักษร รูปทรง ระยะห่าง และ component ของ KHVI
งาน UI ใหม่ต้องใช้มาตรฐานนี้ก่อนเพิ่มค่าหรือรูปแบบใหม่

## Design direction

KHVI เป็นระบบช่วยเหลือด้านภาษาที่ควรให้ความรู้สึกสงบ น่าเชื่อถือ เข้าถึงง่าย และเป็นมิตรต่อชุมชน
ใช้โครงสร้างที่อ่านง่าย สี accent ที่ช่วยนำทาง และรายละเอียดคล้ายแผนที่ชุมชนเป็น visual signature

## Color

| Token | Value | Usage |
|---|---|---|
| `--khvi-ink` | `#10283a` | Main text and headings |
| `--khvi-navy` | `#092f45` | Header, strong actions, dark surfaces |
| `--khvi-teal` | `#4d8a93` | Links, supporting accent |
| `--khvi-sage` | `#759284` | Community and availability accent |
| `--khvi-sun` | `#f0a35f` | Focus, attention, warm accent |
| `--khvi-coral` | `#f04f3e` | SOS, error, urgent status |
| `--khvi-paper` | `#f7f9fa` | Main page background |
| `--khvi-surface` | `#ffffff` | Cards and raised surfaces |

ห้ามเพิ่มสีหลักใหม่โดยไม่ระบุเหตุผลและไม่ถามว่าต้องการเปลี่ยนทั้งระบบหรือเฉพาะ task

## Typography

- ใช้ `Noto Sans Thai` เป็น primary font สำหรับภาษาไทยและภาษาอังกฤษ
- ใช้ `Segoe UI`, `Arial`, `Helvetica`, sans-serif เป็น fallback
- ใช้ sentence case เป็นค่าเริ่มต้น หลีกเลี่ยง all caps
- Heading ต้องมีลำดับชัดเจนและอ่านได้บน mobile
- ข้อความยาวควรมี line length ต่ำกว่า 80 ตัวอักษรเมื่อทำได้

## Shape and elevation

- ใช้ radius ระดับเล็กกับ control และระดับกลางกับ card หรือ panel
- ใช้ border และ shadow อย่างพอดีเพื่อแยกลำดับชั้น ไม่ใช้ shadow กับทุก element
- ปุ่มหลักใช้สี navy หรือ teal และต้องมี visible focus state
- สี coral ใช้กับ SOS, error หรือสถานะเร่งด่วนเท่านั้น
- ห้ามสร้างรูปทรงตกแต่งที่ทำให้ระบบดูเหมือน template ทั่วไป

## Layout and spacing

- จัดเนื้อหาหลักให้อ่านจากซ้ายไปขวาและ scan ได้ง่าย
- ใช้ spacing scale เดิมของ Tailwind ก่อนสร้างค่าพิเศษ
- รักษา alignment ของ header, content และ footer ให้เป็นระบบเดียวกัน
- ทุกหน้าต้องรองรับ mobile, tablet และ desktop

## Components

ก่อนสร้าง component ใหม่ให้ตรวจ `app/components/` ก่อน

- Header และ footer ต้องใช้ component กลาง
- ปุ่ม, link, input และ focus state ต้องมี behavior สอดคล้องกัน
- Card ใช้กับกลุ่มข้อมูลที่ผู้ใช้ต้อง scan ไม่ใช้ card ซ้อน card โดยไม่จำเป็น
- Icon ต้องสื่อความหมายและมี accessible name เมื่อเป็นปุ่ม

## Change gate

ถ้าไอเดียใหม่เปลี่ยนสี ฟอนต์ radius shadow หรือ visual language ให้ถามก่อนว่า:

> ต้องการใช้เฉพาะหน้านี้ หรือยกระดับเป็น design system ของทั้งโปรเจกต์?

การเปลี่ยนทั้งระบบต้องอัปเดตเอกสารนี้และ token file ใน Pull Request เดียวกัน
