-- Complete the reference catalog used by the real interpreter application.
-- Existing codes are preserved; inserts are idempotent for linked environments.

insert into public.languages (language_code, language_name, language_name_th, language_name_zh)
values
  ('thai', 'Thai', 'ภาษาไทย', '泰语'),
  ('spanish', 'Spanish', 'ภาษาสเปน', '西班牙语'),
  ('arabic', 'Arabic', 'ภาษาอาหรับ', '阿拉伯语'),
  ('japanese', 'Japanese', 'ภาษาญี่ปุ่น', '日语'),
  ('korean', 'Korean', 'ภาษาเกาหลี', '韩语'),
  ('french', 'French', 'ภาษาฝรั่งเศส', '法语'),
  ('german', 'German', 'ภาษาเยอรมัน', '德语'),
  ('russian', 'Russian', 'ภาษารัสเซีย', '俄语'),
  ('hindi', 'Hindi', 'ภาษาฮินดี', '印地语'),
  ('indonesian', 'Indonesian', 'ภาษาอินโดนีเซีย', '印度尼西亚语'),
  ('malay', 'Malay', 'ภาษามาเลย์', '马来语'),
  ('tagalog', 'Tagalog / Filipino', 'ภาษาตากาล็อก / ฟิลิปปินส์', '他加禄语 / 菲律宾语'),
  ('khmer', 'Khmer', 'ภาษาเขมร', '高棉语'),
  ('lao', 'Lao', 'ภาษาลาว', '老挝语'),
  ('portuguese', 'Portuguese', 'ภาษาโปรตุเกส', '葡萄牙语'),
  ('italian', 'Italian', 'ภาษาอิตาลี', '意大利语'),
  ('turkish', 'Turkish', 'ภาษาตุรกี', '土耳其语'),
  ('persian', 'Persian / Farsi', 'ภาษาเปอร์เซีย / ฟาร์ซี', '波斯语'),
  ('urdu', 'Urdu', 'ภาษาอูรดู', '乌尔都语'),
  ('bengali', 'Bengali', 'ภาษาเบงกอล', '孟加拉语'),
  ('asl', 'American Sign Language', 'ภาษามืออเมริกัน', '美国手语')
on conflict (language_code) do update
set language_name = excluded.language_name,
    language_name_th = excluded.language_name_th,
    language_name_zh = excluded.language_name_zh,
    is_active = true;

insert into public.categories (category_code, category_name, category_name_th, category_name_zh, icon)
values
  ('general', 'General & Daily Life', 'การสื่อสารทั่วไปและชีวิตประจำวัน', '日常生活与一般沟通', '💬'),
  ('tourism', 'Tourism & Transit', 'การท่องเที่ยวและการเดินทาง', '旅游与交通', '✈️'),
  ('labour', 'Labour & Workplace Rights', 'การจ้างงานและสิทธิแรงงาน', '就业与劳动权益', '💼'),
  ('disaster', 'Disaster Relief & Aid', 'ภัยพิบัติและการช่วยเหลือผู้ประสบภัย', '灾害救援与援助', '🌊')
on conflict (category_code) do update
set category_name = excluded.category_name,
    category_name_th = excluded.category_name_th,
    category_name_zh = excluded.category_name_zh,
    icon = excluded.icon,
    is_active = true;
