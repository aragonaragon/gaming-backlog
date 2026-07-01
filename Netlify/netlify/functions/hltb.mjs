/* ============================================================================
   HowLongToBeat proxy — Netlify Function (v2)
   المسار: /api/hltb?name=<اسم اللعبة>     (نفس دومين الموقع — بدون CORS)
   ----------------------------------------------------------------------------
   يسوي نفس تدفق HLTB الحالي المكوّن من خطوتين:
     1) يكتشف اسم الإندبوينت من جافاسكربت موقعهم  ->  مثلاً "bleed"
     2) GET  /api/<word>/init?t=<ms>   ->  { token, hpKey, hpVal }
     3) POST /api/<word>  بهيدرات x-auth-token/x-hp-key/x-hp-val + body[hpKey]=hpVal
   يرجّع: { matched, name, main, mainExtra, completionist }  (بالساعات)
   غير رسمي — لو HLTB غيّر آليته، عدّل الأنماط بالأسفل.
   ============================================================================ */

const BASE = "https://howlongtobeat.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
         + "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let WORD = null;               // اسم الإندبوينت (يُخزّن داخل النسخة الدافئة)
const CACHE = new Map();       // كاش بسيط في الذاكرة

const hdr = () => ({ "User-Agent": UA, "Referer": BASE + "/" });

function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}
function similarity(a, b) {
  a = norm(a); b = norm(b);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = new Set(a.split(" ")), B = new Set(b.split(" "));
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
}

async function findEndpointWord() {
  const html = await (await fetch(BASE + "/", { headers: hdr() })).text();
  const chunks = [...new Set(html.match(/\/_next\/static\/chunks\/[A-Za-z0-9_\-]+\.js/g) || [])];
  const texts = await Promise.all(
    chunks.map(c => fetch(BASE + c, { headers: hdr() }).then(r => r.text()).catch(() => ""))
  );
  for (const js of texts) {
    const m = js.match(/fetch\(\s*[`"']\/api\/([a-z0-9]+)\/init/i);
    if (m) return m[1];
  }
  throw new Error("HLTB endpoint word not found");
}
async function getWord(force) {
  if (WORD && !force) return WORD;
  WORD = await findEndpointWord();
  return WORD;
}

function buildPayload(name) {
  return {
    searchType: "games",
    searchTerms: norm(name).split(" ").filter(Boolean),
    searchPage: 1, size: 20,
    searchOptions: {
      games: {
        userId: 0, platform: "", sortCategory: "popular",
        rangeCategory: "main", rangeTime: { min: null, max: null },
        gameplay: { perspective: "", flow: "", genre: "", difficulty: "" },
        rangeYear: { min: "", max: "" }, modifier: "",
      },
      users: { sortCategory: "postcount" },
      lists: { sortCategory: "follows" },
      filter: "", sort: 0, randomizer: 0,
    },
    useCache: true,
  };
}

function pickBest(name, data) {
  let best = data[0], score = -1;
  for (const d of data) {
    const s = similarity(name, d.game_name || "");
    if (s > score) { score = s; best = d; }
  }
  const hrs = sec => (sec ? Math.round((sec / 3600) * 10) / 10 : null);
  return {
    matched: true, name: best.game_name,
    main: hrs(best.comp_main), mainExtra: hrs(best.comp_plus),
    completionist: hrs(best.comp_100), similarity: Math.round(score * 100) / 100,
  };
}

async function searchHLTB(name) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const word = await getWord(attempt === 1);

    const init = await fetch(`${BASE}/api/${word}/init?t=${Date.now()}`, { headers: hdr() });
    if (init.status === 404 && attempt === 0) continue;
    if (!init.ok) throw new Error("init http " + init.status);
    const sec = await init.json();

    const body = buildPayload(name);
    if (sec.hpKey != null) body[sec.hpKey] = sec.hpVal;

    const res = await fetch(`${BASE}/api/${word}`, {
      method: "POST",
      headers: {
        ...hdr(), "Content-Type": "application/json", "Origin": BASE,
        "x-auth-token": sec.token || "",
        "x-hp-key": String(sec.hpKey), "x-hp-val": String(sec.hpVal),
      },
      body: JSON.stringify(body),
    });
    if (res.status === 404 && attempt === 0) continue;
    if (!res.ok) throw new Error("search http " + res.status);

    const data = (await res.json()).data || [];
    return data.length ? pickBest(name, data) : { matched: false };
  }
  throw new Error("HLTB search failed");
}

export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  const headers = { ...cors, "Content-Type": "application/json; charset=utf-8" };
  if (!name) return new Response(JSON.stringify({ error: "missing ?name=" }), { status: 400, headers });

  if (CACHE.has(name)) return new Response(JSON.stringify(CACHE.get(name)), { headers });

  try {
    const result = await searchHLTB(name);
    if (result.matched) CACHE.set(name, result);
    return new Response(JSON.stringify(result), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ matched: false, error: String(e) }), { status: 502, headers });
  }
};

export const config = { path: "/api/hltb" };
