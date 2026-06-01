/**
 * 映画追加バッチ8 — 名作・高検索ボリューム 厳選25本
 *   npx tsx scripts/add-movies-batch8.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
function loadEnv() {
  try {
    const c = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const l of c.split("\n")) { const [k, ...r] = l.split("="); if (k && r.length) process.env[k.trim()] = r.join("=").trim(); }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TMDB_API_KEY) { console.error("❌ 設定確認"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY_JA: Record<string, string> = {
  JP: "日本", US: "アメリカ", FR: "フランス", GB: "イギリス",
  KR: "韓国", IT: "イタリア", DE: "ドイツ", CN: "中国", TW: "台湾",
  NO: "ノルウェー", IN: "インド", ES: "スペイン", MX: "メキシコ",
  PL: "ポーランド", CL: "チリ", AR: "アルゼンチン", IE: "アイルランド",
  HK: "香港", SE: "スウェーデン", DK: "デンマーク", NZ: "ニュージーランド",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // === 邦画・人気アニメ ===
  { slug: "ito-2020", query: "糸", year: 2020, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "the-first-slam-dunk", query: "THE FIRST SLAM DUNK", year: 2022, scenes: ["cry-alone", "heartwarming", "not-awkward"], genres: ["anime", "tearjerker"] },
  { slug: "one-piece-film-red", query: "ONE PIECE FILM RED", year: 2022, scenes: ["not-awkward", "home-date", "heartwarming"], genres: ["anime"] },
  { slug: "conan-zero-enforcer", query: "名探偵コナン ゼロの執行人", year: 2018, scenes: ["not-awkward", "home-date", "couple"], genres: ["anime", "suspense"] },
  { slug: "omoi-omaware", query: "思い、思われ、ふり、ふられ", year: 2020, scenes: ["youth", "before-dating", "heartwarming"], genres: ["youth", "romance"] },
  { slug: "mamorarenakatta", query: "護られなかった者たちへ", year: 2021, scenes: ["cry-alone", "home-date", "rainy-day"], genres: ["suspense", "tearjerker"] },
  { slug: "asausa-kid", query: "浅草キッド", year: 2021, scenes: ["cry-alone", "heartwarming", "not-awkward"], genres: ["tearjerker"] },
  { slug: "soshite-chichi-ni-naru", query: "そして父になる", year: 2013, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["tearjerker"] },
  // === ハリウッド名作 ===
  { slug: "shawshank-redemption", query: "The Shawshank Redemption", year: 1994, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["tearjerker"] },
  { slug: "forrest-gump", query: "Forrest Gump", year: 1994, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "interstellar-2014", query: "Interstellar", year: 2014, scenes: ["cry-alone", "home-date", "couple"], genres: ["tearjerker", "suspense"] },
  { slug: "leon-1994", query: "Léon: The Professional", year: 1994, scenes: ["home-date", "rainy-day", "couple"], genres: ["suspense", "tearjerker"] },
  { slug: "green-book-2018", query: "Green Book", year: 2018, scenes: ["heartwarming", "couple", "not-awkward"], genres: ["tearjerker", "comedy"] },
  { slug: "jojo-rabbit-2019", query: "Jojo Rabbit", year: 2019, scenes: ["heartwarming", "cry-alone", "not-awkward"], genres: ["tearjerker", "comedy", "youth"] },
  { slug: "coda-2021", query: "CODA", year: 2021, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["tearjerker", "youth"] },
  { slug: "nomadland-2020", query: "Nomadland", year: 2020, scenes: ["cry-alone", "rainy-day", "home-date"], genres: ["tearjerker"] },
  { slug: "get-out-2017", query: "Get Out", year: 2017, scenes: ["couple", "not-awkward", "home-date"], genres: ["horror", "suspense"] },
  { slug: "whiplash-2014", query: "Whiplash", year: 2014, scenes: ["not-awkward", "heartwarming", "couple"], genres: ["tearjerker", "youth"] },
  { slug: "sound-of-metal-2019", query: "Sound of Metal", year: 2019, scenes: ["cry-alone", "heartwarming", "rainy-day"], genres: ["tearjerker"] },
  { slug: "the-perks-of-being-a-wallflower", query: "The Perks of Being a Wallflower", year: 2012, scenes: ["youth", "cry-alone", "heartwarming"], genres: ["youth", "tearjerker"] },
  { slug: "moonrise-kingdom-2012", query: "Moonrise Kingdom", year: 2012, scenes: ["youth", "heartwarming", "before-dating"], genres: ["romance", "comedy", "youth"] },
  { slug: "moonlight-2016", query: "Moonlight", year: 2016, scenes: ["cry-alone", "home-date", "rainy-day"], genres: ["tearjerker", "youth"] },
  { slug: "lady-bird-2017", query: "Lady Bird", year: 2017, scenes: ["youth", "heartwarming", "cry-alone"], genres: ["youth", "tearjerker"] },
  { slug: "the-grand-budapest-hotel", query: "The Grand Budapest Hotel", year: 2014, scenes: ["not-awkward", "couple", "home-date"], genres: ["comedy"] },
  { slug: "the-farewell-2019", query: "The Farewell", year: 2019, scenes: ["cry-alone", "heartwarming", "home-date"], genres: ["tearjerker", "comedy"] },
];

function mapProvider(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("u-next") || n.includes("unext")) return "unext";
  if (n.includes("hulu")) return "hulu";
  if (n.includes("dmm")) return "dmm-tv";
  if (n.includes("abema")) return "abema";
  if (n.includes("lemino")) return "lemino";
  if (n.includes("amazon")) return "amazon-prime";
  return null;
}
async function tmdb(path: string) {
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}&language=ja-JP`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}
async function searchBest(query: string, year: number): Promise<number | null> {
  const data = await tmdb(`/search/movie?query=${encodeURIComponent(query)}`);
  const results: { id: number; release_date?: string; poster_path?: string }[] = data.results ?? [];
  if (results.length === 0) return null;
  let best = results[0], bestDiff = Infinity;
  for (const r of results) {
    const ry = r.release_date ? parseInt(r.release_date.slice(0, 4)) : 0;
    const diff = ry ? Math.abs(ry - year) : 999;
    const score = diff + (r.poster_path ? 0 : 5);
    if (score < bestDiff) { bestDiff = score; best = r; }
  }
  return best.id;
}

async function main() {
  console.log(`\n🎬 バッチ8 — ${ENTRIES.length}本\n`);
  const { data: services } = await supabase.from("vod_services").select("id, slug");
  const serviceIdBySlug = Object.fromEntries((services ?? []).map((s) => [s.slug, s.id]));
  const { data: genres } = await supabase.from("genres").select("id, slug");
  const genreIdBySlug = Object.fromEntries((genres ?? []).map((g) => [g.slug, g.id]));
  const { data: scenes } = await supabase.from("scenes").select("id, slug");
  const sceneIdBySlug = Object.fromEntries((scenes ?? []).map((s) => [s.slug, s.id]));

  let ok = 0, fail = 0, avail = 0;
  for (const e of ENTRIES) {
    try {
      const id = await searchBest(e.query, e.year);
      if (!id) { console.error(`❌ ヒットなし: ${e.query}`); fail++; continue; }
      const d = await tmdb(`/movie/${id}?append_to_response=watch/providers`);
      const cc = d.production_countries?.[0]?.iso_3166_1 ?? "";
      const country = COUNTRY_JA[cc] ?? d.production_countries?.[0]?.name ?? null;
      const movieData = {
        title: d.title ?? d.original_title, slug: e.slug,
        original_title: d.original_title !== d.title ? d.original_title : null,
        release_year: d.release_date ? parseInt(d.release_date.slice(0, 4)) : null,
        description: d.overview ?? null,
        summary: d.overview ? d.overview.slice(0, 140).replace(/。[^。]*$/, "。") : null,
        runtime_minutes: d.runtime || null, country,
        poster_url: d.poster_path ? `${TMDB_IMG}${d.poster_path}` : null,
      };
      const { data: movie, error: mErr } = await supabase.from("movies").upsert(movieData, { onConflict: "slug" }).select("id").single();
      if (mErr || !movie) { console.error(`❌ ${e.slug}: ${mErr?.message}`); fail++; continue; }
      const movieId = movie.id;
      const tmdbGenres = (d.genres ?? []).map((g: { id: number }) => TMDB_GENRE_MAP[g.id]).filter(Boolean);
      for (const slug of [...new Set([...e.genres, ...tmdbGenres])]) {
        if (genreIdBySlug[slug]) await supabase.from("movie_genres").upsert({ movie_id: movieId, genre_id: genreIdBySlug[slug] }, { onConflict: "movie_id,genre_id" });
      }
      for (const slug of e.scenes) {
        if (sceneIdBySlug[slug]) await supabase.from("movie_scenes").upsert({ movie_id: movieId, scene_id: sceneIdBySlug[slug] }, { onConflict: "movie_id,scene_id" });
      }
      await supabase.from("movie_availability").delete().eq("movie_id", movieId);
      const jp = d["watch/providers"]?.results?.JP ?? {};
      const best: Record<string, string> = {};
      for (const [type, list] of [["見放題", jp.flatrate], ["レンタル", jp.rent], ["購入", jp.buy]] as const) {
        for (const p of (list ?? []) as { provider_name: string }[]) {
          const s = mapProvider(p.provider_name);
          if (s && (!best[s] || TIER[type] > TIER[best[s]])) best[s] = type;
        }
      }
      const recs = Object.entries(best).filter(([s]) => serviceIdBySlug[s]).map(([s, t]) => ({
        movie_id: movieId, vod_service_id: serviceIdBySlug[s], availability_type: t, is_available: true, checked_at: new Date().toISOString(),
      }));
      if (recs.length) { await supabase.from("movie_availability").insert(recs); avail += recs.length; }
      console.log(`✅ ${e.slug.padEnd(36)} id=${id} (${movieData.release_year}) ${movieData.title} [配信${recs.length}]`);
      ok++;
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) { console.error(`❌ ${e.slug}: ${(err as Error).message}`); fail++; }
  }
  console.log(`\n📊 完了: ${ok}本 / ${fail}失敗 / 配信${avail}件`);
  const { count } = await supabase.from("movies").select("*", { count: "exact", head: true });
  console.log(`📦 総数: ${count}本`);
}
main().catch(console.error);
