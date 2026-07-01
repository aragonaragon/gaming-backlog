# HANDOFF

حالة المشروع لأي مطوّر/وكيل يستلمه لاحقاً. آخر تحديث: واجهة **v2 (app shell بشريط جانبي)**.

## ملخص سريع

أداة **Gaming Backlog** — موقع/تطبيق ملف واحد (HTML+CSS+JS، بدون bundler، بدون backend،
بدون حسابات). البيانات تُحفظ محلياً في `localStorage`. البحث من RAWG، وأوقات HowLongToBeat
عبر دالة وسيطة.

الواجهة v2 = **app shell**: شريط جانبي يمين (RTL) للتنقّل بين صفحات (views)، ومنطقة رئيسية
تعرض الصفحة الحالية. توجد ثلاث نسخ متطابقة من `index.html` تختلف فقط في سطر `HLTB_PROXY`.

## بنية المشروع

```
جذر المستودع (git repo عام: github.com/aragonaragon/gaming-backlog)
├─ README.md            شرح للمستخدم
├─ HANDOFF.md           هذا الملف
├─ .gitignore           يتجاهل *.zip + إعدادات محلية
├─ .claude/launch.json  تشغيل المعاينة (python http.server على Download-PC)
├─ Netlify/             نسخة النشر
│   ├─ index.html                      التطبيق (HLTB_PROXY="/api/hltb")
│   ├─ netlify.toml                    إعدادات + مجلد الدوال
│   ├─ assets/game-library-hero.png    صورة الحالة الفارغة
│   ├─ netlify/functions/hltb.mjs      دالة وسيط HowLongToBeat
│   └─ اقرأني.txt                       تعليمات نشر عربية
├─ Download-PC/         نسخة PC (ملف واحد)
│   ├─ index.html                      (HLTB_PROXY = رابط Netlify المطلق)
│   ├─ start-backlog.bat               يفتح index.html بالمتصفح
│   ├─ README-PC.txt
│   └─ assets/game-library-hero.png
├─ docs/                نسخة GitHub Pages (تُنشر تلقائياً)
│   ├─ index.html                      (HLTB_PROXY = "")
│   ├─ assets/game-library-hero.png
│   └─ .nojekyll
└─ Gaming-Backlog-*.zip  حزم التوزيع (خارج git، مرفوعة كـ Release)
```

## النشر / الاستضافة

- **GitHub**: repo عام. أي `git push` يحدّث نسخة **GitHub Pages** تلقائياً (من `docs/`).
- **GitHub Pages**: https://aragonaragon.github.io/gaming-backlog/ (يخدم `docs/`).
- **Netlify**: https://backlogforever.netlify.app/ — **نشر يدوي** (سحب مجلد `Netlify`
  أو رفع الـZIP). ⚠️ لا يتحدّث تلقائياً عند push إلا لو رُبط بالـrepo.
- **Releases**: الـZIPs مرفوعة على releases (v1.0). حدّثها عند إصدار جديد.

## النسخ الثلاث و HLTB_PROXY

الملف واحد ومتطابق في النسخ الثلاث، الفرق الوحيد سطر `HLTB_PROXY`:

| النسخة | `HLTB_PROXY` | أوقات HLTB |
|--------|--------------|-----------|
| `Netlify/index.html` | `"/api/hltb"` | نعم (دالة نفس الدومين) |
| `Download-PC/index.html` | `"https://backlogforever.netlify.app/api/hltb"` | نعم (دالة Netlify عن بُعد، CORS `*`) |
| `docs/index.html` | `""` | لا (متوسط RAWG فقط — Pages لا تشغّل دوال) |

**عند تعديل الواجهة:** عدّل `Netlify/index.html` ثم زامن للنسختين الأخريين مع ضبط `HLTB_PROXY`،
ثم أعد بناء الـZIPs. أمر المزامنة + الـZIP (PowerShell من الجذر):
```powershell
$src = Get-Content "Netlify\index.html" -Raw
($src -replace 'const HLTB_PROXY = "/api/hltb";', 'const HLTB_PROXY = "https://backlogforever.netlify.app/api/hltb";') | Set-Content "Download-PC\index.html" -Encoding utf8 -NoNewline
($src -replace 'const HLTB_PROXY = "/api/hltb";', 'const HLTB_PROXY = "";') | Set-Content "docs\index.html" -Encoding utf8 -NoNewline
Compress-Archive -Path "Netlify\*"    -DestinationPath "Gaming-Backlog-Netlify.zip" -Force
Compress-Archive -Path "Download-PC\*" -DestinationPath "Gaming-Backlog-PC.zip" -Force
```

## المعمارية (داخل index.html)

- **بدون bundler** — كل شيء inline في `index.html`. الأنماط في `<style>`، المنطق في `<script>`.
- **الحالة (State):**
  - `LIBRARY` — مصفوفة الألعاب (localStorage: `backlog_lib_v1`).
  - `profile` — `{name}` (localStorage: `backlog_profile_v1`).
  - `currentView` — الصفحة الظاهرة: `dashboard|backlog|playing|done|wishlist|collections|stats|settings`.
  - `filter` — `{q, genre, sort, view}` (فلترة/ترتيب المكتبة).
  - `RAWG_KEY` = مفتاح RAWG المجاني، `HLTB_PROXY` = رابط دالة HLTB.
- **نموذج اللعبة (game object):**
  `{id, name, slug, rating, ratings_count, metacritic, year, genres[], image, playtime,`
  `customHours, status, progress, added, touched, hltb:{main,mainExtra,completionist}}`
  - `status`: `backlog | playing | done | wishlist`.
  - `progress`: 0–100 (للألعاب قيد اللعب).
  - `lenOf(g)` = `customHours ?? hltb.main ?? playtime` (المدة المعتمدة للترتيب/الخطة).
  - معرّفات RAWG أرقام، وأي معرّف يُقارن كنص (`String(x.id)===`).

## موجّه الصفحات (view router)

- `renderView()` يبني `#view.innerHTML` حسب `currentView` عبر دوال:
  `viewDashboard() · viewLibrary(status) · viewCollections() · viewStats() · viewSettings()`.
- `paint()` = `renderSidebar()` + `renderView()`. `go(v)` يغيّر الصفحة ويعيد الرسم.
- `paintSoon()` يجمّع الرسم (يمنع وميض تحديثات HLTB الخلفية).

## نموذج الأحداث (event delegation)

مهم عند التعديل — التفويض على ثلاثة مستويات:
- `document` → أي عنصر فيه `data-nav` = تنقّل بين الصفحات (`go()`). (عناصر الشريط الجانبي + روابط داخلية.)
- `#view` click:
  1. `[data-open]` → يفتح صفحة حالة اللعبة (بطاقات "ألعابك"/"آخر ما لعبت").
  2. `[data-act]` → أزرار بطاقة "أكمل اللعب": `startnext | shuffle | plan`.
  3. `[data-a]` **خارج** `.card` → أزرار التولبار/الإعدادات: `pick | export | import | demo | clear | saveProfile`.
  4. `[data-a]` **داخل** `.card` → أفعال البطاقة: `edithours | wish | del | playing | done` + `hsave/hcancel`.
- `#view` input/change → `filterSearch`, `genre`, `sort`, `viewMode`, `importFile`, و`.progrange` (شريط التقدّم).

> IDs/هياكل يعتمد عليها JS ولا تكسرها: `#gameSearch #results #searchbox #sicon #view #sideNav
> #sideProfile #overlay #hpw #strategy #planSummary #planList #importFile #profName #hinp #toast`،
> وكلاسات `.card .continue .progrange .nav-item`، وسمات `data-nav / data-act / data-a / data-open / data-id / data-filter`.

## المميزات وأماكنها في الكود

- **البحث + الإضافة:** `doSearch / renderResults / addGame` (RAWG، أعلى الصفحة).
- **HLTB:** `fetchHLTB / backfillHLTB` (تجيب عند الإضافة + للناقص عند الإقلاع؛ circuit-breaker يوقف بعد 4 أخطاء).
- **الرئيسية:** `viewDashboard` — continue (لعبة قيد اللعب وإلا اقتراح من القائمة) + `continueCard` + دونات + بطاقات إحصائية + آخر ما لعبت + بانر إنجاز.
- **Wishlist:** حالة رابعة؛ زر 🔖 (`data-a="wish"`) يبدّلها.
- **شريط التقدّم:** `game.progress` عبر `.progrange` (يُحدَّث بدون إعادة رسم كاملة).
- **الإحصائيات/الإنجازات/المستوى:** `stat()` + مصفوفة `ACH` + `achState()` + `xpLevel()` (كلها مشتقّة محلياً، بدون تخزين إضافي) → `viewStats`.
- **البروفايل:** `profile.name` يظهر بالشريط الجانبي؛ يُحرَّر في الإعدادات (`saveProfile`).
- **الاقتراح:** `doPick` (يستخدم `balancedSort`، يبرز البطاقة بـ`recommended`).
- **الخطة:** `openPlan / buildPlan` (modal `#overlay`).
- **تصدير/استيراد:** `doExport / importFile` (JSON).
- **Demo:** `?demo=1` → `seedDemoLibrary()` (10 ألعاب بأغلفة SVG) ثم يمسح الـquery.

## HLTB (مهم — هش)

- الملف: `Netlify/netlify/functions/hltb.mjs` (Netlify Function v2؛ نسخة PC تستدعيها عن بُعد).
- HowLongToBeat بدون API رسمي؛ الآلية الحالية (تتغيّر دورياً): اكتشاف اسم الإندبوينت من
  chunks الموقع (حالياً `bleed`) ثم `GET /api/<word>/init` → `{token,hpKey,hpVal}` ثم
  `POST /api/<word>` بهيدرات `x-auth-token/x-hp-key/x-hp-val` + حقن `body[hpKey]=hpVal`.
- لو تعطّل: عدّل أنماط الاكتشاف داخل `hltb.mjs`. الموقع لا يتعطّل — يرجع لمتوسط RAWG.

## اختبار سريع

```text
Netlify محلياً:  python -m http.server 5601 --directory Netlify   →  http://localhost:5601/?demo=1
نسخة PC:         افتح Download-PC/index.html (أو start-backlog.bat) + ?demo=1
دالة HLTB حيّة:   https://backlogforever.netlify.app/api/hltb?name=Elden Ring
```
تم التحقق (v2): 10 ألعاب demo، تنقّل بين كل الصفحات، Wishlist/التقدّم/الاقتراح/حفظ البروفايل،
جلب HLTB حيّ في الواجهة، بدون console errors.

## أفكار لاحقة

- مزامنة سحابية اختيارية (username + PIN) للدخول من أي جهاز.
- إنجازات إضافية / شارات.
- استيراد من CSV.
- ربط Netlify بالـrepo لنشر تلقائي.
