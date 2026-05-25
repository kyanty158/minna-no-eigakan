/**
 * 映画追加バッチ4 — 200本到達のための残り20本
 *   npx tsx scripts/add-movies-batch4.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TMDB_API_KEY) {
  console.error("❌ .env.local の SUPABASE / TMDB 設定を確認してください");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const COUNTRY_JA: Record<string, string> = {
  JP: "日本", US: "アメリカ", FR: "フランス", GB: "イギリス",
  KR: "韓国", IT: "イタリア", DE: "ドイツ", CN: "中国", TW: "台湾",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // ── 検索修正・Her など ──
  { slug: "her-2013", query: "Her", year: 2013, scenes: ["couple", "home-date", "after-breakup"], genres: ["romance", "suspense"] },
  { slug: "on-your-wedding-day-kr", query: "On Your Wedding Day", year: 2018, scenes: ["couple", "heartwarming", "anniversary"], genres: ["romance", "comedy", "korean-drama"] },

  // ── 日本映画・残り ──
  { slug: "mare-movie", query: "まれ", year: 2015, scenes: ["heartwarming", "home-date"], genres: ["tearjerker"] },
  { slug: "my-tomorrow-your-yesterday", query: "ぼくは明日、昨日のきみとデートする 2016", year: 2016, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "koto-no-ha-no-niwa", query: "言の葉の庭", year: 2013, scenes: ["couple", "rainy-day", "heartwarming"], genres: ["anime", "romance"] },
  { slug: "the-garden-of-words", query: "The Garden of Words", year: 2013, scenes: ["couple", "rainy-day", "heartwarming"], genres: ["anime", "romance"] },
  { slug: "flavors-of-youth", query: "詩季織々", year: 2018, scenes: ["heartwarming", "home-date", "couple"], genres: ["anime", "romance"] },
  { slug: "irodori-movie", query: "彩り", year: 2022, scenes: ["heartwarming", "home-date"], genres: ["tearjerker"] },
  { slug: "hana-yori-dango-movie", query: "花より男子ファイナル", year: 2008, scenes: ["couple", "anniversary", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "boys-over-flowers-movie", query: "花より男子 ファイナル", year: 2008, scenes: ["couple", "anniversary", "heartwarming"], genres: ["romance", "comedy"] },

  // ── 海外恋愛・その他 ──
  { slug: "two-weeks-notice", query: "Two Weeks Notice", year: 2002, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "music-and-lyrics", query: "Music and Lyrics", year: 2007, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "just-go-with-it", query: "Just Go With It", year: 2011, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "enchanted-2007", query: "魔法にかけられて", year: 2007, scenes: ["couple", "heartwarming", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "mamma-mia", query: "マンマ・ミーア！", year: 2008, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "my-big-fat-greek-wedding", query: "My Big Fat Greek Wedding", year: 2002, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "pretty-woman-1990", query: "Pretty Woman", year: 1990, scenes: ["couple", "heartwarming", "anniversary"], genres: ["romance", "comedy"] },

  // ── アニメ映画・最終 ──
  { slug: "belle-mamoru-hosoda", query: "竜とそばかすの姫", year: 2021, scenes: ["couple", "heartwarming", "home-date"], genres: ["anime", "romance"] },
  { slug: "i-want-to-eat-your-pancreas", query: "君の膵臓をたべたい アニメ", year: 2018, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["anime", "romance", "tearjerker"] },
  { slug: "irodori-colors", query: "色づく世界の明日から", year: 2019, scenes: ["couple", "youth", "heartwarming"], genres: ["anime", "romance", "youth"] },
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
  console.log(`\n🎬  映画追加バッチ4 — ${ENTRIES.length}本\n`);

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
      if (!id) { console.error(`❌ 検索ヒットなし: ${e.query}`); fail++; continue; }

      const d = await tmdb(`/movie/${id}?append_to_response=watch/providers`);
      const countryCode = d.production_countries?.[0]?.iso_3166_1 ?? "";
      const country = COUNTRY_JA[countryCode] ?? d.production_countries?.[0]?.name ?? null;

      const movieData = {
        title: d.title ?? d.original_title,
        slug: e.slug,
        original_title: d.original_title !== d.title ? d.original_title : null,
        release_year: d.release_date ? parseInt(d.release_date.slice(0, 4)) : null,
        description: d.overview ?? null,
        summary: d.overview ? d.overview.slice(0, 140).replace(/。[^。]*$/, "。") : null,
        runtime_minutes: d.runtime || null,
        country,
        poster_url: d.poster_path ? `${TMDB_IMG}${d.poster_path}` : null,
      };

      const { data: movie, error: mErr } = await supabase
        .from("movies").upsert(movieData, { onConflict: "slug" }).select("id").single();
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

      console.log(`✅ ${e.slug.padEnd(40)} id=${id} (${movieData.release_year}) ${movieData.title}  [配信${recs.length}]`);
      ok++;
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) {
      console.error(`❌ ${e.slug}: ${(err as Error).message}`); fail++;
    }
  }

  console.log(`\n📊  完了: ${ok}本追加 / ${fail}件失敗 / 配信情報${avail}件\n`);

  // 総数確認
  const { count } = await supabase.from("movies").select("*", { count: "exact", head: true });
  console.log(`📦  DB内の映画総数: ${count}本`);
}

main().catch(console.error);
