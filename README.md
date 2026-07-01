# Gaming Backlog / مكتبة ألعابي

[![Open Live Site](https://img.shields.io/badge/🎮_افتح_الموقع_الحيّ-7c6cff?style=for-the-badge)](https://backlogforever.netlify.app/)

أداة/موقع خفيف لترتيب مكتبة ألعابك (Backlog) — **بدون تسجيل، بدون إيميل**. اكتب اسم اللعبة،
أضفها لمكتبتك، ورتّب الـbacklog حسب التقييم، مدة اللعب، التصنيف، أو الحالة. الواجهة لوحة تحكم
داكنة بشريط جانبي، مع صفحة إحصائيات ونظام مستوى/إنجازات محلي.

## 🔴 التجربة المباشرة

| النسخة | الرابط | الأوقات |
|--------|--------|---------|
| **Netlify** (كاملة) | https://backlogforever.netlify.app/ | أوقات HowLongToBeat الدقيقة |
| GitHub Pages (أخف) | https://aragonaragon.github.io/gaming-backlog/ | متوسط RAWG فقط |

> جرّب بيانات وهمية: أضف `?demo=1` لأي رابط، مثال:
> https://aragonaragon.github.io/gaming-backlog/?demo=1

## النسخ الجاهزة

- **`Netlify/`** — نسخة النشر على Netlify (مع دالة HLTB). ارفع المجلد أو `Gaming-Backlog-Netlify.zip`.
- **`Download-PC/`** — نسخة PC: ملف واحد يفتح بالدبل-كليك (تجيب HLTB من دالة Netlify الحيّة).
- **`docs/`** — نسخة GitHub Pages (تُنشر تلقائياً من الـrepo).
- **Releases** — الـZIPs الجاهزة للتحميل: https://github.com/aragonaragon/gaming-backlog/releases/latest

## أهم المميزات

- 🔎 بحث مباشر عن أي لعبة عبر **RAWG** (صور، تقييم، سنة، تصنيفات، Metacritic).
- ⏱ أوقات **HowLongToBeat** (القصة / +الإضافات / 100%).
- 🧭 **شريط جانبي**: الرئيسية · القائمة · ألعبها · خلّصت · Wishlist · حسب التصنيف · الإحصائيات · الإعدادات.
- 🏠 **لوحة رئيسية**: بطاقة "أكمل اللعب" بشريط تقدّم، ألعابك، دونات توزيع، بطاقات إحصائية، آخر ما لعبت، وإنجاز مفتوح.
- 🎮 حالات اللعبة: `القائمة`، `ألعبها`، `خلّصت`، `Wishlist` (زر 🔖).
- 📊 **صفحة إحصائيات** + **إنجازات** + نظام **Level / XP** محلي.
- 👤 **بروفايل** محلي (اسم) بدون تسجيل.
- 📈 **شريط تقدّم** لكل لعبة قيد اللعب.
- ✨ زر **اقترح لي لعبة** (اختيار متوازن: تقييم ÷ مدة).
- 🗓️ **خطة لعب** حسب ساعات لعبك الأسبوعية.
- 📤📥 تصدير/استيراد المكتبة كملف JSON.
- 🎲 وضع **demo** عبر `?demo=1`.
- 💾 الحفظ **محلي** بالكامل (`localStorage`) — بدون حساب.

## تشغيل محلياً

نسخة Netlify (البحث والمكتبة تعمل؛ دالة `/api/hltb` تحتاج Netlify أو Netlify CLI):
```powershell
python -m http.server 5601 --directory Netlify
# ثم: http://localhost:5601/?demo=1
```

نسخة PC — الأبسط:
```text
افتح Download-PC/index.html بالدبل-كليك (أو start-backlog.bat)
للـdemo: أضف ?demo=1 في آخر الرابط
```
نسخة PC تجيب أوقات HLTB من دالة Netlify الحيّة، فتشتغل بدون Node ولا سيرفر — تحتاج إنترنت فقط.

## نشر نسخة Netlify

1. افتح https://app.netlify.com/drop
2. اسحب مجلد `Netlify` كامل (أو ارفع `Gaming-Backlog-Netlify.zip`).
3. بعد النشر تشتغل دالة HLTB على: `/api/hltb?name=Elden Ring`

> لأوقات HLTB على أي جهاز، نسخة PC تشير لدالة موقعك على Netlify. لو غيّرت رابط موقعك،
> عدّل سطر `HLTB_PROXY` داخل `Download-PC/index.html`.

## مصادر البيانات والخصوصية

- **RAWG**: البحث، الصور، التقييمات، التصنيفات.
- **HowLongToBeat**: أوقات القصة / +الإضافات / 100% (عبر دالة وسيطة — غير رسمي).
- **التخزين**: محلي فقط في متصفح كل مستخدم (`localStorage`). لا حسابات، لا إيميل، لا خادم بيانات.
- ملاحظة: البحث وإضافة ألعاب جديدة يحتاج إنترنت؛ بعد الإضافة المكتبة تفتح بدون تسجيل.

للتفاصيل التقنية وبنية المشروع: راجع [HANDOFF.md](HANDOFF.md).
