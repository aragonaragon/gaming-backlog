# HANDOFF

هذا الملف يشرح حالة المشروع الحالية لأي مطور/وكيل يستلمه بعد الآن.

## ملخص ما تم

تم تحويل المشروع إلى أداة Gaming Backlog جاهزة بنسختين:

- نسخة نشر على Netlify داخل `Netlify/`.
- نسخة PC محلية داخل `Download-PC/`.

تم تغيير الشكل السابق بالكامل إلى واجهة gaming dashboard داكنة بزخرفة زرقاء/سماوية، وإضافة مميزات ناقصة من الوعد التسويقي:

- زر `اقترح لي لعبة`.
- عرض `حسب التصنيف`.
- إخفاء الهيرو/المقدمة تلقائياً عندما توجد ألعاب في المكتبة.
- Demo seed عبر `?demo=1`.
- ZIP جاهز لكل نسخة.

## الملفات المهمة

### جذر المشروع

- `README.md`  
  شرح الاستخدام والنشر للمستخدم.

- `HANDOFF.md`  
  هذا الملف.

- `Gaming-Backlog-Netlify.zip`  
  ZIP جاهز لرفع نسخة Netlify.

- `Gaming-Backlog-PC.zip`  
  ZIP جاهز لمشاركة نسخة PC.

### نسخة Netlify

- `Netlify/index.html`  
  التطبيق كامل: HTML + CSS + JavaScript في ملف واحد.

- `Netlify/assets/game-library-hero.png`  
  صورة مولدة بـ imagegen ومستخدمة في الهيرو/الحالة الفارغة.

- `Netlify/netlify/functions/hltb.mjs`  
  Netlify Function تعمل كوسيط HowLongToBeat على `/api/hltb`.

- `Netlify/netlify.toml`  
  إعدادات Netlify.

- `Netlify/اقرأني.txt`  
  تعليمات عربية قديمة/مفيدة للنشر.

### نسخة PC

- `Download-PC/index.html`  
  نسخة مطابقة تقريباً من `Netlify/index.html`.

- `Download-PC/server.mjs`  
  سيرفر Node.js محلي يخدم الملفات ويمرر `/api/hltb`.

- `Download-PC/hltb.mjs`  
  نسخة من وسيط HLTB.

- `Download-PC/start-backlog.bat`  
  مشغل Windows: يفتح المتصفح ويشغل السيرفر المحلي.

- `Download-PC/README-PC.txt`  
  تعليمات مستخدم PC.

## المنطق الحالي

التخزين:

- المفتاح: `backlog_lib_v1`
- المكان: `localStorage`
- لا يوجد backend ولا حسابات.

البحث:

- RAWG API داخل `Netlify/index.html`.
- المفتاح الحالي موجود في:

```js
const RAWG_KEY = "031db013391842b4b38ab2ca874f98c5";
```

HLTB:

- في Netlify:

```js
const HLTB_PROXY = "/api/hltb";
```

- في PC يعمل نفس المسار عبر `Download-PC/server.mjs`.

Demo:

- فتح الصفحة مع `?demo=1` يستدعي `seedDemoLibrary()` ويملأ `localStorage` بعشر ألعاب وهمية.
- بعدها يتم إزالة query من الرابط عبر `history.replaceState`.

## مميزات الواجهة المضافة

`اقترح لي لعبة`:

- يستعمل `balancedSort`.
- يختار أفضل لعبة من الألعاب التي حالتها `backlog`.
- يبرز الكرت بإضافة class `recommended`.
- يمرر الصفحة للكرت المقترح.

`حسب التصنيف`:

- `filter.view` يدعم:
  - `grid`
  - `genre`
- في وضع `genre` يتم التجميع حسب أول تصنيف للعبة أو التصنيف المحدد في الفلتر.

`has-library`:

- `paint()` يضيف أو يزيل class على `body`.
- CSS يخفي `.hero-panel` عند وجود ألعاب:

```css
body.has-library .hero-panel { display:none; }
```

## أوامر اختبار سريعة

تشغيل Netlify محلياً:

```powershell
python -m http.server 5601 --directory Netlify
```

فتح demo:

```text
http://localhost:5601/?demo=1
```

تشغيل PC:

```powershell
cd Download-PC
node server.mjs
```

فتح demo:

```text
http://localhost:5620/?demo=1
```

اختبار HLTB:

```text
http://localhost:5601/api/hltb?name=Elden Ring
http://localhost:5620/api/hltb?name=Elden Ring
```

ملاحظة: على `python -m http.server` لن تعمل دالة `/api/hltb` لأنها تحتاج Netlify أو سيرفر PC. البحث والمكتبة يعملان.

## آخر تحقق تم

تم التحقق عبر المتصفح المحلي من:

- `http://localhost:5601/?demo=1`
- `http://localhost:5620/?demo=1`

نتائج التحقق:

- تظهر 10 ألعاب demo.
- لا يوجد overflow أفقي.
- لا توجد console errors.
- زر الاقتراح موجود ويعمل.
- عرض حسب التصنيف موجود ويعمل.
- نسخة PC ترجع `200` للصفحة وللصورة.

## ملاحظات مهمة للمطور القادم

- لا تكسر IDs الحالية مثل `gameSearch`, `results`, `bento`, `grid`, `genre`, `sort`, `statusSeg`; JavaScript يعتمد عليها.
- التطبيق لا يستخدم bundler. أي تعديل في الواجهة يتم مباشرة داخل `index.html`.
- عند تعديل نسخة Netlify، انسخ التغيير إلى `Download-PC/index.html` أو أعد نسخ الملف حتى تبقى النسختان متطابقتين.
- بعد أي تعديل نهائي، أعد إنشاء ZIPs:

```powershell
Compress-Archive -Path "Netlify\*" -DestinationPath "Gaming-Backlog-Netlify.zip" -Force
Compress-Archive -Path "Download-PC\*" -DestinationPath "Gaming-Backlog-PC.zip" -Force
```

- HLTB غير رسمي وقد يتعطل إذا غيّر الموقع آلية API. الملف المعني:

```text
Netlify/netlify/functions/hltb.mjs
Download-PC/hltb.mjs
```

## أفكار لاحقة اختيارية

- زر حذف كل بيانات demo.
- استيراد قائمة ألعاب من ملف CSV.
- مزامنة اختيارية بكود PIN.
- بناء PC حقيقي كـ Electron أو Tauri بدلاً من سيرفر Node + متصفح.

